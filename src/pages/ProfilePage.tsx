import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Lock, Eye, EyeOff, ChevronLeft, CheckCircle, Pencil, Check, X, RefreshCw, Camera } from 'lucide-react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const { currentUser, logout, selectCompany, currentCompanyId, companies, updateCurrentUser } = useApp();
  const navigate = useNavigate();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [editField, setEditField] = useState<'login' | 'position' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [fieldSuccess, setFieldSuccess] = useState<string | null>(null);
  const [editingPassword, setEditingPassword] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  if (!currentUser) { navigate('/login'); return null; }

  const isConsultant = currentUser.role === 'consultant';
  const initials = currentUser.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('');
  const availableCompanies = currentUser.companyIds?.map(id => companies[id]).filter(Boolean) ?? [];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 200x200 to keep localStorage small
        const MAX = 200;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        updateCurrentUser({ photo: compressed });
      };
      img.src = ev.target!.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startEdit = (field: 'login' | 'position') => {
    setEditField(field);
    setEditValue(field === 'login' ? currentUser.login : currentUser.position);
  };

  const commitEdit = () => {
    if (!editField || !editValue.trim()) { setEditField(null); return; }
    updateCurrentUser({ [editField]: editValue.trim() });
    setFieldSuccess(editField === 'login' ? 'Логин обновлён' : 'Должность обновлена');
    setEditField(null);
    setTimeout(() => setFieldSuccess(null), 2500);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    if (oldPass !== currentUser.password) { setPassError('Неверный текущий пароль'); return; }
    if (newPass.length < 6) { setPassError('Не менее 6 символов'); return; }
    if (newPass !== confirmPass) { setPassError('Пароли не совпадают'); return; }
    updateCurrentUser({ password: newPass });
    setPassSuccess(true);
    setEditingPassword(false);
    setOldPass(''); setNewPass(''); setConfirmPass('');
    setTimeout(() => setPassSuccess(false), 3000);
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" /> Назад
        </button>

        <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    onClick={() => photoInputRef.current?.click()}
                    className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-white/30 hover:ring-white/60 transition-all relative group"
                    title="Загрузить фото"
                  >
                    {currentUser.photo ? (
                      <img src={currentUser.photo} alt="Аватар" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold">
                        {initials}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </motion.button>
                  <button onClick={() => photoInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center hover:bg-slate-50 transition-colors">
                    <Camera className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-white truncate">{currentUser.name}</h1>
                  <p className="text-blue-100 text-sm mt-0.5">{currentUser.position}</p>
                  <span className="mt-2 inline-block text-xs px-2.5 py-0.5 rounded-full font-medium bg-white/20 text-white">
                    {isConsultant ? 'Консультант' : 'Руководитель'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-1">
              <AnimatePresence>
                {fieldSuccess && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-sm mb-3">
                    <CheckCircle className="w-4 h-4 shrink-0" /> {fieldSuccess}
                  </motion.div>
                )}
              </AnimatePresence>
              <EditableRow label="Логин" value={currentUser.login} isEditing={editField === 'login'}
                editValue={editValue} onEdit={() => startEdit('login')} onEditChange={setEditValue}
                onCommit={commitEdit} onCancel={() => setEditField(null)} />
              <EditableRow label="Должность" value={currentUser.position} isEditing={editField === 'position'}
                editValue={editValue} onEdit={() => startEdit('position')} onEditChange={setEditValue}
                onCommit={commitEdit} onCancel={() => setEditField(null)} />
              <div className="flex items-center gap-3 py-3 border-t border-slate-50">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0"><Building2 className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-400">Организация</div>
                  <div className="text-sm font-medium text-slate-700 truncate">{currentUser.company}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center"><Lock className="w-4 h-4 text-slate-500" /></div>
                <h2 className="font-semibold text-slate-800">Пароль</h2>
              </div>
              {!editingPassword && <button onClick={() => setEditingPassword(true)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Изменить</button>}
            </div>
            <AnimatePresence>
              {passSuccess && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm mb-4">
                  <CheckCircle className="w-4 h-4 shrink-0" /> Пароль успешно изменён
                </motion.div>
              )}
            </AnimatePresence>
            {!editingPassword ? (
              <div className="text-sm text-slate-400 tracking-widest">••••••••</div>
            ) : (
              <form onSubmit={handlePasswordSave} className="space-y-3">
                <PasswordField label="Текущий пароль" value={oldPass} onChange={setOldPass} show={showOld} onToggle={() => setShowOld(s => !s)} />
                <PasswordField label="Новый пароль" value={newPass} onChange={setNewPass} show={showNew} onToggle={() => setShowNew(s => !s)} />
                <PasswordField label="Подтверждение" value={confirmPass} onChange={setConfirmPass} show={showNew} onToggle={() => setShowNew(s => !s)} />
                {passError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{passError}</p>}
                <div className="flex gap-3 pt-1">
                  <button type="submit" className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">Сохранить</button>
                  <button type="button" onClick={() => { setEditingPassword(false); setPassError(''); }} className="px-5 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors">Отмена</button>
                </div>
              </form>
            )}
          </div>

          {/* Company switcher */}
          {isConsultant && availableCompanies.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center"><RefreshCw className="w-4 h-4 text-slate-500" /></div>
                <h2 className="font-semibold text-slate-800">Сменить компанию</h2>
              </div>
              <div className="space-y-2">
                {availableCompanies.map(c => (
                  <button key={c.id} onClick={() => { selectCompany(c.id); navigate('/portal'); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${currentCompanyId === c.id ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50 text-slate-700'}`}>
                    <Building2 className={`w-4 h-4 shrink-0 ${currentCompanyId === c.id ? 'text-blue-500' : 'text-slate-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.industry}</p>
                    </div>
                    {currentCompanyId === c.id && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium shrink-0">Активна</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full py-3 rounded-2xl border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors">
            Выйти из системы
          </button>
        </motion.div>
      </div>
    </Layout>
  );
}

function EditableRow({ label, value, isEditing, editValue, onEdit, onEditChange, onCommit, onCancel }: {
  label: string; value: string; isEditing: boolean; editValue: string;
  onEdit: () => void; onEditChange: (v: string) => void; onCommit: () => void; onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-t border-slate-50 group">
      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0"><User className="w-4 h-4" /></div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-400">{label}</div>
        {isEditing ? (
          <div className="flex items-center gap-2 mt-0.5">
            <input autoFocus type="text" value={editValue} onChange={e => onEditChange(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onCommit(); if (e.key === 'Escape') onCancel(); }}
              className="flex-1 text-sm px-2 py-1 rounded-lg border border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none min-w-0" />
            <button onClick={onCommit} className="p-1 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors shrink-0"><Check className="w-3.5 h-3.5" /></button>
            <button onClick={onCancel} className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors shrink-0"><X className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <div className="text-sm font-medium text-slate-700 truncate">{value}</div>
        )}
      </div>
      {!isEditing && (
        <button onClick={onEdit} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all shrink-0">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle }: {
  label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
          className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
          required minLength={6} />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
