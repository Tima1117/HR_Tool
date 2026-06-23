import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Users, FileText, ChevronRight, BarChart2, PlusCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import { pageVariants, staggerContainer, fadeUp, cardHover } from '../../lib/animations';

function AnimatedNumber({ value }: { value: number | string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="text-2xl font-bold text-slate-800"
    >
      {value}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { teams, employees, companies, currentCompanyId } = useApp();

  const company = currentCompanyId ? companies[currentCompanyId] : Object.values(companies)[0];
  const teamList = Object.values(teams).filter(t => t.companyId === company?.id);
  const empList = Object.values(employees);
  const totalArtifacts = teamList.reduce((sum, t) => sum + Object.keys(t.artifacts).length, 0);
  const fullTeams = teamList.filter(t => Object.keys(t.artifacts).length === 4).length;

  const stats = [
    { label: 'Команд в структуре', value: teamList.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Сотрудников', value: empList.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { label: 'Загружено артефактов', value: `${totalArtifacts} / ${teamList.length * 4}`, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Команд с полным аудитом', value: fullTeams, icon: BarChart2, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  ];

  return (
    <Layout>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-bold text-slate-800">Панель консультанта</h1>
          <p className="text-slate-500 mt-1">Управление организационной структурой и артефактами аудита</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              {...cardHover}
              className={`bg-white rounded-2xl border ${s.border} shadow-sm p-5 cursor-default`}
            >
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <AnimatedNumber value={s.value} />
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Company card */}
        {company && (
          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="flex items-start gap-4 p-6 border-b border-slate-100">
              <motion.div
                whileHover={{ rotate: -5, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              >
                <Building2 className="w-6 h-6 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-800">{company.name}</h2>
                <p className="text-sm text-slate-500">{company.industry}</p>
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full shrink-0">
                Активный клиент
              </span>
            </div>
            <motion.button
              onClick={() => navigate('/portal')}
              {...cardHover}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800">OBS компании</div>
                <div className="text-xs text-slate-500 mt-0.5">Оргструктура и артефакты команд</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </motion.button>
          </motion.div>
        )}

        {/* Teams list */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Все команды</h3>
            <motion.button
              onClick={() => navigate('/admin/obs')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <PlusCircle className="w-4 h-4" /> Добавить
            </motion.button>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {teamList.map(team => {
              const artCount = Object.keys(team.artifacts).length;
              const head = employees[team.headId];
              return (
                <motion.div
                  key={team.id}
                  variants={fadeUp}
                  {...subtleHover}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0"
                  onClick={() => navigate('/portal/' + team.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{team.name}</div>
                    <div className="text-xs text-slate-400 truncate">{head?.name ?? '—'}</div>
                  </div>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      artCount === 4 ? 'bg-emerald-100 text-emerald-700' :
                      artCount > 0  ? 'bg-amber-100 text-amber-700' :
                                       'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {artCount}/4 арт.
                  </motion.div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
}

const subtleHover = {
  whileHover: { backgroundColor: 'rgb(248 250 252)', transition: { duration: 0.15 } },
};
