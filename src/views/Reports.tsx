import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Filter, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  Banknote,
  QrCode,
  Search
} from 'lucide-react';
import { Transaction } from '../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '../lib/utils';

interface ReportsProps {
  transactions: Transaction[];
}

export const Reports: React.FC<ReportsProps> = ({ transactions }) => {
  const [search, setSearch] = useState('');
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalRevenue = transactions.reduce((s, t) => s + t.total, 0);

  const stats = [
    { label: 'Total Pendapatan', value: `Rp ${totalRevenue.toLocaleString('id-ID')}`, icon: TrendingUp, color: 'text-indigo-600' },
    { label: 'Total Transaksi', value: transactions.length.toString(), icon: BarChart3, color: 'text-emerald-600' },
    { label: 'Rata-rata Keranjang', value: `Rp ${transactions.length ? (totalRevenue / transactions.length).toLocaleString('id-ID', { maximumFractionDigits: 0 }) : 0}`, icon: TrendingUp, color: 'text-amber-600' },
  ];

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote size={16} className="text-emerald-600" />;
      case 'debit': return <CreditCard size={16} className="text-blue-600" />;
      case 'qris': return <QrCode size={16} className="text-indigo-600" />;
      default: return null;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Laporan Penjualan</h1>
          <p className="text-slate-500 mt-1">Riwayat transaksi dan performa keuangan.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Calendar size={18} />
            7 Hari Terakhir
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
            <Download size={18} />
            Ekspor .PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className={stat.color} size={20} />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-lg text-slate-900">Riwayat Transaksi</h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari ID Transaksi..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-shadow"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID Transaksi</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Waktu</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Item</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Metode</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => setSelectedTrx(t)}>
                  <td className="px-6 py-4 font-bold text-slate-900">{t.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {format(new Date(t.date), 'dd MMM yyyy, HH:mm', { locale: id })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-700">{t.items.length} Item</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 w-fit">
                      {getMethodIcon(t.paymentMethod)}
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{t.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-indigo-600">
                    Rp {t.total.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 rounded-lg transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <BarChart3 size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">Belum ada transaksi.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTrx && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedTrx(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold">Detail Transaksi</h2>
                  <p className="text-slate-500 text-sm">{selectedTrx.id}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
                    Berhasil
                  </div>
                  <p className="text-xs text-slate-400">{format(new Date(selectedTrx.date), 'dd MMMM yyyy, HH:mm', { locale: id })}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="pb-4 border-b border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Daftar Item</p>
                  <div className="space-y-3">
                    {selectedTrx.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900">Rp {(item.quantity * item.price).toLocaleString('id-ID')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Metode Pembayaran</span>
                    <span className="font-bold text-slate-900 uppercase">{selectedTrx.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-slate-900 pt-2">
                    <span>Total Bayar</span>
                    <span className="text-indigo-600">Rp {selectedTrx.total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedTrx(null)}
                  className="flex-1 py-4 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors"
                >
                  Tutup
                </button>
                <button className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition-all">
                  Cetak Struk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
