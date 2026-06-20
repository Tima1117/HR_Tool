import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, LogOut, User, ChevronDown, LayoutDashboard, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, currentCompanyId, companies, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = currentUser?.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('') ?? '?';
  const currentCompany = currentCompanyId ? companies[currentCompanyId] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex flex-col">
      {/* Navbar */}
      <header className="glass sticky top-0 z-40 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <motion.div
              whileHover={{ rotate: -5, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200"
            >
              <Shield className="w-4 h-4 text-white" />
            </motion.div>
            <div className="hidden sm:block">
              <span className="font-bold text-slate-800 text-sm tracking-tight">HR Аудит</span>
              {currentCompany && (
                <p className="text-[10px] text-slate-400 leading-none mt-0.5 truncate max-w-[160px]">{currentCompany.name}</p>
              )}
            </div>
          </Link>

          {currentUser && (
            <div className="relative shrink-0" ref={menuRef}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-slate-100/80 transition-colors"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {initials}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[120px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                <motion.div animate={{ rotate: menuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute right-0 top-full mt-2 w-60 glass rounded-2xl shadow-xl border border-slate-200/80 py-1.5 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800 truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.position}</p>
                      <span className={`mt-1.5 inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        currentUser.role === 'consultant'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {currentUser.role === 'consultant' ? 'Консультант' : 'Руководитель'}
                      </span>
                    </div>

                    {currentUser.role === 'consultant' && (
                      <MenuItem icon={<LayoutDashboard className="w-4 h-4" />} label="Панель консультанта" onClick={() => navigate('/admin')} />
                    )}
                    {currentUser.role === 'consultant' && (currentUser.companyIds?.length ?? 0) > 1 && (
                      <MenuItem icon={<Building2 className="w-4 h-4" />} label="Сменить компанию" onClick={() => navigate('/select-company')} />
                    )}
                    <MenuItem icon={<User className="w-4 h-4" />} label="Профиль" onClick={() => navigate('/profile')} />

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Выйти
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
    >
      <span className="text-slate-400">{icon}</span>
      {label}
    </motion.button>
  );
}
