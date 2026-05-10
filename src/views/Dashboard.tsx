import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Transaction, Product } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, startOfDay, isToday, subDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '../lib/utils';

interface DashboardProps {
  transactions: Transaction[];
  products: Product[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, products }) => {
  const todayTransactions = transactions.filter(t => isToday(new Date(t.date)));
  const todaySales = todayTransactions.reduce((acc, t) => acc + t.total, 0);
  
  const lowStockItems = products.filter(p => p.stock <= 10).length;

  // Chart data for last 7 days
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStr = format(date, 'eee', { locale: id });
      const daySales = transactions
        .filter(t => startOfDay(new Date(t.date)).getTime() === startOfDay(date).getTime())
        .reduce((acc, t) => acc + t.total, 0);
      data.push({ name: dayStr, sales: daySales });
    }
    return data;
  }, [transactions]);

  const stats = [
    { 
      label: 'Penjualan Hari Ini', 
      value: `Rp ${todaySales.toLocaleString('id-ID')}`, 
      icon: TrendingUp, 
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      trend: '+12.5%',
      trendUp: true
    },
    { 
      label: 'Total Transaksi', 
      value: todayTransactions.length.toString(), 
      icon: ShoppingCart, 
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      trend: '+4.3%',
      trendUp: true
    },
    { 
      label: 'Stok Menipis', 
      value: lowStockItems.toString(), 
      icon: Package, 
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: lowStockItems > 0 ? 'Perlu Restok' : 'Aman',
      trendUp: false
    },
    { 
      label: 'Pelanggan Baru', 
      value: '24', 
      icon: Users, 
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: '-1.5%',
      trendUp: false
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Ringkasan performa bisnis Anda dalam satu layar.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <div className={cn(
                "flex items-center text-xs font-bold px-2 py-1 rounded-full",
                stat.trendUp ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
              )}>
                {stat.trendUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Performa Penjualan (7 Hari Terakhir)</h3>
            <select className="text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}}
                  tickFormatter={(value) => `Rp ${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Penjualan']}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Transaksi Terakhir</h3>
          <div className="space-y-4">
            {todayTransactions.length > 0 ? (
              todayTransactions.slice(0, 5).map((t, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                      {t.id.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t.id}</p>
                      <p className="text-xs text-slate-500">{format(new Date(t.date), 'HH:mm')}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-900">Rp {t.total.toLocaleString('id-ID')}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <ShoppingCart size={32} />
                </div>
                <p className="text-sm text-slate-500 font-medium">Belum ada transaksi hari ini.</p>
              </div>
            )}
          </div>
          {todayTransactions.length > 5 && (
            <button className="w-full mt-6 text-sm text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
              Lihat Semua Transaksi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
