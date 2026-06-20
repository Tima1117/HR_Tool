import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Users, FileText, Settings, ChevronRight, BarChart2, PlusCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import { useApp } from '../../context/AppContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { teams, employees, companies, currentCompanyId } = useApp();

  const company = currentCompanyId ? companies[currentCompanyId] : Object.values(companies)[0];
  const teamList = Object.values(teams).filter(t => t.companyId === company?.id);
  const empList = Object.values(employees);
  const totalArtifacts = teamList.reduce((sum, t) => sum + Object.keys(t.artifacts).length, 0);
  const fullTeams = teamList.filter(t => Object.keys(t.artifacts).length === 4).length;

  const stats = [
    { label: 'Команд в структуре', value: teamList.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Сотрудников', value: empList.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Загружено артефактов', value: `${totalArtifacts} / ${teamList.length * 4}`, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Команд с полным аудитом', value: fullTeams, icon: BarChart2, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Панель консультанта</h1>
          <p className="text-slate-500 mt-1">Управление организационной структурой и артефактами аудита</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-card p-5"
            >
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Company card */}
        {company && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden"
          >
            <div className="flex items-start gap-4 p-6 border-b border-slate-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-800">{company.name}</h2>
                <p className="text-sm text-slate-500">{company.industry}</p>
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full shrink-0">
                Активный клиент
              </span>
            </div>

            {/* Actions */}
            <div className="divide-y divide-slate-100">
              <ActionRow
                icon={<Users className="w-5 h-5 text-blue-500" />}
                title="OBS компании"
                description="Оргструктура и артефакты команд"
                onClick={() => navigate('/portal')}
              />
            </div>
          </motion.div>
        )}

        {/* Teams overview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-card"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Все команды</h3>
            <button
              onClick={() => navigate('/admin/obs')}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              Добавить
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {teamList.map(team => {
              const artCount = Object.keys(team.artifacts).length;
              const head = employees[team.headId];
              return (
                <div
                  key={team.id}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/team/${team.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{team.name}</div>
                    <div className="text-xs text-slate-400 truncate">{head?.name ?? head?.code ?? '—'}</div>
                  </div>
                  <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    artCount === 4 ? 'bg-emerald-100 text-emerald-700' :
                    artCount > 0 ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {artCount}/4 арт.
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}

function ActionRow({
  icon, title, description, onClick,
}: {
  icon: React.ReactNode; title: string; description: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left"
    >
      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        <div className="text-xs text-slate-500 mt-0.5">{description}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
    </button>
  );
}
