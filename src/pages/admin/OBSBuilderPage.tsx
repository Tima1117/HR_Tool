import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronDown, ChevronRight, PlusCircle, Trash2,
  User, Users, Check, X, Save, RotateCcw, Eye, Crown,
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import { Team, Employee } from '../../types';

interface NewItemForm {
  parentTeamId: string;
  type: 'team' | 'employee';
  value: string;
  position: string;
  isHead: boolean;
}

type EditTarget =
  | { kind: 'teamName'; teamId: string; value: string }
  | { kind: 'empName'; empId: string; value: string }
  | { kind: 'empPosition'; empId: string; value: string };

interface TeamNodeProps {
  teamId: string;
  depth: number;
  teams: Record<string, Team>;
  employees: Record<string, Employee>;
  expandedTeams: Set<string>;
  newItemForm: NewItemForm | null;
  editTarget: EditTarget | null;
  onToggle: (id: string) => void;
  onStartAdd: (parentId: string, type: 'team' | 'employee') => void;
  onConfirm: () => void;
  onCancel: () => void;
  onFormChange: (patch: Partial<NewItemForm>) => void;
  onRemoveEmployee: (empId: string, teamId: string) => void;
  onRemoveTeam: (teamId: string) => void;
  onSetHead: (empId: string, teamId: string) => void;
  onStartEdit: (target: EditTarget) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onEditChange: (value: string) => void;
  companyId: string;
}

function InlineInput({
  value, onChange, onCommit, onCancel, placeholder, className,
}: {
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      autoFocus
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter') onCommit(); if (e.key === 'Escape') onCancel(); }}
      onBlur={onCommit}
      placeholder={placeholder}
      className={`px-1.5 py-0.5 rounded border border-blue-400 outline-none bg-white text-sm focus:ring-1 focus:ring-blue-300 ${className ?? ''}`}
    />
  );
}

function TeamNode({
  teamId, depth, teams, employees, expandedTeams, newItemForm, editTarget,
  onToggle, onStartAdd, onConfirm, onCancel, onFormChange,
  onRemoveEmployee, onRemoveTeam, onSetHead, onStartEdit, onCommitEdit, onCancelEdit, onEditChange,
}: TeamNodeProps) {
  const team = teams[teamId];
  if (!team) return null;
  const head = employees[team.headId];
  const isExpanded = expandedTeams.has(teamId);
  const isAddingHere = newItemForm?.parentTeamId === teamId;
  const hasChildren = team.subTeamIds.length > 0 || team.members.length > 0;
  const isEditingTeamName = editTarget?.kind === 'teamName' && editTarget.teamId === teamId;

  return (
    <div className={depth > 0 ? 'ml-4 pl-4 border-l-2 border-slate-100' : ''}>
      <div className="flex items-center gap-2 py-2 group">
        <button
          onClick={() => onToggle(teamId)}
          className={`w-6 h-6 flex items-center justify-center rounded transition-colors shrink-0 ${
            hasChildren || isAddingHere
              ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              : 'text-transparent pointer-events-none'
          }`}
        >
          {(hasChildren || isAddingHere)
            ? isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            : null}
        </button>

        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
          <Users className="w-3.5 h-3.5 text-blue-600" />
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-2">
          {isEditingTeamName ? (
            <InlineInput
              value={editTarget.value}
              onChange={onEditChange}
              onCommit={onCommitEdit}
              onCancel={onCancelEdit}
              placeholder="Название отдела"
              className="flex-1 font-semibold"
            />
          ) : (
            <span
              className="text-sm font-semibold text-slate-800 cursor-pointer hover:text-blue-600 hover:underline underline-offset-2 decoration-dotted"
              onClick={() => onStartEdit({ kind: 'teamName', teamId, value: team.name })}
              title="Нажмите для редактирования"
            >
              {team.name}
            </span>
          )}
          {head && !isEditingTeamName && (
            <span className="text-xs text-slate-400 truncate">{head.name}</span>
          )}
        </div>

        {Object.keys(team.artifacts).length > 0 && (
          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium shrink-0">
            {Object.keys(team.artifacts).length} арт.
          </span>
        )}

        <div className="hidden group-hover:flex items-center gap-1 shrink-0">
          <button
            onClick={() => onStartAdd(teamId, 'team')}
            className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Отдел
          </button>
          <button
            onClick={() => onStartAdd(teamId, 'employee')}
            className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Сотрудник
          </button>
          {depth > 0 && (
            <button
              onClick={() => onRemoveTeam(teamId)}
              className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {team.subTeamIds.map(subId => (
              <TeamNode
                key={subId}
                teamId={subId}
                depth={depth + 1}
                teams={teams}
                employees={employees}
                expandedTeams={expandedTeams}
                newItemForm={newItemForm}
                editTarget={editTarget}
                onToggle={onToggle}
                onStartAdd={onStartAdd}
                onConfirm={onConfirm}
                onCancel={onCancel}
                onFormChange={onFormChange}
                onRemoveEmployee={onRemoveEmployee}
                onRemoveTeam={onRemoveTeam}
                onSetHead={onSetHead}
                onStartEdit={onStartEdit}
                onCommitEdit={onCommitEdit}
                onCancelEdit={onCancelEdit}
                onEditChange={onEditChange}
                companyId={team.companyId}
              />
            ))}

            {/* Head employee row */}
            {head && (
              <EmployeeRow
                emp={head}
                teamId={teamId}
                isHead={true}
                editTarget={editTarget}
                onRemove={() => {}}
                onSetHead={() => {}}
                onStartEdit={onStartEdit}
                onCommitEdit={onCommitEdit}
                onCancelEdit={onCancelEdit}
                onEditChange={onEditChange}
              />
            )}

            {/* Member rows */}
            {team.members.map(memberId => {
              const member = employees[memberId];
              if (!member) return null;
              return (
                <EmployeeRow
                  key={memberId}
                  emp={member}
                  teamId={teamId}
                  isHead={false}
                  editTarget={editTarget}
                  onRemove={() => onRemoveEmployee(memberId, teamId)}
                  onSetHead={() => onSetHead(memberId, teamId)}
                  onStartEdit={onStartEdit}
                  onCommitEdit={onCommitEdit}
                  onCancelEdit={onCancelEdit}
                  onEditChange={onEditChange}
                />
              );
            })}

            {isAddingHere && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="ml-10 mt-2 mb-2 p-3 bg-blue-50 border border-blue-200 rounded-xl"
              >
                <p className="text-xs font-semibold text-blue-700 mb-2">
                  {newItemForm?.type === 'team' ? '+ Новый отдел' : '+ Новый сотрудник'}
                </p>
                <div className="space-y-2">
                  <input
                    autoFocus
                    type="text"
                    value={newItemForm?.value ?? ''}
                    onChange={e => onFormChange({ value: e.target.value })}
                    onKeyDown={e => { if (e.key === 'Enter') onConfirm(); if (e.key === 'Escape') onCancel(); }}
                    placeholder={newItemForm?.type === 'team' ? 'Название отдела' : 'ФИО сотрудника'}
                    className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:border-blue-400 outline-none text-sm bg-white"
                  />
                  <input
                    type="text"
                    value={newItemForm?.position ?? ''}
                    onChange={e => onFormChange({ position: e.target.value })}
                    onKeyDown={e => { if (e.key === 'Enter') onConfirm(); if (e.key === 'Escape') onCancel(); }}
                    placeholder={newItemForm?.type === 'team' ? 'Имя руководителя' : 'Должность'}
                    className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:border-blue-400 outline-none text-sm bg-white"
                  />

                  {newItemForm?.type === 'employee' && (
                    <button
                      type="button"
                      onClick={() => onFormChange({ isHead: !newItemForm.isHead })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all w-full ${
                        newItemForm.isHead
                          ? 'bg-amber-50 border-amber-300 text-amber-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                        newItemForm.isHead
                          ? 'bg-amber-400 border-amber-400'
                          : 'border-slate-300'
                      }`}>
                        {newItemForm.isHead && <Crown className="w-3 h-3 text-white" />}
                      </div>
                      Назначить руководителем отдела
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={onConfirm}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> Добавить
                    </button>
                    <button
                      onClick={onCancel}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-600 rounded-lg text-xs font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Отмена
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {!isAddingHere && (
              <div className="ml-10 flex gap-2 mt-1 mb-2">
                <button
                  onClick={() => onStartAdd(teamId, 'team')}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 py-1 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Добавить отдел
                </button>
                <span className="text-slate-200">·</span>
                <button
                  onClick={() => onStartAdd(teamId, 'employee')}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-600 py-1 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Добавить сотрудника
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmployeeRow({
  emp, teamId, isHead, editTarget, onRemove, onSetHead, onStartEdit, onCommitEdit, onCancelEdit, onEditChange,
}: {
  emp: Employee;
  teamId: string;
  isHead: boolean;
  editTarget: EditTarget | null;
  onRemove: () => void;
  onSetHead: () => void;
  onStartEdit: (t: EditTarget) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onEditChange: (v: string) => void;
}) {
  const isEditingName = editTarget?.kind === 'empName' && editTarget.empId === emp.id;
  const isEditingPos = editTarget?.kind === 'empPosition' && editTarget.empId === emp.id;

  return (
    <div className="ml-10 flex items-center gap-2 py-1.5 group/member min-w-0">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isHead ? 'bg-amber-100' : 'bg-slate-100'}`}>
        {isHead
          ? <Crown className="w-3 h-3 text-amber-500" />
          : <User className="w-3 h-3 text-slate-400" />}
      </div>

      {isEditingName ? (
        <InlineInput
          value={editTarget.value}
          onChange={onEditChange}
          onCommit={onCommitEdit}
          onCancel={onCancelEdit}
          placeholder="ФИО"
          className="flex-1 min-w-0"
        />
      ) : (
        <span
          className="text-sm text-slate-700 truncate cursor-pointer hover:text-blue-600 hover:underline underline-offset-2 decoration-dotted"
          onClick={() => onStartEdit({ kind: 'empName', empId: emp.id, value: emp.name })}
          title="Нажмите для редактирования"
        >
          {emp.name}
        </span>
      )}

      {isEditingPos ? (
        <InlineInput
          value={editTarget.value}
          onChange={onEditChange}
          onCommit={onCommitEdit}
          onCancel={onCancelEdit}
          placeholder="Должность"
          className="w-36 shrink-0"
        />
      ) : (
        <span
          className="text-xs text-slate-400 truncate cursor-pointer hover:text-blue-500 hover:underline underline-offset-2 decoration-dotted hidden sm:block"
          onClick={() => onStartEdit({ kind: 'empPosition', empId: emp.id, value: emp.position })}
          title="Нажмите для редактирования"
        >
          {emp.position}
        </span>
      )}

      <span className="text-xs font-mono text-slate-300 shrink-0">{emp.code}</span>
      {!isHead && (
        <div className="hidden group-hover/member:flex items-center gap-1 shrink-0">
          <button
            onClick={onSetHead}
            title="Назначить руководителем"
            className="w-5 h-5 flex items-center justify-center rounded text-amber-400 hover:bg-amber-50 transition-colors"
          >
            <Crown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRemove}
            className="w-5 h-5 flex items-center justify-center rounded text-red-400 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function OBSBuilderPage() {
  const navigate = useNavigate();
  const { teams, employees, addTeam, updateTeam, removeTeam, addEmployee, updateEmployee, removeEmployee, resetData, companies } = useApp();
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set(Object.keys(teams)));
  const [newItemForm, setNewItemForm] = useState<NewItemForm | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const company = Object.values(companies)[0];
  const rootTeamId = company?.rootTeamId ?? Object.values(teams).find(t => !t.parentTeamId)?.id;

  const handleToggle = useCallback((teamId: string) => {
    setExpandedTeams(prev => {
      const next = new Set(prev);
      next.has(teamId) ? next.delete(teamId) : next.add(teamId);
      return next;
    });
  }, []);

  const handleStartAdd = useCallback((parentTeamId: string, type: 'team' | 'employee') => {
    setNewItemForm({ parentTeamId, type, value: '', position: '', isHead: false });
    setExpandedTeams(prev => new Set([...prev, parentTeamId]));
  }, []);

  const handleFormChange = useCallback((patch: Partial<NewItemForm>) => {
    setNewItemForm(f => f ? { ...f, ...patch } : f);
  }, []);

  const handleCancel = useCallback(() => setNewItemForm(null), []);

  const handleConfirm = useCallback(() => {
    if (!newItemForm || !newItemForm.value.trim()) return;
    const { parentTeamId, type, value, position, isHead } = newItemForm;

    if (type === 'team') {
      const newId = 'team-' + Date.now();
      const newEmpId = 'emp-' + Date.now();
      const newEmp: Employee = {
        id: newEmpId,
        code: 'EMP-' + String(Object.keys(employees).length + 1).padStart(3, '0'),
        name: position?.trim() || 'Руководитель',
        position: 'Руководитель',
        hasTeam: true,
        teamId: newId,
      };
      const newTeam: Team = {
        id: newId,
        name: value.trim(),
        headId: newEmpId,
        members: [],
        subTeamIds: [],
        parentTeamId,
        companyId: company?.id ?? 'company-001',
        artifacts: {},
      };
      addEmployee(newEmp);
      addTeam(newTeam);
      const parent = teams[parentTeamId];
      if (parent) updateTeam({ ...parent, subTeamIds: [...parent.subTeamIds, newId] });
      setExpandedTeams(prev => new Set([...prev, newId]));
    } else {
      const newId = 'emp-' + Date.now();
      const newEmp: Employee = {
        id: newId,
        code: 'EMP-' + String(Object.keys(employees).length + 1).padStart(3, '0'),
        name: value.trim(),
        position: position?.trim() || 'Сотрудник',
        hasTeam: false,
      };
      addEmployee(newEmp);
      const parent = teams[parentTeamId];
      if (parent) {
        if (isHead) {
          updateTeam({ ...parent, headId: newId });
        } else {
          updateTeam({ ...parent, members: [...parent.members, newId] });
        }
      }
    }
    setNewItemForm(null);
  }, [newItemForm, employees, teams, company, addEmployee, addTeam, updateTeam]);

  const handleRemoveEmployee = useCallback((empId: string, teamId: string) => {
    if (!confirm('Удалить сотрудника?')) return;
    removeEmployee(empId);
    const team = teams[teamId];
    if (team) updateTeam({ ...team, members: team.members.filter(id => id !== empId) });
  }, [teams, removeEmployee, updateTeam]);

  const handleRemoveTeam = useCallback((teamId: string) => {
    if (!confirm('Удалить отдел и всё его содержимое?')) return;
    removeTeam(teamId);
  }, [removeTeam]);

  const handleSetHead = useCallback((empId: string, teamId: string) => {
    const team = teams[teamId];
    if (!team || team.headId === empId) return;
    const oldHeadId = team.headId;
    updateTeam({
      ...team,
      headId: empId,
      // old head becomes a regular member; new head removed from members
      members: [...team.members.filter(id => id !== empId), oldHeadId],
    });
  }, [teams, updateTeam]);

  const handleStartEdit = useCallback((target: EditTarget) => {
    setEditTarget(target);
  }, []);

  const handleEditChange = useCallback((value: string) => {
    setEditTarget(prev => prev ? { ...prev, value } : prev);
  }, []);

  const handleCommitEdit = useCallback(() => {
    if (!editTarget) return;
    const val = editTarget.value.trim();
    if (!val) { setEditTarget(null); return; }

    if (editTarget.kind === 'teamName') {
      const team = teams[editTarget.teamId];
      if (team) updateTeam({ ...team, name: val });
    } else if (editTarget.kind === 'empName') {
      const emp = employees[editTarget.empId];
      if (emp) updateEmployee({ ...emp, name: val });
    } else if (editTarget.kind === 'empPosition') {
      const emp = employees[editTarget.empId];
      if (emp) updateEmployee({ ...emp, position: val });
    }
    setEditTarget(null);
  }, [editTarget, teams, employees, updateTeam, updateEmployee]);

  const handleCancelEdit = useCallback(() => setEditTarget(null), []);

  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => navigate('/portal')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Назад
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">Редактор OBS-структуры</h1>
            <p className="text-sm text-slate-500 mt-0.5">{company?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (confirm('Сбросить все изменения к демо-данным?')) resetData(); }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Сбросить
            </button>
            <button
              onClick={() => rootTeamId && navigate('/portal/' + rootTeamId)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Просмотр
            </button>
            <button
              onClick={() => { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 2500); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Сохранить
            </button>
          </div>
        </div>

        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3 rounded-xl text-sm"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              Структура сохранена
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 text-sm text-blue-700">
          Нажмите на название отдела, имя или должность сотрудника для редактирования. При добавлении сотрудника кнопка с короной назначает его руководителем.
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-800">{company?.name}</div>
              <div className="text-xs text-slate-500">{company?.industry}</div>
            </div>
          </div>

          {rootTeamId ? (
            <TeamNode
              teamId={rootTeamId}
              depth={0}
              teams={teams}
              employees={employees}
              expandedTeams={expandedTeams}
              newItemForm={newItemForm}
              editTarget={editTarget}
              onToggle={handleToggle}
              onStartAdd={handleStartAdd}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              onFormChange={handleFormChange}
              onRemoveEmployee={handleRemoveEmployee}
              onRemoveTeam={handleRemoveTeam}
              onSetHead={handleSetHead}
              onStartEdit={handleStartEdit}
              onCommitEdit={handleCommitEdit}
              onCancelEdit={handleCancelEdit}
              onEditChange={handleEditChange}
              companyId={company?.id ?? ''}
            />
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Структура пуста</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Команд', value: Object.keys(teams).length },
            { label: 'Сотрудников', value: Object.keys(employees).length },
            { label: 'Уровней', value: 3 },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-card p-4">
              <div className="text-2xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
