export type Order = {
  order_id: string;
  created_at: string;
  status: string;
  status_timeline: { status: string; at: string }[];
  items: { product_key: string; title: string; qty: number; price: number }[];
  total: number;
  payment_mode: string;
  tracking_note?: string;
};

export type Installment = {
  order_id: string;
  total_price: number;
  amount_paid: number;
  remaining: number;
  installment_months: number;
  next_due_date: string;
  schedule: { due_date: string; amount: number; status: "due" | "paid" }[];
};

export type WarrantyCard = {
  order_id: string;
  product_key: string;
  title: string;
  warranty_days_remaining: number;
  warranty_end_date: string;
};

export type Rewards = {
  balance: number;
  ledger: { at: string; points: number; reason: string; ref?: string }[];
};

export type Profile = {
  phone: string;
  name?: string;
  addresses: { label: string; line1: string; city: string; notes?: string }[];
};
