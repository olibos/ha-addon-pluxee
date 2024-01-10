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
  foreign_currency_id?: any
  foreign_currency_code?: any
  foreign_currency_symbol?: any
  foreign_currency_decimal_places: number
  amount: string
  foreign_amount?: any
  description: string
  source_id: string
  source_name: string
  source_iban?: any
  source_type: string
  destination_id: string
  destination_name: string
  destination_iban?: any
  destination_type: string
  budget_id?: any
  budget_name?: any
  category_id?: any
  category_name?: any
  bill_id?: any
  bill_name?: any
  reconciled: boolean
  notes?: any
  tags: string[]
  internal_reference: string
  external_id?: any
  original_source: string
  recurrence_id?: any
  recurrence_total?: any
  recurrence_count?: any
  bunq_payment_id?: any
  external_url?: any
  import_hash_v2: string
  sepa_cc?: any
  sepa_ct_op?: any
  sepa_ct_id?: any
  sepa_db?: any
  sepa_country?: any
  sepa_ep?: any
  sepa_ci?: any
  sepa_batch_id?: any
  interest_date?: any
  book_date?: any
  process_date?: any
  due_date?: any
  payment_date?: any
  invoice_date?: any
  longitude?: any
  latitude?: any
  zoom_level?: any
  has_attachments: boolean
}

export interface TransactionAttributes {
  created_at: string
  updated_at: string
  user: string
  group_title?: any
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
  notes?: any
  monthly_payment_date?: any
  credit_card_type?: any
  account_number?: any
  iban: string
  bic?: any
  virtual_balance: string
  opening_balance: string
  opening_balance_date?: any
  liability_type?: any
  liability_direction?: any
  interest?: any
  interest_period?: any
  current_debt?: any
  include_net_worth: boolean
  longitude?: any
  latitude?: any
  zoom_level?: any
}

export interface GetAccountInfoResponse {
  data: Data<AccountAttributes>
}
