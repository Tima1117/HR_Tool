import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronRight, Users, BarChart2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { pageVariants, staggerContainer, scaleIn } from '../lib/animations';

export default function CompanySelectPage() {
  const { currentUser, companies, teams, selectCompany } = useApp();
  const navigate = useNavigate();

  const availableIds = currentUser?.companyIds ?? [];

  const handleSelect = (id: string) => {
    selectCompany(id);
    navigate('/portal');
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex flex-col items-center justify-center p-4"
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28, delay: 0.05 }}
            className="inline-flex w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl items-center justify-center shadow-lg shadow-blue-200 mb-5"
          >
            <Building2 className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900">Выберите компанию</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Добро пожаловать, {currentUser?.name}
          </p>
        </motion.div>

        {/* Company list */}
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
          {availableIds.map((id, i) => {
            const company = companies[id];
            if (!company) return null;
            const companyTeams = Object.values(teams).filter(t => t.companyId === id);
            const totalArt = companyTeams.reduce((s, t) => s + Object.keys(t.artifacts).length, 0);
            const maxArt = companyTeams.length * 4;
            const progress = maxArt > 0 ? Math.round((totalArt / maxArt) * 100) : 0;

            return (
              <motion.button
                key={id}
                variants={scaleIn}
                whileHover={{ y: -3, scale: 1.01, boxShadow: '0 8px 25px -5px rgba(59,130,246,0.18)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                onClick={() => handleSelect(id)}
                className="w-full bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all text-left group shadow-sm"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{company.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{company.industry}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Users className="w-3 h-3" />
                      {companyTeams.length} команд
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <BarChart2 className="w-3 h-3" />
                      {totalArt}/{maxArt} артефактов
                    </span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: progress + '%' }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{progress}%</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}
