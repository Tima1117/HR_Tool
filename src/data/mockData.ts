import { Employee, Team, User, Company } from '../types';

export const mockCompanies: Record<string, Company> = {
  'company-001': {
    id: 'company-001',
    name: 'ООО «Технологии Будущего»',
    industry: 'IT / Разработка ПО',
    rootTeamId: 'team-001',
  },
  'company-002': {
    id: 'company-002',
    name: 'Розничная сеть «Меркурий»',
    industry: 'Розничная торговля',
    rootTeamId: 'team-c2-001',
  },
};

export const mockEmployees: Record<string, Employee> = {
  // Company 1
  'emp-001': { id: 'emp-001', code: 'EMP-001', name: 'Петров Александр Владимирович', position: 'Генеральный директор', hasTeam: true, teamId: 'team-001' },
  'emp-002': { id: 'emp-002', code: 'EMP-002', name: 'Иванова Мария Сергеевна', position: 'Директор по маркетингу', hasTeam: true, teamId: 'team-002' },
  'emp-003': { id: 'emp-003', code: 'EMP-003', name: 'Сидоров Кирилл Павлович', position: 'Маркетинг-менеджер', hasTeam: false },
  'emp-004': { id: 'emp-004', code: 'EMP-004', name: 'Козлова Елена Андреевна', position: 'Маркетинг-аналитик', hasTeam: false },
  'emp-005': { id: 'emp-005', code: 'EMP-005', name: 'Смирнов Дмитрий Николаевич', position: 'Технический директор', hasTeam: true, teamId: 'team-003' },
  'emp-006': { id: 'emp-006', code: 'EMP-006', name: 'Новиков Антон Сергеевич', position: 'Senior разработчик', hasTeam: false },
  'emp-007': { id: 'emp-007', code: 'EMP-007', name: 'Федорова Ольга Викторовна', position: 'UX/UI дизайнер', hasTeam: false },
  'emp-008': { id: 'emp-008', code: 'EMP-008', name: 'Морозова Людмила Игоревна', position: 'HR директор', hasTeam: true, teamId: 'team-004' },
  'emp-009': { id: 'emp-009', code: 'EMP-009', name: 'Захаров Виктор Петрович', position: 'HR-менеджер', hasTeam: false },
  'emp-010': { id: 'emp-010', code: 'EMP-010', name: 'Орлова Наталья Вячеславовна', position: 'Рекрутер', hasTeam: false },
  // Company 2
  'emp-c2-001': { id: 'emp-c2-001', code: 'EMP-C2-001', name: 'Громов Игорь Павлович', position: 'Генеральный директор', hasTeam: true, teamId: 'team-c2-001' },
  'emp-c2-002': { id: 'emp-c2-002', code: 'EMP-C2-002', name: 'Белова Светлана Юрьевна', position: 'Коммерческий директор', hasTeam: true, teamId: 'team-c2-002' },
  'emp-c2-003': { id: 'emp-c2-003', code: 'EMP-C2-003', name: 'Тихонов Андрей Михайлович', position: 'Менеджер по закупкам', hasTeam: false },
  'emp-c2-004': { id: 'emp-c2-004', code: 'EMP-C2-004', name: 'Крылова Наталья Ивановна', position: 'Категорийный менеджер', hasTeam: false },
  'emp-c2-005': { id: 'emp-c2-005', code: 'EMP-C2-005', name: 'Зайцев Павел Олегович', position: 'IT директор', hasTeam: true, teamId: 'team-c2-003' },
  'emp-c2-006': { id: 'emp-c2-006', code: 'EMP-C2-006', name: 'Орехов Станислав Петрович', position: 'Системный администратор', hasTeam: false },
  'emp-c2-007': { id: 'emp-c2-007', code: 'EMP-C2-007', name: 'Волкова Анна Дмитриевна', position: '1С-программист', hasTeam: false },
};

export const mockTeams: Record<string, Team> = {
  // Company 1
  'team-001': {
    id: 'team-001',
    name: 'Команда ГД',
    headId: 'emp-001',
    members: ['emp-002', 'emp-005', 'emp-008'],
    subTeamIds: ['team-002', 'team-003', 'team-004'],
    companyId: 'company-001',
    artifacts: {
      heatmap: { id: 'art-001', type: 'heatmap', fileName: 'тепловая_карта_ГД_v2.pdf', uploadedAt: '2026-05-15T10:00:00Z', version: 2, fileUrl: '#mock' },
      rating: { id: 'art-002', type: 'rating', fileName: 'рейтинг_компетенций_ГД.pdf', uploadedAt: '2026-05-15T10:30:00Z', version: 1, fileUrl: '#mock' },
      readiness: { id: 'art-003', type: 'readiness', fileName: 'готовность_команды_ГД.pdf', uploadedAt: '2026-05-16T09:00:00Z', version: 1, fileUrl: '#mock' },
      motivation: { id: 'art-004', type: 'motivation', fileName: 'мотивационная_карта_ГД.pdf', uploadedAt: '2026-05-16T09:30:00Z', version: 1, fileUrl: '#mock' },
    },
  },
  'team-002': {
    id: 'team-002', name: 'Отдел маркетинга', headId: 'emp-002', members: ['emp-003', 'emp-004'],
    subTeamIds: [], parentTeamId: 'team-001', companyId: 'company-001',
    artifacts: {
      heatmap: { id: 'art-005', type: 'heatmap', fileName: 'тепловая_карта_маркетинг.pdf', uploadedAt: '2026-05-17T11:00:00Z', version: 1, fileUrl: '#mock' },
      rating: { id: 'art-006', type: 'rating', fileName: 'рейтинг_маркетинг.pdf', uploadedAt: '2026-05-17T11:30:00Z', version: 1, fileUrl: '#mock' },
    },
  },
  'team-003': {
    id: 'team-003', name: 'Технический отдел', headId: 'emp-005', members: ['emp-006', 'emp-007'],
    subTeamIds: [], parentTeamId: 'team-001', companyId: 'company-001',
    artifacts: {
      heatmap: { id: 'art-007', type: 'heatmap', fileName: 'тепловая_карта_tech.pdf', uploadedAt: '2026-05-18T10:00:00Z', version: 1, fileUrl: '#mock' },
      readiness: { id: 'art-008', type: 'readiness', fileName: 'готовность_tech.pdf', uploadedAt: '2026-05-18T10:30:00Z', version: 1, fileUrl: '#mock' },
      motivation: { id: 'art-009', type: 'motivation', fileName: 'мотивация_tech.pdf', uploadedAt: '2026-05-18T11:00:00Z', version: 1, fileUrl: '#mock' },
    },
  },
  'team-004': {
    id: 'team-004', name: 'HR отдел', headId: 'emp-008', members: ['emp-009', 'emp-010'],
    subTeamIds: [], parentTeamId: 'team-001', companyId: 'company-001', artifacts: {},
  },
  // Company 2
  'team-c2-001': {
    id: 'team-c2-001', name: 'Дирекция', headId: 'emp-c2-001',
    members: ['emp-c2-002', 'emp-c2-005'],
    subTeamIds: ['team-c2-002', 'team-c2-003'],
    companyId: 'company-002',
    artifacts: {
      heatmap: { id: 'art-c2-001', type: 'heatmap', fileName: 'тепловая_карта_дирекция.pdf', uploadedAt: '2026-06-01T10:00:00Z', version: 1, fileUrl: '#mock' },
    },
  },
  'team-c2-002': {
    id: 'team-c2-002', name: 'Коммерческий отдел', headId: 'emp-c2-002',
    members: ['emp-c2-003', 'emp-c2-004'],
    subTeamIds: [], parentTeamId: 'team-c2-001', companyId: 'company-002', artifacts: {},
  },
  'team-c2-003': {
    id: 'team-c2-003', name: 'IT отдел', headId: 'emp-c2-005',
    members: ['emp-c2-006', 'emp-c2-007'],
    subTeamIds: [], parentTeamId: 'team-c2-001', companyId: 'company-002', artifacts: {},
  },
};

export const mockUsers: User[] = [
  {
    id: 'user-001',
    login: 'admin',
    password: 'admin123',
    role: 'consultant',
    name: 'Администратор системы',
    position: 'Старший консультант',
    showNames: true,
    company: 'HR Консалтинг',
    companyIds: ['company-001', 'company-002'],
  },
  {
    id: 'user-002',
    login: 'petrov',
    password: 'pass123',
    role: 'manager',
    name: 'Петров А.В.',
    position: 'Генеральный директор',
    employeeId: 'emp-001',
    rootTeamId: 'team-001',
    showNames: true,
    company: 'ООО «Технологии Будущего»',
    companyId: 'company-001',
  },
  {
    id: 'user-003',
    login: 'ivanova',
    password: 'pass123',
    role: 'manager',
    name: 'Иванова М.С.',
    position: 'Директор по маркетингу',
    employeeId: 'emp-002',
    rootTeamId: 'team-002',
    showNames: false,
    company: 'ООО «Технологии Будущего»',
    companyId: 'company-001',
  },
];
