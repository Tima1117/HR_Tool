import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Users, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Team, Employee } from '../types';

interface NodeProps {
  teamId: string;
  depth: number;
  teams: Record<string, Team>;
  employees: Record<string, Employee>;
  onSelect: (id: string) => void;
}

function ListNode({ teamId, depth, teams, employees, onSelect }: NodeProps) {
  const team = teams[teamId];
  if (!team) return null;
  const head = employees[team.headId];
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = team.subTeamIds.length > 0 || team.members.length > 0;
  const artCount = Object.keys(team.artifacts).length;

  return (
    <div className={depth > 0 ? 'ml-5 pl-4 border-l-2 border-slate-100' : ''}>
      <div className="flex items-center gap-2 py-2">
        <button
          onClick={() => setExpanded(v => !v)}
          className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
            hasChildren ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-transparent pointer-events-none'
          }`}
        >
          {hasChildren ? (expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : null}
        </button>

        <button
          onClick={() => onSelect(teamId)}
          className="flex items-center gap-2 flex-1 min-w-0 hover:bg-slate-50 rounded-lg px-2 py-1 transition-colors text-left"
        >
          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <Users className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-slate-800">{team.name}</span>
            {head && <span className="ml-2 text-xs text-slate-400">{head.name}</span>}
          </div>
          {artCount > 0 && (
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium shrink-0">
              {artCount}/4 арт.
            </span>
          )}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {team.subTeamIds.map(subId => (
              <ListNode key={subId} teamId={subId} depth={depth + 1} teams={teams} employees={employees} onSelect={onSelect} />
            ))}
            {team.members.map(memberId => {
              const member = employees[memberId];
              if (!member) return null;
              return (
                <div key={memberId} className="ml-10 flex items-center gap-2 py-1.5 text-slate-500">
                  <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-2.5 h-2.5 text-slate-400" />
                  </div>
                  <span className="text-sm truncate">{member.name}</span>
                  <span className="text-xs text-slate-400 truncate hidden sm:block">{member.position}</span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OBSListView({ rootTeamId, onSelect }: { rootTeamId: string; onSelect: (id: string) => void }) {
  const { teams, employees } = useApp();

  return (
    <div className="p-4">
      <ListNode
        teamId={rootTeamId}
        depth={0}
        teams={teams}
        employees={employees}
        onSelect={onSelect}
      />
    </div>
  );
}
