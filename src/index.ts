import { readFile } from 'fs/promises';
import type { SearchTransactionResponse, AddTransactionRequest, GetAccountInfoResponse, Transaction } from './firefly.model'
import { authenticateUser, getWalletTransactionsIterator, getWalletInfo, type ProductCode } from './pluxee-services';

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
  after?: string
}

type NumericKeys<T> = {
  [K in keyof T]: Required<T>[K] extends number ? K : never;
}[keyof T];
const accountMapping = new Map<ProductCode, NumericKeys<Options>>([
  ['ECP', 'conso'],
  ['EEP', 'eco'],
  ['EGP', 'gift'],
  ['ELP', 'lunch'],
  ['ECO', 'sportCulture']
]);

async function loadOptions(path: string) {
  return JSON.parse(await readFile(path, 'utf8')) as Options;
}

async function check({ login, password, url: baseUrl, token: fireflyToken, after, ...options }: Options) {
  console.info('Check Pluxee');
  const token = await authenticateUser(login, password);
  const { listOfProducts } = await getWalletInfo(token);
  for (const { productCode, balance } of listOfProducts) {
    const type = accountMapping.get(productCode);
    if (!type) continue;
    const accountId = options[type];
    if (!accountId) continue;

    for await (const record of getWalletTransactionsIterator(token, productCode)) {
      if (!record.amount || !('type' in record)) continue;
      if (after && record.date <= after) continue;

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
        date: record.date,
        external_id: externalId,
        tags: ['Pluxee']
      };
      if (record.type === 'SPENDING') {
        const { affiliateName, city } = record;
        transaction.type = 'withdrawal';
        transaction.source_id = accountId.toString();
        transaction.destination_name = affiliateName;
        transaction.description = `${affiliateName}, ${city}`;
      } else if (record.type === 'DEPOSIT') {
        const { faceValue, numberOfUnit, clientName } = record;
        transaction.type = 'deposit';
        transaction.source_name = clientName;
        transaction.description = `${clientName}: ${numberOfUnit} x ${faceValue.toFixed(2)} € = ${(numberOfUnit * faceValue).toFixed(2)}`;
        transaction.destination_id = accountId.toString();
      } else {
        console.warn(`Unmanaged transaction type: ${record.type}`);
        continue;
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

    const { data: { attributes: { current_balance: currentBalanceText, virtual_balance: virtualBalance } } } = await fetch(
      new URL(`/api/v1/accounts/${options[type]}`, baseUrl),
      { headers: { Authorization: `Bearer ${fireflyToken}` } }).then(async r => await r.json() as GetAccountInfoResponse);

    const currentBalance = parseFloat(currentBalanceText);
    if (balance !== currentBalance) {
      await fetch(
        new URL(`/api/v1/accounts/${options[type]}`, baseUrl),
        {
          method: 'put',
          body: JSON.stringify({ virtual_balance: balance - currentBalance + parseFloat(virtualBalance) }),
          headers: {
            Authorization: `Bearer ${fireflyToken}`,
            'Content-Type': 'application/json'
          }
        });
    }
  }
}

loadOptions(process.env.OPTION_FILE ?? '/data/options.json')
  .then(async options => {
    CronJob.from({
      cronTime: options.cron,
      onTick: async () => { await check(options); }
    }).start();
  })
  .catch((error) => {
    console.error('Unable to load options\n', error);
    process.exit(1);
  })
