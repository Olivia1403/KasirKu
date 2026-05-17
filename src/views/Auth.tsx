import React, { useState } from 'react';
import { Store, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface AuthProps {
  onLogin: (userData: any) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    storeName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulasi delay proses auth
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('kasir_users') || '[]');
      
      if (isLogin) {
        const user = users.find((u: any) => u.email === formData.email && u.password === formData.password);
        if (user) {
          onLogin(user);
        } else {
          setError('Email atau password salah.');
          setLoading(false);
        }
      } else {
        if (users.find((u: any) => u.email === formData.email)) {
          setError('Email sudah terdaftar.');
          setLoading(false);
          return;
        }
        
        const newUser = { ...formData, id: Date.now().toString() };
        users.push(newUser);
        localStorage.setItem('kasir_users', JSON.stringify(users));
        onLogin(newUser);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[1100px] bg-white rounded-[32px] shadow-2xl shadow-indigo-100 overflow-hidden flex flex-col md:flex-row border border-slate-100">
        
        {/* Left Side - Branding */}
        <div className="md:w-1/2 bg-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <Store size={24} />
              </div>
              <span className="text-2xl font-bold tracking-tight">KasirKu</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
              Kelola Bisnis UMKM <br />
              <span className="text-indigo-200">Lebih Cerdas & Cepat.</span>
            </h1>
            <p className="text-indigo-100 text-lg max-w-md leading-relaxed">
              Solusi POS modern untuk membantu Anda mengelola transaksi, stok, dan laporan dalam satu genggaman.
            </p>
          </div>

          <div className="relative z-10 pt-12">
            <div className="flex -space-x-3 mb-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-400 flex items-center justify-center text-xs font-bold">
                  U{i}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-white text-indigo-600 flex items-center justify-center text-xs font-bold">
                +1k
              </div>
            </div>
            <p className="text-sm font-medium text-indigo-100">Telah dipercaya oleh 1,000+ pemilik UMKM di Indonesia.</p>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 lg:p-16">
          <div className="max-w-md mx-auto">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {isLogin ? 'Selamat Datang!' : 'Buat Akun Baru'}
              </h2>
              <p className="text-slate-500 font-medium">
                {isLogin 
                  ? 'Silakan masuk untuk melanjutkan ke dashboard.' 
                  : 'Daftarkan usaha Anda dan mulai kelola transaksi hari ini.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl animate-in fade-in zoom-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-4">
                   <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Nama Pemilik</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" size={18} />
                      <input 
                        required
                        type="text" 
                        placeholder="Nama Lengkap" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none font-medium transition-all"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Nama Toko</label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        required
                        type="text" 
                        placeholder="Contoh: Kedai Kopi Berkah" 
                        value={formData.storeName}
                        onChange={e => setFormData({...formData, storeName: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Alamat Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="email" 
                    placeholder="email@tokoanda.com" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="password" 
                    placeholder="Minimal 6 karakter" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none font-medium transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {isLogin ? 'Masuk Sekarang' : 'Daftar Gratis'}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-500 font-medium">
                {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-indigo-600 font-bold hover:underline"
                >
                  {isLogin ? 'Daftar Disini' : 'Masuk Sekarang'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
