/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Product, Transaction, ViewType } from './types';
import { INITIAL_PRODUCTS } from './constants';
import { Menu, Loader2, Store } from 'lucide-react';

// Views
import { Dashboard } from './views/Dashboard';
import { POS } from './views/POS';
import { Products } from './views/Products';
import { Reports } from './views/Reports';
import { Auth } from './views/Auth';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [products, setProducts] = useLocalStorage<Product[]>('kasir_products_v1', INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('kasir_transactions_v1', []);

  // Check auth session
  useEffect(() => {
    const savedUser = localStorage.getItem('kasir_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setAuthChecked(true);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('kasir_session', JSON.stringify(userData));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      setUser(null);
      localStorage.removeItem('kasir_session');
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Handlers
  const handleCompleteTransaction = useCallback((transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
    
    // Update stock
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const cartItem = transaction.items.find(item => item.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      });
    });

    // Notify user (mock)
    setCurrentView('dashboard');
  }, [setTransactions, setProducts]);

  const handleAddProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const handleUpdateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  if (!authChecked) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard transactions={transactions} products={products} />;
      case 'pos':
        return <POS products={products} onCompleteTransaction={handleCompleteTransaction} />;
      case 'products':
        return (
          <Products 
            products={products} 
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case 'reports':
        return <Reports transactions={transactions} />;
      case 'settings':
        return (
          <div className="p-8 max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Pengaturan Toko</h1>
            <p className="text-slate-500">Kelola profil usaha dan akun Anda.</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg mb-6">Profil Usaha</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Nama Toko</label>
                    <input disabled value={user.storeName || "Toko KasirKu"} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-slate-500 font-medium cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Pemilik</label>
                    <input disabled value={user.name} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-slate-500 font-medium cursor-not-allowed" />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg mb-6">Sistem & Keamanan</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Cadangkan Data</p>
                      <p className="text-sm text-slate-500">Simpan salinan data transaksi Anda.</p>
                    </div>
                    <button className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-sm rounded-xl hover:bg-indigo-100 transition-colors">
                      Ekspor JSON
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-red-600">Hapus Sesi</p>
                      <p className="text-sm text-slate-500">Keluar dari perangkat ini secara aman.</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition-colors"
                    >
                      Keluar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        onLogout={handleLogout}
        user={user}
      />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Store size={20} />
            </div>
            <span className="font-extrabold tracking-tight">Kasir<span className="text-indigo-600">Ku</span></span>
          </div>
          <button onClick={toggleSidebar} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <Menu size={20} strokeWidth={2.5} />
          </button>
        </header>

        <section className="flex-1 overflow-hidden relative">
           <div className="absolute inset-0 overflow-y-auto">
            {renderView()}
           </div>
        </section>
      </main>
    </div>
  );
}

