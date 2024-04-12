export interface Transaction {
  user: string
  transaction_journal_id: string
  type: 'withdrawal' | 'deposit' | 'transfer' | 'reconciliation' | 'opening balance'
  date: string
  order: number
  currency_id: string
  currency_code: string
  currency_name: string
  currency_symbol: string
  currency_decimal_places: number
  foreign_currency_id?: unknown
  foreign_currency_code?: unknown
  foreign_currency_symbol?: unknown
  foreign_currency_decimal_places: number
  amount: string
  foreign_amount?: unknown
  description: string
  source_id: string
  source_name: string
  source_iban?: unknown
  source_type: string
  destination_id: string
  destination_name: string
  destination_iban?: unknown
  destination_type: string
  budget_id?: unknown
  budget_name?: unknown
  category_id?: unknown
  category_name?: unknown
  bill_id?: unknown
  bill_name?: unknown
  reconciled: boolean
  notes?: unknown
  tags: string[]
  internal_reference: string
  external_id?: unknown
  original_source: string
  recurrence_id?: unknown
  recurrence_total?: unknown
  recurrence_count?: unknown
  bunq_payment_id?: unknown
  external_url?: unknown
  import_hash_v2: string
  sepa_cc?: unknown
  sepa_ct_op?: unknown
  sepa_ct_id?: unknown
  sepa_db?: unknown
  sepa_country?: unknown
  sepa_ep?: unknown
  sepa_ci?: unknown
  sepa_batch_id?: unknown
  interest_date?: unknown
  book_date?: unknown
  process_date?: unknown
  due_date?: unknown
  payment_date?: unknown
  invoice_date?: unknown
  longitude?: unknown
  latitude?: unknown
  zoom_level?: unknown
  has_attachments: boolean
}

export interface TransactionAttributes {
  created_at: string
  updated_at: string
  user: string
  group_title?: unknown
  transactions: Transaction[]
}

export interface Data<TAttribute> {
  type: string
  id: string
  attributes: TAttribute
  links: Link
}

export interface Pagination {
  total: number
  count: number
  per_page: number
  current_page: number
  total_pages: number
}

export interface Meta {
  pagination: Pagination
}

export interface Link {
  self: string
  first: string
  last: string
}

export interface SearchTransactionResponse {
  data: Array<Data<TransactionAttributes>>
  meta: Meta
  links: Link
}

export interface AddTransactionRequest {
  error_if_duplicate_hash: boolean
  apply_rules?: boolean
  fire_webhooks?: boolean
  group_title?: string
  transactions: Array<Partial<Transaction>>
}

export type UpdateTransactionRequest = Omit<AddTransactionRequest, 'error_if_duplicate_hash'>

export interface AccountAttributes {
  created_at: string
  updated_at: string
  active: boolean
  order: number
  name: string
  type: string
  account_role: string
  currency_id: string
  currency_code: string
  currency_symbol: string
  currency_decimal_places: number
  current_balance: string
  current_balance_date: string
  notes?: unknown
  monthly_payment_date?: unknown
  credit_card_type?: unknown
  account_number?: unknown
  iban: string
  bic?: unknown
  virtual_balance: string
  opening_balance: string
  opening_balance_date?: unknown
  liability_type?: unknown
  liability_direction?: unknown
  interest?: unknown
  interest_period?: unknown
  current_debt?: unknown
  include_net_worth: boolean
  longitude?: unknown
  latitude?: unknown
  zoom_level?: unknown
}

export interface GetAccountInfoResponse {
  data: Data<AccountAttributes>
}
