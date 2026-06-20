import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Loader2, FileText, Download } from 'lucide-react';

export function isPdf(n: string) { return n.toLowerCase().endsWith('.pdf'); }
export function isExcel(n: string) { return /\.(xlsx|xls)$/i.test(n); }

export function PdfViewer({ dataUrl }: { dataUrl: string }) {
  return (
    <iframe
      src={dataUrl}
      className="w-full rounded-xl border border-slate-200"
      style={{ minHeight: '65vh' }}
      title="PDF"
    />
  );
}

export function ExcelViewer({ dataUrl }: { dataUrl: string }) {
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

  if (error) return <p className="text-red-500 p-4 text-sm">{error}</p>;
  if (!sheets.length) return (
    <div className="flex items-center gap-2 p-8 text-slate-400">
      <Loader2 className="w-4 h-4 animate-spin" /> Загрузка...
    </div>
  );

  const sheet = sheets[activeSheet];
  return (
    <div>
      {sheets.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {sheets.map((s, i) => (
            <button key={i} onClick={() => setActiveSheet(i)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                i === activeSheet ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {s.name}
            </button>
          ))}
        </div>
      )}
      <div className="overflow-auto rounded-xl border border-slate-200 max-h-[60vh]">
        <table className="min-w-full text-sm border-collapse">
          <tbody>
            {sheet.data.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                {row.map((cell, ci) => (
                  ri === 0
                    ? <th key={ci} className="px-3 py-2.5 text-left text-xs font-semibold text-slate-700 border-b border-slate-200 bg-slate-50 whitespace-nowrap sticky top-0 z-10">{String(cell ?? '')}</th>
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

export function UnsupportedFile({ fileName, onDownload }: { fileName: string; onDownload?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
      <FileText className="w-10 h-10 opacity-40" />
      <p className="text-sm">{fileName}</p>
      <p className="text-xs">Формат файла не поддерживает предварительный просмотр</p>
      {onDownload && (
        <button onClick={onDownload} className="flex items-center gap-1.5 text-blue-600 text-sm hover:underline mt-1">
          <Download className="w-3.5 h-3.5" /> Скачать файл
        </button>
      )}
    </div>
  );
}

export function FileViewer({ dataUrl, fileName }: { dataUrl: string; fileName: string }) {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    a.click();
  };

  if (isPdf(fileName)) return <PdfViewer dataUrl={dataUrl} />;
  if (isExcel(fileName)) return <ExcelViewer dataUrl={dataUrl} />;
  return <UnsupportedFile fileName={fileName} onDownload={handleDownload} />;
}
