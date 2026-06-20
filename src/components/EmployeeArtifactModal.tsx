import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Calendar, FileText } from 'lucide-react';
import { Employee } from '../types';
import { FileViewer } from './FileViewer';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function EmployeeArtifactModal({ emp, onClose }: { emp: Employee; onClose: () => void }) {
  const artifact = emp.artifact;
  const firstName = emp.name.split(' ')[1] ?? emp.name.split(' ')[0];

  const handleDownload = () => {
    if (!artifact?.fileData) return;
    const a = document.createElement('a');
    a.href = artifact.fileData;
    a.download = artifact.fileName;
    a.click();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-start justify-between shrink-0">
            <div className="min-w-0">
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Индивидуальный профиль</p>
              <h2 className="text-lg font-bold text-white">Как управлять {firstName}</h2>
              <p className="text-blue-200 text-sm mt-0.5 truncate">{emp.name} · {emp.position}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              {artifact?.fileData && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Скачать
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* File meta */}
          {artifact && (
            <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-4 text-xs text-slate-400 shrink-0 bg-slate-50/60">
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />{artifact.fileName}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{fmtDate(artifact.uploadedAt)}</span>
              <span className="bg-slate-200 px-2 py-0.5 rounded-full">Версия {artifact.version}</span>
            </div>
          )}

          {/* File viewer */}
          <div className="flex-1 overflow-auto p-5">
            {!artifact?.fileData ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400 gap-3">
                <FileText className="w-10 h-10 opacity-30" />
                <p className="text-sm font-medium">Файл не загружен или загружен в старой версии</p>
                <p className="text-xs">Загрузите файл заново — просмотр станет доступен</p>
              </div>
            ) : (
              <FileViewer dataUrl={artifact.fileData} fileName={artifact.fileName} />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
