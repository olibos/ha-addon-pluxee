import { createHash } from 'crypto';
const IDP_API_KEY = 'uTKvYST9XlJ57SsPMhCnWBCclbT04KOl60K6TR+eqz13oVDbwRVeB+h9N3JyBzacY4Ip0nKrfh+fsQ==';
const APP_BASE_URL = 'https://bff-s4y.sodexo.be/v1/';
const VERSION = '4.0.2';

type Nullable<T> = T | null;

export async function authenticateUser(login: string, password: string) {
  const IDP_URL = new URL('https://s4ap.sodexo4you.be/authenticateUser');
  const payload = JSON.stringify({ AuthenticateUser: { userid: login, password } });
  const response = await fetch(
    IDP_URL,
    {
      method: 'post',
      headers: createHeaders(payload, IDP_API_KEY, undefined, true),
      body: payload
    });
  return (await response.json() as { token: string })?.token;
}

export async function getWalletInfo(token: string) {
  const response = await fetch(new URL('wallets/summary', APP_BASE_URL), { headers: { Authorization: token } });
  return await response.json() as GetWalletInfoResponse;
}

export async function * getWalletTransactionsIterator(token: string, productCode: ProductCode, type: AccountEventInfoType = 'ALL') {
  const LIST_SIZE = 30;
  let pageIndex = 1;
  while (true) {
    const { totalPages, transactions } = await getWalletTransactions(token, productCode, type, pageIndex, LIST_SIZE);
    yield * transactions;

    pageIndex++;
    if (pageIndex > totalPages) return;
  }
}

export async function getWalletTransactions(token: string, productCode: ProductCode, transactionsGroup: AccountEventInfoType = 'ALL', pageIndex = 0, size = 30) {
  const url = new URL('wallets/transactions', APP_BASE_URL);
  url.searchParams.append('PageIndex', pageIndex.toString());
  url.searchParams.append('PageSize', size.toString());
  url.searchParams.append('ProductType', productCode);
  url.searchParams.append('TransactionType', transactionsGroup);
  url.searchParams.append('Period', '1');

  const response = await fetch(
    url,
    { headers: { Authorization: token } });
  const result = await response.json() as WalletTransactions;
  return result;
}

function createHeaders(payload: string, apiKey: string, token?: string, authHeaders?: boolean): Record<string, string> {
  const contentType = authHeaders ? 'application/sodexo-extranet-v12+json' : 'application/sodexo-extranet-v13+json';
  const now = new Date().toUTCString();
  const apiHex = base64DecodeToHex(apiKey);
  const payloadHashHex = createHash('md5').update(payload).digest('hex');
  const tokenDateHashHex = createHash('md5').update(token ? `${token}\n${now}` : now).digest('hex');
  const authorization = createHash('sha1').update(Buffer.from(`${apiHex}${payloadHashHex}${tokenDateHashHex}`, 'hex')).digest('base64');
  return {
    Accept: contentType,
    'Content-Type': contentType,
    'Request-Date': now,
    'Content-MD5': createHash('md5').update(payload).digest('base64'),
    'Client-Authorization': authorization,
    Token: token as any,
    'Cache-Control': 'no-cache',
    'Client-Version': VERSION,
    'User-Agent': 'Android'
  };
}

function base64DecodeToHex(base64String: string) {
  return Buffer.from(base64String, 'base64').toString('hex');
}

export type Balance = {
  productType: ProductType
  amountAvailable: number
}

export type ExtensionConfig = {
  productType: ProductType
  extensionEligibility: boolean
  extensionPeriod: number
  eligibleBucketsForExtension: number
  eligibilityPeriodForExtensionRequest: number
}

export type ProductType = 'BOOK' | 'ECO' | 'GIFT' | 'LUNCH' | 'SPORT_CULTURE' | 'TRANSPORT' | 'CONSO';

export type ProductCode = 'ECP' | 'ELP' | 'EEP' | 'EGP' | 'ECO';

export function toProductType(code: ProductCode): Nullable<ProductType> {
  switch (code) {
    case 'ECP': return 'CONSO';
    case 'ELP': return 'LUNCH';
    case 'EEP': return 'ECO';
    case 'EGP': return 'GIFT';
    case 'ECO': return 'SPORT_CULTURE';
    default: return null;
  }
}

export type Product = {
  productCode: ProductCode
  balance: number
}

export type GetWalletInfoResponse = {
  listOfProducts: Product[]
  extensionConfigs: ExtensionConfig[]
}

type AccountEventInfoType = 'ALL' | 'ORDER' | 'TRANSACTION' | 'REVOCATION' | 'COMPENSATION' | 'EXPIRATION' | 'EXTENSION';

export type BaseWalletTransaction = {
  id: string
  productType: ProductType
  date: string
  amount: Nullable<number>
}

export type DepositWalletTransaction = BaseWalletTransaction & {
  type: 'DEPOSIT'
  clientName: string
  numberOfUnit: number
  faceValue: number
  startDate: string
  expirationDate: string
}

export type SpendingWalletTransaction = BaseWalletTransaction & {
  type: 'SPENDING'
  affiliateName: string
  city: string
  paymentMethod: string
}

export type UnknownWalletTransaction = BaseWalletTransaction & {
  type: 'UNKNOWN'
}

export type WalletTransaction = DepositWalletTransaction | SpendingWalletTransaction | UnknownWalletTransaction;

export type WalletTransactions = {
  pageIndex: number
  pageSize: number
  totalPages: number
  totalItems: number
  transactions: WalletTransaction[]
}
