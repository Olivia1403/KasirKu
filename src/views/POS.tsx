import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  ChevronRight,
  ClipboardList,
  CreditCard,
  Banknote,
  QrCode,
  ShoppingCart
} from 'lucide-react';
import { Product, CartItem, Transaction } from '../types';
import { CATEGORIES } from '../constants';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface POSProps {
  products: Product[];
  onCompleteTransaction: (transaction: Transaction) => void;
}

export const POS: React.FC<POSProps> = ({ products, onCompleteTransaction }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'debit' | 'qris'>('cash');
  const [showCheckout, setShowCheckout] = useState(false);

  // Filtering
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'Semua' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  // Cart operations
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handleCheckout = () => {
    const transaction: Transaction = {
      id: `TRX-${Date.now()}`,
      date: new Date().toISOString(),
      items: [...cart],
      total,
      paymentMethod,
    };
    onCompleteTransaction(transaction);
    setCart([]);
    setShowCheckout(false);
  };

  return (
    <div className="flex h-full overflow-hidden bg-slate-50">
      {/* Product Area */}
      <div className="flex-1 flex flex-col min-w-0 p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Kasir</h1>
            <p className="text-slate-500">Pilih produk untuk mulai bertransaksi.</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari produk..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 pb-2 overflow-x-auto scroller-hidden">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                activeCategory === cat 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="group bg-white p-4 rounded-2xl border border-slate-200 text-left hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-500/10 transition-all active:scale-95"
            >
              <div className="aspect-square bg-slate-50 rounded-xl mb-4 flex items-center justify-center text-slate-300">
                <ClipboardList size={32} />
              </div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">{product.category}</p>
              <h3 className="font-bold text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center justify-between mt-auto">
                <p className="font-bold text-slate-900">Rp {product.price.toLocaleString('id-ID')}</p>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Plus size={18} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Area */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col shadow-2xl">
        <div className="p-6 border-bottom border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShoppingCart size={20} />
            </div>
            <h2 className="font-bold text-slate-900">Keranjang</h2>
            <span className="ml-auto px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)} Item
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length > 0 ? (
            cart.map(item => (
              <div key={item.id} className="group p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 pr-2">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.name}</h3>
                    <p className="text-xs text-indigo-600 mt-1">Rp {item.price.toLocaleString('id-ID')}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 p-1 bg-slate-50 border border-slate-100 rounded-lg">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-indigo-600 bg-white shadow-sm rounded-md transition-all active:scale-90"
                    >
                      <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-700">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-indigo-600 bg-white shadow-sm rounded-md transition-all active:scale-90"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <ClipboardList size={48} className="mb-4 text-slate-300" />
              <p className="text-sm font-semibold">Keranjang masih kosong</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50/50">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Pajak (10%)</span>
              <span className="font-medium text-slate-900">Rp {tax.toLocaleString('id-ID')}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-bold text-indigo-600 text-lg">Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={() => setShowCheckout(true)}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            Selesaikan Bayar
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Checkout Modal Overlay */}
      {showCheckout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCheckout(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-2">Metode Pembayaran</h2>
              <p className="text-slate-500 mb-8">Pilih metode pembayaran yang digunakan pelanggan.</p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <button 
                  onClick={() => setPaymentMethod('cash')}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                    paymentMethod === 'cash' ? "bg-indigo-50 border-indigo-600 text-indigo-600" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                  )}
                >
                  <Banknote size={24} />
                  <span className="text-xs font-bold">Tunai</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('debit')}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                    paymentMethod === 'debit' ? "bg-indigo-50 border-indigo-600 text-indigo-600" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                  )}
                >
                  <CreditCard size={24} />
                  <span className="text-xs font-bold">Debit / Card</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('qris')}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                    paymentMethod === 'qris' ? "bg-indigo-50 border-indigo-600 text-indigo-600" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                  )}
                >
                  <QrCode size={24} />
                  <span className="text-xs font-bold">QRIS</span>
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3 mb-8">
                <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                  <span>Total Tagihan</span>
                  <span className="text-slate-900 font-bold">Rp {total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                  <span>Metode</span>
                  <span className="text-indigo-600 font-bold uppercase">{paymentMethod}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 py-4 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleCheckout}
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  Konfirmasi Bayar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
