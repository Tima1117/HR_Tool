# Backend Integration Guide

## Overview

The frontend is a React 18 + TypeScript SPA. Currently all data is stored in **localStorage** with mock data as defaults. This document describes every API endpoint the frontend expects, the current stub to replace, and the data shapes.

---

## Auth

### POST `/api/auth/login`
```json
// Request
{ "login": "admin", "password": "admin123" }

// Response
{
  "token": "jwt...",
  "user": {
    "id": "user-001",
    "login": "admin",
    "role": "consultant",           // "consultant" | "manager"
    "name": "Администратор системы",
    "position": "Старший консультант",
    "company": "HR Консалтинг",
    "companyIds": ["company-001", "company-002"],  // consultant only — accessible companies
    "companyId": "company-001",     // manager only — their single company
    "rootTeamId": "team-001",       // manager only — top of their visible subtree
    "showNames": true,
    "photo": null                   // base64 or URL
  }
}
```
**Stub to replace:** `mockUsers` array in `src/data/mockData.ts` + `login()` in `AppContext`.  
**Token storage:** save JWT to `localStorage` and send as `Authorization: Bearer <token>` header.

### POST `/api/auth/logout`
Invalidate server-side session. Frontend just clears localStorage.

### PATCH `/api/auth/me`
Update current user profile.
```json
// Request (partial)
{ "login": "newlogin", "password": "newpass", "position": "...", "photo": "base64..." }

// Response: updated User object
```
**Stub to replace:** `updateCurrentUser()` in `AppContext` — currently only updates in-memory state.

---

## Companies

### GET `/api/companies`
Returns all companies the current user can access (consultant: all assigned; manager: just theirs).
```json
[
  { "id": "company-001", "name": "ООО «Технологии Будущего»", "industry": "IT / Разработка ПО", "rootTeamId": "team-001" }
]
```
**Stub to replace:** `mockCompanies` in `src/data/mockData.ts` + `companies` state in `AppContext`.

---

## Teams

### GET `/api/companies/:companyId/teams`
Returns the full team tree for a company (all teams with their relationships).
```json
[
  {
    "id": "team-001",
    "name": "Команда ГД",
    "headId": "emp-001",
    "members": ["emp-002", "emp-005"],
    "subTeamIds": ["team-002", "team-003"],
    "parentTeamId": null,
    "companyId": "company-001",
    "artifacts": {
      "heatmap": { "id": "art-001", "type": "heatmap", "fileName": "file.pdf", "uploadedAt": "ISO", "version": 2, "fileUrl": "https://..." }
    }
  }
]
```
**Stub to replace:** `mockTeams` + `teams` state in `AppContext`.  
Note: `fileUrl` replaces `fileData` (base64) — the backend returns a presigned S3 URL or CDN URL.

### POST `/api/teams`
Create a new team.
```json
{ "name": "...", "headId": "emp-id", "parentTeamId": "team-id", "companyId": "company-id" }
```
**Stub to replace:** `addTeam()` in `AppContext`.

### PATCH `/api/teams/:teamId`
Update team (name, headId, members, subTeamIds).
**Stub to replace:** `updateTeam()` in `AppContext`.

### DELETE `/api/teams/:teamId`
Delete team and all descendants.
**Stub to replace:** `removeTeam()` in `AppContext`.

---

## Employees

### GET `/api/companies/:companyId/employees`
Returns all employees for a company.
```json
[
  {
    "id": "emp-001",
    "code": "EMP-001",
    "name": "Петров Александр Владимирович",
    "position": "Генеральный директор",
    "hasTeam": true,
    "teamId": "team-001",
    "artifact": {
      "id": "emp-art-001",
      "fileName": "управление_Петров.pdf",
      "uploadedAt": "ISO",
      "version": 1,
      "fileUrl": "https://..."
    }
  }
]
```
**Stub to replace:** `mockEmployees` + `employees` state in `AppContext`.

### POST `/api/employees`
Create employee.
**Stub to replace:** `addEmployee()` in `AppContext`.

### PATCH `/api/employees/:employeeId`
Update employee (name, position, hasTeam, teamId).
**Stub to replace:** `updateEmployee()` in `AppContext`.

### DELETE `/api/employees/:employeeId`
Delete employee.
**Stub to replace:** `removeEmployee()` in `AppContext`.

---

## Artifacts (Team)

### POST `/api/teams/:teamId/artifacts/:type`
Upload a team artifact. Multipart form data.
```
Content-Type: multipart/form-data
file: <binary>
```
Response:
```json
{ "id": "art-123", "type": "heatmap", "fileName": "file.pdf", "uploadedAt": "ISO", "version": 2, "fileUrl": "https://s3.../file.pdf" }
```
**Stub to replace:** `uploadArtifact()` in `AppContext` — currently reads file as base64 and stores in localStorage. Replace with `fetch()` multipart POST, store the returned `fileUrl`.

### DELETE `/api/teams/:teamId/artifacts/:type`
Remove a team artifact.
**Stub to replace:** `removeArtifact()` in `AppContext`.

### GET `fileUrl` (presigned or CDN)
The `fileUrl` from artifact responses is used directly in `<iframe src>` for PDF viewing and fetched for Excel parsing. Must be publicly readable or use presigned URL with sufficient TTL.

---

## Artifacts (Employee)

### POST `/api/employees/:employeeId/artifact`
Upload individual employee artifact. Multipart form data (same as team artifacts).
**Stub to replace:** `uploadEmployeeArtifact()` in `AppContext`.

### DELETE `/api/employees/:employeeId/artifact`
Remove employee artifact.
**Stub to replace:** `removeEmployeeArtifact()` in `AppContext`.

---

## File Storage

- Recommended: **AWS S3** or **Yandex Object Storage**
- PDFs and Excel files are viewed in-browser, so the fileUrl must support CORS: `Access-Control-Allow-Origin: *` (or the app's domain)
- Presigned URLs with 1-hour TTL are sufficient for viewing; longer TTL for download links

---

## Database Schema (suggested)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  login VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  role VARCHAR NOT NULL CHECK (role IN ('consultant', 'manager')),
  name VARCHAR NOT NULL,
  position VARCHAR,
  company VARCHAR,
  root_team_id UUID REFERENCES teams(id),
  show_names BOOLEAN DEFAULT TRUE,
  photo_url VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User <-> Company access (for consultants)
CREATE TABLE user_companies (
  user_id UUID REFERENCES users(id),
  company_id UUID REFERENCES companies(id),
  PRIMARY KEY (user_id, company_id)
);

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  industry VARCHAR,
  root_team_id UUID REFERENCES teams(id)
);

-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  head_id UUID REFERENCES employees(id),
  parent_team_id UUID REFERENCES teams(id),
  company_id UUID REFERENCES companies(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team membership (ordered members)
CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id),
  employee_id UUID REFERENCES employees(id),
  position INT, -- for ordering
  PRIMARY KEY (team_id, employee_id)
);

-- Employees
CREATE TABLE employees (
  id UUID PRIMARY KEY,
  code VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  position VARCHAR,
  has_team BOOLEAN DEFAULT FALSE,
  team_id UUID REFERENCES teams(id),
  company_id UUID REFERENCES companies(id) NOT NULL
);

-- Team artifacts
CREATE TABLE team_artifacts (
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams(id) NOT NULL,
  type VARCHAR NOT NULL CHECK (type IN ('heatmap', 'rating', 'readiness', 'motivation')),
  file_name VARCHAR NOT NULL,
  file_url VARCHAR NOT NULL,
  version INT DEFAULT 1,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id),
  UNIQUE (team_id, type)  -- one per type per team
);

-- Employee artifacts
CREATE TABLE employee_artifacts (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) UNIQUE NOT NULL,
  file_name VARCHAR NOT NULL,
  file_url VARCHAR NOT NULL,
  version INT DEFAULT 1,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id)
);
```

---

## What to Remove / Replace in Frontend

| File | What changes |
|------|-------------|
| `src/data/mockData.ts` | Remove entirely — data comes from API |
| `src/context/AppContext.tsx` | Replace localStorage reads/writes with `fetch()` calls; keep React state as cache |
| `src/pages/LoginPage.tsx` | `login()` → POST `/api/auth/login`, store JWT |
| `src/components/FileViewer.tsx` | `dataUrl` (base64) → `fileUrl` (string URL), remove base64 decode logic |
| `src/pages/ArtifactPage.tsx` | Use `artifact.fileUrl` instead of `artifact.fileData` |
| `src/components/EmployeeArtifactModal.tsx` | Same — use `fileUrl` |

## Environment Variables (Vite)

```env
VITE_API_BASE_URL=https://api.your-domain.com
VITE_STORAGE_BASE_URL=https://storage.your-domain.com
```

Use in code: `import.meta.env.VITE_API_BASE_URL`
