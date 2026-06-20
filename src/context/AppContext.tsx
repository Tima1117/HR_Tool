import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Team, Employee, ArtifactType, Company } from '../types';
import { mockUsers, mockTeams, mockEmployees, mockCompanies } from '../data/mockData';

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface AppState {
  currentUser: User | null;
  currentCompanyId: string | null;
  teams: Record<string, Team>;
  employees: Record<string, Employee>;
  companies: Record<string, Company>;
  login: (login: string, password: string) => boolean;
  logout: () => void;
  selectCompany: (id: string) => void;
  updateCurrentUser: (patch: Partial<Pick<User, 'login' | 'password' | 'position' | 'name' | 'photo'>>) => void;
  getTeamPath: (teamId: string) => Team[];
  canAccessTeam: (teamId: string) => boolean;
  uploadArtifact: (teamId: string, type: ArtifactType, file: File) => Promise<void>;
  removeArtifact: (teamId: string, type: ArtifactType) => void;
  addTeam: (team: Team) => void;
  updateTeam: (team: Team) => void;
  removeTeam: (teamId: string) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  removeEmployee: (employeeId: string) => void;
  uploadEmployeeArtifact: (employeeId: string, file: File) => Promise<void>;
  removeEmployeeArtifact: (employeeId: string) => void;
  resetData: () => void;
}

const AppContext = createContext<AppState | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadFromStorage('hr_user', null));
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(() => loadFromStorage('hr_company', null));
  const [teams, setTeams] = useState<Record<string, Team>>(() => loadFromStorage('hr_teams', mockTeams));
  const [employees, setEmployees] = useState<Record<string, Employee>>(() => loadFromStorage('hr_employees', mockEmployees));
  const [companies] = useState<Record<string, Company>>(mockCompanies);

  useEffect(() => {
    if (currentUser) localStorage.setItem('hr_user', JSON.stringify(currentUser));
    else localStorage.removeItem('hr_user');
  }, [currentUser]);

  useEffect(() => {
    if (currentCompanyId) localStorage.setItem('hr_company', JSON.stringify(currentCompanyId));
    else localStorage.removeItem('hr_company');
  }, [currentCompanyId]);

  useEffect(() => { localStorage.setItem('hr_teams', JSON.stringify(teams)); }, [teams]);
  useEffect(() => { localStorage.setItem('hr_employees', JSON.stringify(employees)); }, [employees]);

  const login = (loginStr: string, password: string): boolean => {
    const user = mockUsers.find(u => u.login === loginStr && u.password === password);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'manager' && user.companyId) setCurrentCompanyId(user.companyId);
      if (user.role === 'consultant' && user.companyIds?.length === 1) setCurrentCompanyId(user.companyIds[0]);
      return true;
    }
    return false;
  };

  const logout = () => { setCurrentUser(null); setCurrentCompanyId(null); };
  const selectCompany = (id: string) => setCurrentCompanyId(id);
  const updateCurrentUser = (patch: Partial<Pick<User, 'login' | 'password' | 'position' | 'name' | 'photo'>>) => {
    setCurrentUser(prev => prev ? { ...prev, ...patch } : prev);
  };

  const getTeamPath = (teamId: string): Team[] => {
    const path: Team[] = [];
    let current: Team | undefined = teams[teamId];
    const visited = new Set<string>();
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      path.unshift(current);
      current = current.parentTeamId ? teams[current.parentTeamId] : undefined;
    }
    return path;
  };

  const canAccessTeam = (teamId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'consultant') return true;
    if (!currentUser.rootTeamId) return false;
    const queue = [currentUser.rootTeamId];
    const visited = new Set<string>();
    while (queue.length) {
      const id = queue.shift()!;
      if (id === teamId) return true;
      if (visited.has(id)) continue;
      visited.add(id);
      const team = teams[id];
      if (team) team.subTeamIds.forEach(s => queue.push(s));
    }
    return false;
  };

  const uploadArtifact = async (teamId: string, type: ArtifactType, file: File) => {
    const fileData = await readFileAsBase64(file);
    setTeams(prev => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        artifacts: {
          ...prev[teamId].artifacts,
          [type]: {
            id: 'art-' + Date.now(),
            type,
            fileName: file.name,
            uploadedAt: new Date().toISOString(),
            version: (prev[teamId].artifacts[type]?.version ?? 0) + 1,
            fileData,
          },
        },
      },
    }));
  };

  const removeArtifact = (teamId: string, type: ArtifactType) => {
    setTeams(prev => {
      const arts = { ...prev[teamId].artifacts };
      delete arts[type];
      return { ...prev, [teamId]: { ...prev[teamId], artifacts: arts } };
    });
  };

  const addTeam = (team: Team) => setTeams(prev => ({ ...prev, [team.id]: team }));
  const updateTeam = (team: Team) => setTeams(prev => ({ ...prev, [team.id]: team }));

  const removeTeam = (teamId: string) => {
    setTeams(prev => {
      const next = { ...prev };
      const team = next[teamId];
      if (team?.parentTeamId && next[team.parentTeamId]) {
        next[team.parentTeamId] = {
          ...next[team.parentTeamId],
          subTeamIds: next[team.parentTeamId].subTeamIds.filter(id => id !== teamId),
        };
      }
      const toDelete = new Set<string>();
      const queue = [teamId];
      while (queue.length) {
        const id = queue.shift()!;
        toDelete.add(id);
        next[id]?.subTeamIds.forEach(sub => queue.push(sub));
      }
      toDelete.forEach(id => delete next[id]);
      return next;
    });
  };

  const addEmployee = (employee: Employee) => setEmployees(prev => ({ ...prev, [employee.id]: employee }));
  const updateEmployee = (employee: Employee) => setEmployees(prev => ({ ...prev, [employee.id]: employee }));

  const removeEmployee = (employeeId: string) =>
    setEmployees(prev => {
      const next = { ...prev };
      delete next[employeeId];
      return next;
    });

  const uploadEmployeeArtifact = async (employeeId: string, file: File) => {
    const fileData = await readFileAsBase64(file);
    setEmployees(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        artifact: {
          id: 'emp-art-' + Date.now(),
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
          version: (prev[employeeId]?.artifact?.version ?? 0) + 1,
          fileData,
        },
      },
    }));
  };

  const removeEmployeeArtifact = (employeeId: string) =>
    setEmployees(prev => {
      const emp = { ...prev[employeeId] };
      delete emp.artifact;
      return { ...prev, [employeeId]: emp };
    });

  const resetData = () => {
    setTeams(mockTeams);
    setEmployees(mockEmployees);
    localStorage.removeItem('hr_teams');
    localStorage.removeItem('hr_employees');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser, currentCompanyId, teams, employees, companies,
        login, logout, selectCompany, updateCurrentUser,
        getTeamPath, canAccessTeam,
        uploadArtifact, removeArtifact,
        addTeam, updateTeam, removeTeam,
        addEmployee, updateEmployee, removeEmployee,
        uploadEmployeeArtifact, removeEmployeeArtifact,
        resetData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

