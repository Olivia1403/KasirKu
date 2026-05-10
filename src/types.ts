export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
  unit: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'debit' | 'qris';
  customerName?: string;
}

export type ViewType = 'dashboard' | 'pos' | 'products' | 'reports' | 'settings';
