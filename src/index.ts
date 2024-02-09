import { readFile } from 'fs/promises';
import type { SearchTransactionResponse, AddTransactionRequest, GetAccountInfoResponse, Transaction } from './firefly.model'
import { authenticateUser, getWalletTransactionsIterator, getWalletInfo, type ProductCode, type WalletTransaction } from './pluxee-services';

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
  [K in keyof T]-?: Required<T>[K] extends number ? K : never;
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

function toFireflyTransaction(pluxeeTransaction: WalletTransaction, externalId: string, accountId: number) {
  if (!pluxeeTransaction.amount) return null;

  const transaction: Partial<Transaction> = {
    amount: Math.abs(pluxeeTransaction.amount).toFixed(2),
    date: pluxeeTransaction.date,
    external_id: externalId,
    tags: ['Pluxee']
  };
  if (pluxeeTransaction.type === 'SPENDING') {
    const { affiliateName, city } = pluxeeTransaction;
    transaction.type = 'withdrawal';
    transaction.source_id = accountId.toString();
    transaction.destination_name = affiliateName;
    transaction.description = `${affiliateName}, ${city}`;
  } else if (pluxeeTransaction.type === 'DEPOSIT') {
    const { faceValue, numberOfUnit, clientName } = pluxeeTransaction;
    transaction.type = 'deposit';
    transaction.source_name = clientName;
    transaction.description = `${clientName}: ${numberOfUnit} x ${faceValue.toFixed(2)} € = ${(numberOfUnit * faceValue).toFixed(2)}`;
    transaction.destination_id = accountId.toString();
  } else {
    console.warn(`Unmanaged transaction type: ${pluxeeTransaction.type}`);
    return null;
  }

  return transaction as Transaction;
}

async function processTransactions(token: string, productCode: ProductCode, accountId: number, { after, url: baseUrl, token: fireflyToken }: Partial<Options>) {
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

    const transaction = toFireflyTransaction(record, externalId, accountId);
    if (!transaction) continue;

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
}

async function updateBalance({ url: baseUrl, token: fireflyToken, ...options }: Partial<Options>, type: NumericKeys<Options>, balance: number) {
  const { data: { attributes: { current_balance: currentBalanceText, virtual_balance: virtualBalance } } } = await fetch(
    new URL(`/api/v1/accounts/${options[type]}`, baseUrl),
    { headers: { Authorization: `Bearer ${fireflyToken}` } }).then(async (r) => await r.json() as GetAccountInfoResponse);

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

async function check({ login, password, ...options }: Options) {
  console.info('Check Pluxee');
  const token = await authenticateUser(login, password);
  const { listOfProducts } = await getWalletInfo(token);
  for (const { productCode, balance } of listOfProducts) {
    const type = accountMapping.get(productCode);
    const accountId = type && options[type];
    if (!accountId) continue;

    await processTransactions(token, productCode, accountId, options);
    await updateBalance(options, type, balance);
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
  });
