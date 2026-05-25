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
  
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Check auth session
  useEffect(() => {
    const savedUser = localStorage.getItem('kasir_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setAuthChecked(true);
  }, []);

  // Sync products and transactions on login
  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [resProducts, resTransactions, resDb] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/transactions'),
        fetch('/api/db-status')
      ]);

      if (resProducts.ok) {
        const prodData = await resProducts.json();
        setProducts(prodData);
      }
      if (resTransactions.ok) {
        const trxData = await resTransactions.json();
        setTransactions(trxData);
      }
      if (resDb.ok) {
        const dbData = await resDb.json();
        setDbStatus(dbData);
      }
    } catch (err) {
      console.error('Failed to fetch backend data:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

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
  const handleCompleteTransaction = useCallback(async (transaction: Transaction) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      });
      if (res.ok) {
        await fetchData();
        setCurrentView('dashboard');
      } else {
        const data = await res.json();
        alert('Gagal memproses transaksi: ' + (data.error || 'Terjadi kesalahan.'));
      }
    } catch (err: any) {
      alert('Gagal memproses transaksi: ' + err.message);
    }
  }, [fetchData]);

  const handleAddProduct = async (product: Product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        await fetchData();
      } else {
        const data = await res.json();
        alert('Gagal menambah produk: ' + (data.error || 'Terjadi kesalahan.'));
      }
    } catch (err: any) {
      alert('Gagal menambah produk: ' + err.message);
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        await fetchData();
      } else {
        const data = await res.json();
        alert('Gagal memperbarui produk: ' + (data.error || 'Terjadi kesalahan.'));
      }
    } catch (err: any) {
      alert('Gagal memperbarui produk: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          await fetchData();
        } else {
          const data = await res.json();
          alert('Gagal menghapus produk: ' + (data.error || 'Terjadi kesalahan.'));
        }
      } catch (err: any) {
        alert('Gagal menghapus produk: ' + err.message);
      }
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
            <p className="text-slate-500">Kelola profil usaha, akun, dan integrasi database Anda.</p>
            
            {/* Database Diagnostic Status banner */}
            <div className="p-6 bg-white border border-slate-200 rounded-[24px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-slate-900">Status Server Database</h3>
                  {dbStatus?.connected ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 animate-pulse">
                      MySQL Terhubung
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                      Fallback Aktif (Tanpa MySQL)
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  {dbStatus?.connected 
                    ? `Aplikasi ini terhubung langsung ke server database MySQL pada host: ${dbStatus.host}.` 
                    : `Sistem sedang menggunakan database fallback lokal disk-backup aman (${dbStatus?.databaseName || 'data_fallback.json'}).`}
                </p>
                {dbStatus?.error && (
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    Detail Log: {dbStatus.error}
                  </p>
                )}
              </div>
              <div>
                <button 
                  onClick={fetchData}
                  disabled={loadingData}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-sm rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2"
                >
                  {loadingData ? <Loader2 className="animate-spin" size={16} /> : null}
                  Refresh Koneksi
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Email Registrasi</label>
                    <input disabled value={user.email} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-slate-500 font-medium cursor-not-allowed" />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-6">Sistem & Keamanan</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Cara Hubungkan ke Database MySQL</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Untuk migrasi dari database fallback lokal ke instance MySQL Anda sendiri, silakan tambahkan environment variables berikut di panel konfigurasi Secrets Anda:
                      </p>
                      <pre className="mt-2 p-3 bg-slate-50 rounded-xl text-xs font-mono text-slate-600 overflow-x-auto leading-relaxed border border-slate-200">
                        MYSQL_HOST = host_mysql_anda<br />
                        MYSQL_PORT = 3306<br />
                        MYSQL_USER = user_mysql_anda<br />
                        MYSQL_PASSWORD = password_mysql_anda<br />
                        MYSQL_DATABASE = nama_database_anda
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
                  <div>
                    <p className="font-bold text-red-600">Hapus Sesi</p>
                    <p className="text-sm text-slate-500">Keluar dari perangkat ini secara aman.</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition-colors"
                  >
                    Keluar Sesi
                  </button>
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

