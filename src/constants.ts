import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Kopi Susu Gula Aren', category: 'Minuman', price: 18000, stock: 50, unit: 'cup' },
  { id: '2', name: 'Americano', category: 'Minuman', price: 15000, stock: 100, unit: 'cup' },
  { id: '3', name: 'Roti Bakar Cokelat', category: 'Makanan', price: 12000, stock: 30, unit: 'porsi' },
  { id: '4', name: 'French Fries', category: 'Makanan', price: 10000, stock: 40, unit: 'porsi' },
  { id: '5', name: 'Es Teh Manis', category: 'Minuman', price: 5000, stock: 200, unit: 'cup' },
  { id: '6', name: 'Nasi Goreng Spesial', category: 'Makanan', price: 25000, stock: 20, unit: 'porsi' },
];

export const CATEGORIES = ['Semua', 'Makanan', 'Minuman', 'Snack', 'Lainnya'];
