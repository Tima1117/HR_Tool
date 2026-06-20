import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Upload, Trash2, CheckCircle, ChevronRight, Users, Eye, FileText } from 'lucide-react';
import Layout from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import { ArtifactType, ARTIFACT_META } from '../../types';

const ARTIFACT_TYPES: ArtifactType[] = ['heatmap', 'rating', 'readiness', 'motivation'];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AdminTeamPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { teams, employees, uploadArtifact, removeArtifact } = useApp();
  const [uploadingType, setUploadingType] = useState<ArtifactType | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<ArtifactType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const team = teamId ? teams[teamId] : null;
  if (!team || !teamId) {
    return <Layout><div className="flex items-center justify-center h-64 text-slate-400">Команда не найдена</div></Layout>;
  }

  const head = employees[team.headId];
  const parentTeam = team.parentTeamId ? teams[team.parentTeamId] : null;

  const handleUploadClick = (type: ArtifactType) => {
    setUploadingType(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingType) {
      await uploadArtifact(teamId, uploadingType, file);
      setUploadSuccess(uploadingType);
      setTimeout(() => setUploadSuccess(null), 3000);
    }
    setUploadingType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (type: ArtifactType) => {
    if (confirm('Удалить артефакт "' + ARTIFACT_META[type].label + '"?')) {
      removeArtifact(teamId, type);
    }
  };

  return (
    <Layout>
      <input ref={fileInputRef} type="file" accept=".pdf,.xlsx,.xls" className="hidden" onChange={handleFileChange} />

      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <button onClick={() => navigate('/admin')} className="hover:text-blue-600 transition-colors">Консультант</button>
          <ChevronRight className="w-3.5 h-3.5" />
          {parentTeam && (
            <>
              <button onClick={() => navigate('/admin/team/' + parentTeam.id)} className="hover:text-blue-600 transition-colors">{parentTeam.name}</button>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="text-slate-800 font-medium">{team.name}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-800">{team.name}</h1>
              <p className="text-sm text-slate-500 mt-1">
                Руководитель: <span className="font-medium text-slate-700">{head?.name ?? '—'}</span>
                <span className="mx-2 text-slate-300">·</span>
                {team.members.length} сотрудников
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-sm font-medium ${Object.keys(team.artifacts).length === 4 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {Object.keys(team.artifacts).length}/4 артефактов
            </div>
          </div>
        </div>

        <AnimatePresence>
          {uploadSuccess && (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3 rounded-xl text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              Артефакт «{ARTIFACT_META[uploadSuccess].label}» успешно загружен
            </motion.div>
          )}
        </AnimatePresence>

        {/* Artifacts */}
        <div>
          <h2 className="text-base font-semibold text-slate-700 mb-4">Артефакты команды</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ARTIFACT_TYPES.map(type => {
              const meta = ARTIFACT_META[type];
              const art = team.artifacts[type];
              return (
                <div key={type} className={`rounded-2xl border p-5 bg-white shadow-sm ${art ? 'border-slate-200' : 'border-dashed border-slate-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg} border`}>
                      <FileText className={'w-5 h-5 ' + meta.color} />
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
                        <span className="text-xs text-slate-600 truncate font-medium flex-1">{art.fileName}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{fmtDate(art.uploadedAt)}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => navigate('/portal/' + teamId + '/artifact/' + type)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors">
                          <Eye className="w-3.5 h-3.5" /> Просмотр
                        </button>
                        <button onClick={() => handleUploadClick(type)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-xs font-medium text-blue-700 transition-colors">
                          <Upload className="w-3.5 h-3.5" /> Заменить
                        </button>
                        <button onClick={() => handleRemove(type)}
                          className="w-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <button onClick={() => handleUploadClick(type)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-xs text-slate-400 hover:text-blue-600 transition-all">
                        <Upload className="w-3.5 h-3.5" /> Загрузить файл
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sub-teams */}
        {team.subTeamIds.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-slate-700 mb-4">Подчинённые команды</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {team.subTeamIds.map(subId => {
                const sub = teams[subId];
                if (!sub) return null;
                const subHead = employees[sub.headId];
                const artCount = Object.keys(sub.artifacts).length;
                return (
                  <button key={subId} onClick={() => navigate('/admin/team/' + subId)}
                    className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all text-left shadow-sm">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm">{sub.name}</div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{subHead?.name}</div>
                    </div>
                    <div className={'text-xs font-medium px-2 py-1 rounded-full shrink-0 ' + (artCount === 4 ? 'bg-emerald-100 text-emerald-700' : artCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500')}>
                      {artCount}/4
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Members */}
        <div>
          <h2 className="text-base font-semibold text-slate-700 mb-4">Состав команды</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            {team.members.map(memberId => {
              const member = employees[memberId];
              if (!member) return null;
              return (
                <div key={memberId} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-sm font-medium shrink-0">
                    {member.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{member.name}</div>
                    <div className="text-xs text-slate-400 truncate">{member.position}</div>
                  </div>
                  <span className="text-xs font-mono text-slate-300 shrink-0">{member.code}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
