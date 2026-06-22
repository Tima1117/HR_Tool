import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Pencil, Network, List } from 'lucide-react';
import Layout from '../components/Layout';
import WhiteboardTree from '../components/WhiteboardTree';
import OBSListView from '../components/OBSListView';
import { useApp } from '../context/AppContext';
import { useIsMobile } from '../hooks/useIsMobile';

export default function WhiteboardPage() {
  const navigate = useNavigate();
  const { teams, currentUser, currentCompanyId, companies } = useApp();
  const isAdmin = currentUser?.role === 'consultant';
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'whiteboard' | 'list'>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'list' : 'whiteboard'
  );

  let rootTeamId = '';
  if (isAdmin) {
    rootTeamId = currentCompanyId ? (companies[currentCompanyId]?.rootTeamId ?? '') : '';
  } else {
    rootTeamId = currentUser?.rootTeamId ?? '';
  }

  const currentCompany = currentCompanyId ? companies[currentCompanyId] : null;

  return (
    <Layout>
      <div style={{ height: isMobile ? 'calc(100vh - 56px - 64px)' : 'calc(100vh - 56px)', position: 'relative' }}>
        {rootTeamId ? (
          <>
            {/* View toggle */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => setViewMode('whiteboard')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'whiteboard' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Network className="w-4 h-4" />
                <span className="hidden sm:inline">Дерево</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Структура</span>
              </button>
            </div>

            {/* Edit button for admin — hidden on mobile (use admin panel from bottom nav) */}
            {isAdmin && !isMobile && (
              <button
                onClick={() => navigate('/admin/obs')}
                className="absolute top-3 right-4 z-20 flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 text-slate-600 text-sm font-medium transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Редактировать
              </button>
            )}

            {viewMode === 'whiteboard' ? (
              <WhiteboardTree
                rootTeamId={rootTeamId}
                selectedTeamId={null}
                onSelectTeam={id => navigate('/portal/' + id)}
              />
            ) : (
              <div className="h-full overflow-y-auto pt-14 pb-4 sm:pt-16 sm:pb-8">
                <div className="max-w-2xl mx-auto px-3 sm:px-4">
                  <h2 className="text-lg font-bold text-slate-800 mb-1">
                    {currentCompany?.name ?? 'Структура организации'}
                  </h2>
                  {currentCompany && <p className="text-sm text-slate-500 mb-4">{currentCompany.industry}</p>}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <OBSListView rootTeamId={rootTeamId} onSelect={id => navigate('/portal/' + id)} />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
            <Users className="w-16 h-16 opacity-20" />
            <p className="text-lg font-medium">Дерево компании не создано</p>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin/obs')}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Создать OBS-структуру
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
