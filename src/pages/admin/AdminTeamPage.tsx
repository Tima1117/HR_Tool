import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Upload, Trash2, CheckCircle, ChevronRight, Users } from 'lucide-react';
import Layout from '../../components/Layout';
import ArtifactPanel from '../../components/ArtifactPanel';
import { useApp } from '../../context/AppContext';
import { ArtifactType, ARTIFACT_META } from '../../types';

const ARTIFACT_TYPES: ArtifactType[] = ['heatmap', 'rating', 'readiness', 'motivation'];

export default function AdminTeamPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { teams, employees, uploadArtifact, removeArtifact } = useApp();
  const [uploadingType, setUploadingType] = useState<ArtifactType | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<ArtifactType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const team = teamId ? teams[teamId] : null;
  if (!team || !teamId) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-slate-400">Команда не найдена</div>
      </Layout>
    );
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
    if (confirm(`Удалить артефакт "${ARTIFACT_META[type].label}"?`)) {
      removeArtifact(teamId, type);
    }
  };

  return (
    <Layout>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Back nav */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button onClick={() => navigate('/admin')} className="hover:text-blue-600 transition-colors">
            Консультант
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          {parentTeam && (
            <>
              <button onClick={() => navigate(`/admin/team/${parentTeam.id}`)} className="hover:text-blue-600 transition-colors">
                {parentTeam.name}
              </button>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="text-slate-800 font-medium">{team.name}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-800">{team.name}</h1>
              <p className="text-sm text-slate-500 mt-1">
                Руководитель: <span className="font-medium text-slate-700">{head?.name ?? head?.code ?? '—'}</span>
                <span className="ml-3 text-slate-400">·</span>
                <span className="ml-3">{team.members.length} сотрудников</span>
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-sm font-medium ${
              Object.keys(team.artifacts).length === 4
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {Object.keys(team.artifacts).length}/4 артефактов
            </div>
          </div>
        </div>

        {/* Upload success toast */}
        <AnimatePresence>
          {uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3 rounded-xl text-sm"
            >
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Артефакт «{ARTIFACT_META[uploadSuccess].label}» успешно загружен
                <span className="text-emerald-600 ml-1">(демо — файл не сохраняется на сервер)</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Artifacts grid */}
        <div>
          <h2 className="text-base font-semibold text-slate-700 mb-4">Артефакты команды</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ARTIFACT_TYPES.map(type => (
              <ArtifactPanel
                key={type}
                type={type}
                artifact={team.artifacts[type]}
                teamId={teamId}
                isAdmin
                onUpload={() => handleUploadClick(type)}
                onRemove={() => handleRemove(type)}
              />
            ))}
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
                  <button
                    key={subId}
                    onClick={() => navigate(`/admin/team/${subId}`)}
                    className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-card-hover transition-all text-left shadow-card"
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm">{sub.name}</div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{subHead?.name ?? subHead?.code}</div>
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
                      artCount === 4 ? 'bg-emerald-100 text-emerald-700' :
                      artCount > 0 ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card divide-y divide-slate-100">
            {team.members.map(memberId => {
              const member = employees[memberId];
              if (!member) return null;
              return (
                <div key={memberId} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-sm font-medium shrink-0">
                    {member.name.split(' ').slice(0, 2).map(w => w[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800">{member.name}</div>
                    <div className="text-xs text-slate-400">{member.position}</div>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">{member.code}</div>
                  {member.hasTeam && member.teamId && (
                    <button
                      onClick={() => navigate(`/admin/team/${member.teamId}`)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Команда
                    </button>
                  )}
                </div>
              );
            })}
            {team.members.length === 0 && (
              <div className="py-6 text-center text-sm text-slate-400">Нет сотрудников</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
