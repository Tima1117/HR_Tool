import { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, ArrowRight, Lock, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MouseSpotlight, AceternitySpotlight } from '../components/Spotlight';

const Spline = lazy(() => import('@splinetool/react-spline'));

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, currentUser } = useApp();
  const [loginVal, setLoginVal] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (currentUser) { navigate('/'); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const ok = login(loginVal, password);
    setLoading(false);
    if (ok) navigate('/');
    else setError('Неверный логин или пароль');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex overflow-hidden relative">
      {/* Aceternity sweep spotlight */}
      <AceternitySpotlight className="-top-40 left-0 md:left-80 md:-top-20" fill="white" />

      {/* Mouse-follow spotlight */}
      <MouseSpotlight size={600} />

      {/* Ambient blobs */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-indigo-700/20 rounded-full blur-3xl pointer-events-none" />

      {/* LEFT — 3D Spline scene (desktop only) */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
        <Suspense fallback={
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full"
            />
            <span className="text-sm">Загрузка сцены...</span>
          </div>
        }>
          <Spline
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </Suspense>

        {/* Left side text overlay */}
        <div className="absolute bottom-12 left-10 right-10 z-10">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="text-slate-400 text-sm leading-relaxed max-w-xs"
          >
            Платформа психологического аудита команд для HR-консультантов
          </motion.p>
        </div>
      </div>

      {/* RIGHT — login form */}
      <div className="flex flex-1 items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="inline-flex w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl items-center justify-center shadow-2xl shadow-blue-500/30 mb-5"
            >
              <Shield className="w-7 h-7 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white tracking-tight"
            >
              HR Аудит
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-blue-300/70 text-sm mt-1"
            >
              Система управления командами
            </motion.p>
          </div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="bg-white/[0.07] backdrop-blur-2xl border border-white/[0.12] rounded-3xl p-7 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-blue-200/70 mb-1.5 uppercase tracking-wider">Логин</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={loginVal}
                    onChange={e => setLoginVal(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white placeholder:text-slate-600
                               focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
                    placeholder="Введите логин"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-200/70 mb-1.5 uppercase tracking-wider">Пароль</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white placeholder:text-slate-600
                               focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
                    placeholder="Введите пароль"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold
                           hover:from-blue-400 hover:to-indigo-500 transition-all duration-200 shadow-lg shadow-blue-500/25
                           disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>Войти <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </form>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-slate-700 mt-6"
          >
            admin / admin123 · petrov / pass123 · ivanova / pass123
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
