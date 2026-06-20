import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, FileText, Calendar, Download, AlertTriangle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { ArtifactType, ARTIFACT_META } from '../types';

function isPdf(n: string) { return n.toLowerCase().endsWith('.pdf'); }
function isExcel(n: string) { return /\.(xlsx|xls)$/i.test(n); }

function PdfViewer({ dataUrl }: { dataUrl: string }) {
  return (
    <iframe
      src={dataUrl}
      className="w-full rounded-xl border border-slate-200"
      style={{ minHeight: '75vh' }}
      title="PDF"
    />
  );
}

function ExcelViewer({ dataUrl }: { dataUrl: string }) {
  const [sheets, setSheets] = useState<{ name: string; data: (string | number | null)[][] }[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const base64 = dataUrl.split(',')[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const wb = XLSX.read(bytes, { type: 'array' });
      setSheets(wb.SheetNames.map(name => ({
        name,
        data: XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: null }) as (string | number | null)[][],
      })));
    } catch {
      setError('Не удалось прочитать файл Excel');
    }
  }, [dataUrl]);

  if (error) return <p className="text-red-500 p-4">{error}</p>;
  if (!sheets.length) return <div className="flex items-center gap-2 p-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Загрузка...</div>;

  const sheet = sheets[activeSheet];
  return (
    <div>
      {sheets.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {sheets.map((s, i) => (
            <button key={i} onClick={() => setActiveSheet(i)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${i === activeSheet ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s.name}
            </button>
          ))}
        </div>
      )}
      <div className="overflow-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm border-collapse">
          <tbody>
            {sheet.data.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                {row.map((cell, ci) => (
                  ri === 0
                    ? <th key={ci} className="px-3 py-2.5 text-left text-xs font-semibold text-slate-700 border-b border-slate-200 bg-slate-50 whitespace-nowrap sticky top-0">{String(cell ?? '')}</th>
                    : <td key={ci} className="px-3 py-2 text-slate-600 border-b border-slate-100 whitespace-nowrap">{cell !== null && cell !== undefined ? String(cell) : ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 mt-2">{sheet.data.length} строк · {sheet.data[0]?.length ?? 0} колонок</p>
    </div>
  );
}

export default function ArtifactPage() {
  const { teamId, artifactType } = useParams<{ teamId: string; artifactType: string }>();
  const navigate = useNavigate();
  const { teams } = useApp();

  const team = teamId ? teams[teamId] : null;
  const type = artifactType as ArtifactType;
  const artifact = team?.artifacts[type];
  const meta = ARTIFACT_META[type];

  if (!team || !artifact || !meta) {
    return <Layout><div className="flex items-center justify-center h-64 text-slate-400">Артефакт не найден</div></Layout>;
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });

  const handleDownload = () => {
    if (!artifact.fileData) return;
    const a = document.createElement('a');
    a.href = artifact.fileData;
    a.download = artifact.fileName;
    a.click();
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" /> Назад
        </button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${meta.bg} border`}>
              <FileText className={`w-6 h-6 ${meta.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{team.name}</p>
              <h1 className="text-xl font-bold text-slate-900 mt-0.5">{meta.label}</h1>
              <p className="text-sm text-slate-500">{meta.description}</p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{fmtDate(artifact.uploadedAt)}</span>
                <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{artifact.fileName}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-full">Версия {artifact.version}</span>
              </div>
            </div>
            {artifact.fileData && (
              <button onClick={handleDownload}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors shrink-0">
                <Download className="w-4 h-4" /> Скачать
              </button>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          {!artifact.fileData ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <AlertTriangle className="w-10 h-10 opacity-30" />
              <p className="text-sm font-medium text-center">Файл не прикреплён или загружен в старой версии</p>
              <p className="text-xs text-center">Загрузите файл заново — просмотр будет доступен</p>
            </div>
          ) : isPdf(artifact.fileName) ? (
            <PdfViewer dataUrl={artifact.fileData} />
          ) : isExcel(artifact.fileName) ? (
            <ExcelViewer dataUrl={artifact.fileData} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <FileText className="w-10 h-10 opacity-40" />
              <p className="text-sm">Формат файла не поддерживает предварительный просмотр</p>
              <button onClick={handleDownload} className="text-blue-600 text-sm hover:underline mt-1">Скачать файл</button>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
