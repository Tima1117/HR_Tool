export type ArtifactType = 'heatmap' | 'rating' | 'readiness' | 'motivation';

export interface EmployeeArtifact {
  id: string;
  fileName: string;
  uploadedAt: string;
  version: number;
  fileData?: string;
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  position: string;
  hasTeam: boolean;
  teamId?: string;
  artifact?: EmployeeArtifact;
}

export interface Artifact {
  id: string;
  type: ArtifactType;
  fileName: string;
  uploadedAt: string;
  version: number;
  fileUrl?: string;
  fileData?: string;
}

export interface Team {
  id: string;
  name: string;
  headId: string;
  members: string[];
  subTeamIds: string[];
  parentTeamId?: string;
  companyId: string;
  artifacts: Partial<Record<ArtifactType, Artifact>>;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  rootTeamId: string;
}

export interface User {
  id: string;
  login: string;
  password: string;
  role: 'consultant' | 'manager';
  name: string;
  position: string;
  employeeId?: string;
  rootTeamId?: string;
  company: string;
  companyId?: string;
  companyIds?: string[];
  showNames: boolean;
  photo?: string;
}

export const ARTIFACT_META: Record<ArtifactType, { label: string; description: string; color: string; bg: string }> = {
  heatmap: {
    label: 'Тепловая карта',
    description: 'Матрица потенциала сотрудников по компетенциям',
    color: 'text-orange-600',
    bg: 'bg-orange-50 border-orange-200',
  },
  rating: {
    label: 'Рейтинг компетенций',
    description: 'Оценка компетенций, поведения и стилей',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
  },
  readiness: {
    label: 'Готовность команды',
    description: 'Потенциал под ключевые управленческие задачи',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  motivation: {
    label: 'Мотивационная карта',
    description: 'Мотиваторы и демотиваторы по каждому сотруднику',
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200',
  },
};

