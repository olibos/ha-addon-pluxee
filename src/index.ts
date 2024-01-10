import { readFile } from 'fs/promises';
import type { SearchTransactionResponse, AddTransactionRequest, GetAccountInfoResponse, Transaction } from './firefly.model'
import { authenticateUser, getAccountEvents, getWalletInfo, type ProductType } from './pluxee-services';

import { CronJob } from 'cron';
type Options = {
  login: string
  password: string
  url: string
  token: string
  cron: string
  book?: number
  eco?: number
  gift?: number
  lunch?: number
  sportCulture?: number
  transport?: number
  conso?: number
}

type NumericKeys<T> = {
  [K in keyof T]: Required<T>[K] extends number ? K : never;
}[keyof T];
const accountMapping = new Map<ProductType, NumericKeys<Options>>([
  ['BOOK', 'book'],
  ['CONSO', 'conso'],
  ['ECO', 'eco'],
  ['GIFT', 'gift'],
  ['LUNCH', 'lunch'],
  ['SPORT_CULTURE', 'sportCulture'],
  ['TRANSPORT', 'transport']
]);

async function loadOptions(path: string) {
  return JSON.parse(await readFile(path, 'utf8')) as Options;
}

async function check({ login, password, url: baseUrl, token: fireflyToken, ...options }: Options) {
  console.info('Check Pluxee');
  const token = await authenticateUser(login, password);
  const { balances } = await getWalletInfo(token);
  for (const { productType, amountAvailable } of balances) {
    const type = accountMapping.get(productType);
    if (!type) continue;
    const accountId = options[type];
    if (!accountId) continue;

    for await (const record of getAccountEvents(token, productType)) {
      const externalId = `pluxee_${record.id}`;
      const searchTransactionResponse = await fetch(
        new URL(`/api/v1/search/transactions?query=external_id%3A%22${externalId}%22&page=1`, baseUrl),
        {
          headers: { Authorization: `Bearer ${fireflyToken}` }
        });
      const searchTransactionResult = await searchTransactionResponse.json() as SearchTransactionResponse;
      const transactionId = searchTransactionResult.data[0]?.id;
      if (transactionId) break;

      const transaction: Partial<Transaction> = {
        amount: Math.abs(record.amount).toFixed(2),
        date: record.time,
        external_id: externalId,
        tags: ['Pluxee']
      };
      if ('transaction' in record) {
        const { to, city } = record.transaction;
        transaction.type = 'withdrawal';
        transaction.source_id = accountId.toString();
        transaction.destination_name = to;
        transaction.description = `${to}, ${city}`;
      } else if ('order' in record) {
        const { unitPrice, units, from } = record.order;
        transaction.type = 'deposit';
        transaction.source_name = from;
        transaction.description = `${from}: ${units} x ${unitPrice.toFixed(2)} € = ${(units * unitPrice).toFixed(2)}`;
        transaction.destination_id = accountId.toString();
      }

      await fetch(
        new URL('/api/v1/transactions', baseUrl),
        {
          method: 'post',
          headers: {
            Authorization: `Bearer ${fireflyToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            error_if_duplicate_hash: false,
            transactions: [transaction]
          } satisfies AddTransactionRequest)
        });
    }

    const { data: { attributes: { current_balance: currentBalance, virtual_balance: virtualBalance } } } = await fetch(
      new URL(`/api/v1/accounts/${options[type]}`, baseUrl),
      { headers: { Authorization: `Bearer ${fireflyToken}` } }).then(async r => await r.json() as GetAccountInfoResponse);

    const balance = parseFloat(currentBalance);
    if (balance !== amountAvailable) {
      await fetch(
        new URL(`/api/v1/accounts/${options[type]}`, baseUrl),
        {
          method: 'put',
          body: JSON.stringify({ virtual_balance: amountAvailable - balance + parseFloat(virtualBalance) }),
          headers: {
            Authorization: `Bearer ${fireflyToken}`,
            'Content-Type': 'application/json'
          }
        });
    }
  }
}

loadOptions(process.env.OPTION_FILE ?? '/data/options.json')
  .then(options => {
    CronJob.from({
      cronTime: options.cron,
      onTick: async () => { await check(options); }
    }).start();
  })
  .catch((error) => {
    console.error('Unable to load options\n', error);
    process.exit(1);
  })
