import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ArrowLeft, Upload, Eye, Trash2,
  FileText, User, Crown, ChevronDown, ChevronUp, Users, Network
} from 'lucide-react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { ArtifactType, ARTIFACT_META, Employee } from '../types';
import EmployeeArtifactModal from '../components/EmployeeArtifactModal';

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function TeamPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { teams, employees, currentUser, canAccessTeam, uploadArtifact, removeArtifact, uploadEmployeeArtifact, removeEmployeeArtifact } = useApp();

  const isAdmin = currentUser?.role === 'consultant';
  const teamFileRef = useRef<HTMLInputElement>(null);
  const [pendingArtType, setPendingArtType] = useState<ArtifactType | null>(null);
  const empFileRef = useRef<HTMLInputElement>(null);
  const [pendingEmpId, setPendingEmpId] = useState<string | null>(null);
  const [expandedEmps, setExpandedEmps] = useState<Set<string>>(new Set());
  const [viewingEmp, setViewingEmp] = useState<Employee | null>(null);

  if (!teamId || !teams[teamId]) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-slate-400">
          Команда не найдена
        </div>
      </Layout>
    );
  }

  if (!canAccessTeam(teamId)) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-slate-400">
          Нет доступа к этой команде
        </div>
      </Layout>
    );
  }

  const team = teams[teamId];
  const head = employees[team.headId];

  // All members: head first, then regular members
  const memberIds = [team.headId, ...team.members.filter(id => id !== team.headId)];

  // Breadcrumbs
  const path: { id: string; name: string }[] = [];
  let cur = team;
  const visited = new Set<string>();
  while (cur && !visited.has(cur.id)) {
    visited.add(cur.id);
    path.unshift({ id: cur.id, name: cur.name });
    cur = cur.parentTeamId ? teams[cur.parentTeamId] : (undefined as any);
  }

  const ARTIFACT_ORDER: ArtifactType[] = ['heatmap', 'rating', 'readiness', 'motivation'];

  const handleTeamUpload = (type: ArtifactType) => {
    setPendingArtType(type);
    teamFileRef.current?.click();
  };

  const onTeamFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && pendingArtType) {
      await uploadArtifact(teamId, pendingArtType, file);
    }
    e.target.value = '';
    setPendingArtType(null);
  };

  const handleEmpUpload = (empId: string) => {
    setPendingEmpId(empId);
    empFileRef.current?.click();
  };

  const onEmpFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && pendingEmpId) {
      await uploadEmployeeArtifact(pendingEmpId, file);
    }
    e.target.value = '';
    setPendingEmpId(null);
  };

  const toggleEmp = (id: string) => {
    setExpandedEmps(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <Layout>
      {viewingEmp && <EmployeeArtifactModal emp={viewingEmp} onClose={() => setViewingEmp(null)} />}
      <div className="min-h-screen bg-slate-50 pb-16">
        {/* Hidden file inputs */}
        <input ref={teamFileRef} type="file" accept=".pdf,.xlsx,.xls" className="hidden" onChange={onTeamFileChange} />
        <input ref={empFileRef} type="file" accept=".pdf,.xlsx,.xls" className="hidden" onChange={onEmpFileChange} />

        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
          <span className="text-slate-300">/</span>
          {path.map((p, i) => (
            <span key={p.id} className="flex items-center gap-1.5">
              {i < path.length - 1 ? (
                <Link to={`/portal/${p.id}`} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
                  {p.name}
                </Link>
              ) : (
                <span className="text-sm font-semibold text-slate-800">{p.name}</span>
              )}
              {i < path.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
            </span>
          ))}
          <div className="ml-auto">
            <button
              onClick={() => navigate('/portal')}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors"
            >
              <Network className="w-4 h-4" />
              OBS-дерево
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

          {/* Team header */}
          <div className="flex flex-col gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{team.name}</h1>
              {head && (
                <p className="text-sm text-slate-500 mt-1">
                  Руководитель: <span className="font-medium text-slate-700">{head.name}</span> · {head.position}
                </p>
              )}
            </div>
            {team.subTeamIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {team.subTeamIds.map(subId => {
                  const sub = teams[subId];
                  if (!sub) return null;
                  return (
                    <button
                      key={subId}
                      onClick={() => navigate(`/portal/${subId}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-blue-300 hover:text-blue-700 transition-colors shadow-sm"
                    >
                      <Users className="w-3.5 h-3.5" />
                      {sub.name}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Team artifacts */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Артефакты команды</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ARTIFACT_ORDER.map(type => {
                const meta = ARTIFACT_META[type];
                const art = team.artifacts[type];
                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-5 bg-white shadow-sm ${art ? 'border-slate-200' : 'border-dashed border-slate-200'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg} border`}>
                        <FileText className={`w-5 h-5 ${meta.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{meta.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{meta.description}</p>
                      </div>
                    </div>

                    {art ? (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-600 truncate font-medium">{art.fileName}</span>
                          <span className="ml-auto text-[10px] text-slate-400 shrink-0">{fmtDate(art.uploadedAt)}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/portal/${teamId}/artifact/${type}`)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Просмотр
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleTeamUpload(type)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-xs font-medium text-blue-700 transition-colors"
                              >
                                <Upload className="w-3.5 h-3.5" /> Заменить
                              </button>
                              <button
                                onClick={() => removeArtifact(teamId, type)}
                                className="w-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        {isAdmin ? (
                          <button
                            onClick={() => handleTeamUpload(type)}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-xs text-slate-400 hover:text-blue-600 transition-all"
                          >
                            <Upload className="w-3.5 h-3.5" /> Загрузить файл
                          </button>
                        ) : (
                          <p className="text-center text-xs text-slate-400 py-1.5">Файл не загружен</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Employees */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Состав команды <span className="text-slate-400 font-normal text-base">({memberIds.length})</span>
            </h2>
            <div className="space-y-3">
              {memberIds.map((empId, idx) => {
                const emp = employees[empId];
                if (!emp) return null;
                const isHead = empId === team.headId;
                const expanded = expandedEmps.has(empId);
                return (
                  <motion.div
                    key={empId}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    {/* Employee header row */}
                    <button
                      className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
                      onClick={() => toggleEmp(empId)}
                    >
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0 ${
                        isHead ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {initials(emp.name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800 truncate">{emp.name}</span>
                          {isHead && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-semibold shrink-0">
                              <Crown className="w-2.5 h-2.5" /> Руководитель
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{emp.position}</p>
                      </div>

                      {/* Artifact status dot */}
                      <div className="flex items-center gap-2 shrink-0">
                        {emp.artifact ? (
                          <span className="w-2 h-2 bg-emerald-400 rounded-full" title="Артефакт загружен" />
                        ) : (
                          <span className="w-2 h-2 bg-slate-200 rounded-full" title="Артефакт не загружен" />
                        )}
                        {expanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Artifact section */}
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                              Как управлять {emp.name.split(' ')[1] ?? emp.name}
                            </p>
                            {emp.artifact ? (
                              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-slate-700 truncate">{emp.artifact.fileName}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    v{emp.artifact.version} · {fmtDate(emp.artifact.uploadedAt)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => setViewingEmp(emp)}
                                    className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-500 transition-colors"
                                    title="Просмотр"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  {isAdmin && (
                                    <>
                                      <button
                                        onClick={() => handleEmpUpload(empId)}
                                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors"
                                        title="Заменить"
                                      >
                                        <Upload className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => removeEmployeeArtifact(empId)}
                                        className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                                        title="Удалить"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-200">
                                <User className="w-4 h-4 text-slate-300 shrink-0" />
                                <p className="text-xs text-slate-400 flex-1">Файл не загружен</p>
                                {isAdmin && (
                                  <button
                                    onClick={() => handleEmpUpload(empId)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium transition-colors"
                                  >
                                    <Upload className="w-3 h-3" /> Загрузить
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Navigate to sub-team if employee heads one */}
                            {emp.hasTeam && emp.teamId && (
                              <button
                                onClick={() => navigate(`/portal/${emp.teamId}`)}
                                className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Users className="w-3.5 h-3.5" />
                                Перейти в команду
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
