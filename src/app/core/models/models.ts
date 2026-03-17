// ── Auth Models ──────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'store_admin' | 'cashier';
  store_id: number | null;
  store?: Store | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// ── Store Models ─────────────────────────────────────────────
export interface Store {
  id: number;
  code: string;
  name: string;
  city: string;
  prefix: string;
  cash_register_number: string;
  is_active: boolean;
  sales_count?: number;
  purchases_count?: number;
  created_at?: string;
  updated_at?: string;
}

// ── Tax Rate Models ───────────────────────────────────────────
export interface TaxRate {
  id: number;
  name: string;
  rate: number;
  description?: string;
  is_active: boolean;
}

// ── Retention Models ──────────────────────────────────────────
export interface RetentionType {
  id: number;
  code: string;
  name: string;
  category: 'fuente' | 'iva' | 'ica' | 'timbre';
  rate: number;
  description?: string;
  is_active: boolean;
}

// ── Supplier Models ───────────────────────────────────────────
export interface Supplier {
  id: number;
  nit: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  is_active: boolean;
}

// ── Sale Models ───────────────────────────────────────────────
export type PaymentMethod = 'EF' | 'CF' | 'TR' | 'TD' | 'TC' | 'VA';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  EF: 'Efectivo',
  CF: 'Crédito / Fiado',
  TR: 'Transferencia',
  TD: 'Tarjeta Débito',
  TC: 'Tarjeta Crédito',
  VA: 'Vale',
};

export interface SalePaymentMethod {
  id?: number;
  sale_id?: number;
  method: PaymentMethod;
  amount: number;
}

export interface Sale {
  id: number;
  store_id: number;
  sale_date: string;
  registration_date: string;
  prefix: string;
  doc_number: string;
  client: string;
  total_with_tax: number;
  tax_rate_id: number;
  taxable_base: number;
  tax_amount: number;
  total_without_tax: number;
  operations_count: number;
  observations?: string;
  is_day_without_record: boolean;
  source: 'manual' | 'webhook_n8n';
  store?: Store;
  tax_rate?: TaxRate;
  payment_methods?: SalePaymentMethod[];
  created_at?: string;
}

export interface SaleRequest {
  store_id: number;
  sale_date: string;
  registration_date: string;
  prefix: string;
  doc_number: string;
  client?: string;
  total_with_tax: number;
  tax_rate_id: number;
  operations_count?: number;
  observations?: string;
  is_day_without_record?: boolean;
  payment_methods?: SalePaymentMethod[];
}

// ── Purchase Models ───────────────────────────────────────────
export interface PurchaseRetention {
  id?: number;
  purchase_id?: number;
  retention_type_id: number;
  base: number;
  rate: number;
  amount: number;
  retention_type?: RetentionType;
}

export interface Purchase {
  id: number;
  store_id: number;
  supplier_id: number;
  purchase_date: string;
  prefix: string;
  invoice_number: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  total_retentions: number;
  net_paid: number;
  observations?: string;
  source: 'manual' | 'webhook_n8n';
  store?: Store;
  supplier?: Supplier;
  retentions?: PurchaseRetention[];
  created_at?: string;
}

export interface PurchaseRequest {
  store_id: number;
  supplier_id: number;
  purchase_date: string;
  prefix: string;
  invoice_number: string;
  subtotal: number;
  tax_amount?: number;
  observations?: string;
  retentions?: { retention_type_id: number; base: number; rate: number }[];
}

// ── Dashboard / Report Models ─────────────────────────────────
export interface DashboardData {
  year: number;
  sales: {
    total_with_tax: number;
    taxable_base: number;
    tax_generated: number;
    total_operations: number;
    by_store: { store_id: number; total: number; tax: number; store: Store }[];
    by_month: { month: number; store_id: number; total: number; tax: number }[];
    payment_methods: { method: PaymentMethod; total: number }[];
  };
  purchases: {
    total: number;
    tax_deductible: number;
    total_retentions: number;
    by_store: { store_id: number; total: number; tax: number; store: Store }[];
  };
  vat_balance: {
    generated: number;
    deductible: number;
    balance: number;
    status: 'por_pagar' | 'a_favor';
  };
}

export interface MonthReport {
  month: number;
  month_name: string;
  stores: Record<string, {
    total: number;
    taxable_base?: number;
    tax: number;
    operations?: number;
    subtotal?: number;
    retentions?: number;
    net_paid?: number;
  } | undefined>;
  consolidated: number;
}

// ── Audit Models ──────────────────────────────────────────────
export interface MissingDay {
  date: string;
  day_of_week: string;
  is_weekend: boolean;
}

export interface AuditResult {
  store: { id: number; code: string; name: string };
  from: string;
  to: string;
  total_days: number;
  registered: number;
  missing: number;
  missing_days: MissingDay[];
}

// ── API Pagination ────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// ── User Models ───────────────────────────────────────────────
export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'store_admin' | 'cashier';
  store_id: number | null;
  store?: Store | null;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'store_admin' | 'cashier';
  store_id?: number | null;
}
