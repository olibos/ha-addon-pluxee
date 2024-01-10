import { createHash } from 'crypto';
const IDP_API_KEY = 'uTKvYST9XlJ57SsPMhCnWBCclbT04KOl60K6TR+eqz13oVDbwRVeB+h9N3JyBzacY4Ip0nKrfh+fsQ==';
const APP_API_KEY = '/Nr4ewlz0HNst+zQdHJRr8/gqeha7mpbUD4vSSG9JuGfL9s+RqupJ643UnEigR3CdBXVw9VPcKKTGw==';
const APP_BASE_URL = 'https://www.mysodexo.be/phoenix-extranet/rest/extranet-api/';
const VERSION = '3.13.0';

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
  const response = await fetch(new URL('getWalletInfo', APP_BASE_URL), { headers: createHeaders('', APP_API_KEY, token) });
  return (await response.json() as GetWalletInfoResponse).Result;
}

export async function getProductInfo(token: string, productType: ProductType, start = 0, size = 30) {
  const response = await fetch(
    new URL(`getProductInfo?start=${start}&size=${size}&productType=${productType}`, APP_BASE_URL),
    { headers: createHeaders('', APP_API_KEY, token) });
  return await response.json();
}

export async function * getAccountEvents(token: string, productType: ProductType, type: AccountEventInfoType = 'ALL', startDate?: Date, endDate?: Date) {
  const LIST_SIZE = 30;
  let start = 0;
  const { Result: { range: { size }, records } } = await getAccountEventInfo(token, productType, type, startDate, endDate, start, LIST_SIZE);
  let record = records.record;
  while (true) {
    for (const item of record) yield item;

    start += LIST_SIZE;
    if (start >= size) return;

    record = (await getAccountEventInfo(token, productType, type, startDate, endDate, start, LIST_SIZE)).Result.records.record;
  }
}

export async function getAccountEventInfo(token: string, productType: ProductType, type: AccountEventInfoType = 'ALL', startDate?: Date, endDate?: Date, start = 0, size = 30) {
  const url = new URL('getAccountEventInfo', APP_BASE_URL);
  url.searchParams.append('start', start.toString());
  url.searchParams.append('size', size.toString());
  url.searchParams.append('productType', productType);
  if (type && type !== 'ALL') {
    url.searchParams.append('type', type);
  }

  if (startDate && endDate) {
    url.searchParams.append('startDate', startDate.toISOString().split('T')[0]);
    url.searchParams.append('endDate', endDate.toISOString().split('T')[0]);
  }

  const response = await fetch(
    url,
    { headers: createHeaders('', APP_API_KEY, token) });
  return await response.json() as GetAccountEventInfo;
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

export interface Balance {
  productType: ProductType
  amountAvailable: number
}

export interface ExtensionConfig {
  productType: string
  extensionEligibility: boolean
  extensionPeriod: number
  eligibleBucketsForExtension: number
  eligibilityPeriodForExtensionRequest: number
}

export type ProductType = 'BOOK' | 'ECO' | 'GIFT' | 'LUNCH' | 'SPORT_CULTURE' | 'TRANSPORT' | 'CONSO';

export interface Result {
  activeProducts: ProductType[]
  balances: Balance[]
  extensionConfigs: ExtensionConfig[]
}

export interface GetWalletInfoResponse {
  Result: Result
}

type AccountEventInfoType = 'ALL' | 'ORDER' | 'TRANSACTION' | 'REVOCATION' | 'COMPENSATION' | 'EXPIRATION' | 'EXTENSION';

export type TransactionRecord = BaseRecord & {
  transaction: {
    to: string
    city: string
    channel: string
  }
}

export type OrderRecord = BaseRecord & {
  order: {
    orderId: number
    orderLineId: number
    from: string
    units: number
    unitPrice: number
  }
}
export type BaseRecord = {
  id: number
  amount: number
  time: string
}

export type GetAccountEventInfo = {
  Result: {
    range: {
      start: number
      end: number
      size: number
    }
    records: {
      record: Array<BaseRecord | TransactionRecord | OrderRecord>
    }
  }
}
