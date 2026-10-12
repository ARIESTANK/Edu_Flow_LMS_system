import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService, Role, normalizeRole } from './auth.service';
import {
  AdminUser, AuditLog, ClassItem, ClassPayload, CourseItem, EnrollmentItem, EnrollResult, TeachingItem, CoursePayload, Department, DepartmentPayload,
  Overview, StudentPerf, SystemSettings, UserPayload,
} from './admin.models';
import { randomPassword } from './stats';
import { API_URL } from './api';

/**
 * Flip each flag to false once that endpoint exists in Spring Boot.
 * While true, the page runs on in-memory sample data (resets on reload).
 */
/**
 * Things the current Spring Boot backend cannot do yet (they need new columns/tables on your entities).
 * The admin UI hides them while false. Flip a flag to true after you add the backend support.
 */
export const FEATURES = {
  userMeta: false,             // user active/inactive status, created date, last login
  forcePasswordChange: false,  // "make them change it at next login"
  emailResetLink: false,       // POST /auth/forgot-password (needs email sending + reset tokens)
  courseEnrolledCount: false,  // enrolled students per course
};

export const MOCK = {
  users: false,
  courses: false,
  departments: true,
  settings: true,
  audit: true,
  analytics: true,
};

// ---------------- sample data ----------------
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

let users: AdminUser[] = [
  { id: 1, username: 'admin', email: 'admin@eduflow.com', role: 'ADMIN', active: true, createdAt: daysAgo(200), lastLogin: daysAgo(0) },
  { id: 2, username: 'kyaw.zaw', email: 'kyaw.zaw@eduflow.com', role: 'TEACHER', active: true, createdAt: daysAgo(150), lastLogin: daysAgo(1) },
  { id: 3, username: 'hnin.su', email: 'hnin.su@eduflow.com', role: 'TEACHER', active: true, createdAt: daysAgo(140), lastLogin: daysAgo(3) },
  { id: 4, username: 'min.thu', email: 'min.thu@eduflow.com', role: 'TEACHER', active: false, createdAt: daysAgo(120), lastLogin: daysAgo(40) },
  ...['Aye Chan', 'Su Su', 'Zin Mar', 'Htet Htet', 'Thura', 'Nandar', 'Kaung Khant Lin', 'Phyo Wai'].map((n, i) => ({
    id: 10 + i,
    username: n.toLowerCase().replace(/ /g, '.'),
    email: n.toLowerCase().replace(/ /g, '.') + '@student.eduflow.com',
    role: 'STUDENT' as Role,
    active: i !== 5,
    createdAt: daysAgo(90 - i * 9),
    lastLogin: i % 3 === 0 ? daysAgo(0) : daysAgo(i + 1),
  })),
];

let courses: CourseItem[] = [
  { id: 1, title: 'Web Development', code: 'CS101', gradeNo: 10, enrolled: 120 },
  { id: 2, title: 'Database Systems', code: 'CS102', gradeNo: 11, enrolled: 98 },
  { id: 3, title: 'Data Structures & Algorithms', code: 'CS103', gradeNo: 11, enrolled: 112 },
  { id: 4, title: 'English for IT', code: 'EN101', gradeNo: 9, enrolled: 64 },
  { id: 5, title: 'Mobile App Development', code: 'CS104', gradeNo: 12, enrolled: 0 },
  { id: 6, title: 'Cloud Computing', code: 'CS106', gradeNo: 12, enrolled: 40 },
];

let departments: Department[] = [
  { id: 1, name: 'Computer Science', head: 'Dr. Kyaw Zaw' },
  { id: 2, name: 'Information Systems', head: 'Daw Hnin Su' },
  { id: 3, name: 'Languages', head: 'Daw Mya Thandar' },
];

let settings: SystemSettings = {
  siteName: 'EduFlow LMS', allowRegistration: true, defaultRole: 'STUDENT',
  sessionTimeoutMin: 60, passwordMinLength: 8, maxUploadMb: 10, maintenanceMode: false,
};

let audit: AuditLog[] = [
  { id: 1, time: daysAgo(0), actor: 'admin', action: 'Logged in', target: '-' },
  { id: 2, time: daysAgo(1), actor: 'admin', action: 'Created user', target: 'phyo.wai' },
  { id: 3, time: daysAgo(2), actor: 'admin', action: 'Published course', target: 'CS101' },
];

// Deterministic sample performance data
function seedPerformance(): StudentPerf[] {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const names = ['Aye Chan', 'Su Su', 'Zin Mar', 'Htet Htet', 'Thura', 'Nandar', 'Kaung Khant Lin', 'Phyo Wai',
    'Min Khant', 'Ei Ei', 'Yadanar', 'Wai Yan', 'Moe Moe', 'Hein Htet', 'Thiri', 'Kyaw Kyaw', 'Shwe Sin', 'Lin Lin',
    'Pyae Sone', 'Nay Chi', 'Hla Hla', 'Zaw Zaw', 'Mya Mya', 'Tun Tun', 'San San', 'Aung Aung', 'Cho Cho', 'Ko Ko'];
  const clamp = (n: number) => Math.max(20, Math.min(100, Math.round(n)));
  return names.map((name, i) => {
    const base = 45 + rnd() * 50;
    return {
      id: 100 + i,
      name,
      email: name.toLowerCase().replace(/ /g, '.') + '@student.eduflow.com',
      avgGrade: 0,
      completion: clamp(base + (rnd() - 0.5) * 30),
      attendance: clamp(base + 10 + (rnd() - 0.5) * 25),
      trend: Math.round((rnd() - 0.4) * 16),
      courses: ['Web Development', 'Database Systems', 'Data Structures & Algorithms', 'English for IT']
        .map(course => ({ course, grade: clamp(base + (rnd() - 0.5) * 24) })),
    };
  }).map(s => ({ ...s, avgGrade: Math.round(s.courses.reduce((a, c) => a + c.grade, 0) / s.courses.length) }));
}
const performance = seedPerformance();

// ---------------- service ----------------
@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private log(action: string, target: string) {
    audit = [{ id: Date.now(), time: new Date().toISOString(), actor: this.auth.user()?.name ?? 'admin', action, target }, ...audit];
  }
  private nextId(list: { id: number }[]) { return Math.max(0, ...list.map(x => x.id)) + 1; }

  // ----- Users  (GET/POST /users, PUT/DELETE /users/{id}) -----
  async listUsers(): Promise<AdminUser[]> {
    if (MOCK.users) return [...users];
    // The Bearer token is added by auth.interceptor.ts
    const rows = await firstValueFrom(this.http.get<any[]>(`${API_URL}/users`));
    return rows.map(u => ({
      id: u.id ?? u.userId,
      username: u.username ?? u.name ?? '',
      email: u.email ?? '',
      role: normalizeRole(u.role),
      active: u.active ?? u.enabled ?? true,
      createdAt: u.createdAt ?? '',
      lastLogin: u.lastLogin ?? null,
    }));
  }

  async createUser(p: UserPayload): Promise<void> {
    if (MOCK.users) {
      if (users.some(u => u.email.toLowerCase() === p.email.toLowerCase())) throw new Error('A user with this email already exists.');
      users = [...users, { id: this.nextId(users), username: p.username, email: p.email, role: p.role, active: p.active ?? true, createdAt: new Date().toISOString(), lastLogin: null }];
      return this.log('Created user', p.username);
    }
    await firstValueFrom(this.http.post(`${API_URL}/users`, { username: p.username, email: p.email, password: p.password, role: p.role }));
  }

  async updateUser(id: number, p: UserPayload): Promise<void> {
    if (MOCK.users) {
      if (users.some(u => u.id !== id && u.email.toLowerCase() === p.email.toLowerCase())) throw new Error('Another user already uses this email.');
      users = users.map(u => (u.id === id ? { ...u, username: p.username, email: p.email, role: p.role, active: p.active ?? u.active } : u));
      return this.log('Updated user', p.username);
    }
    await firstValueFrom(this.http.put(`${API_URL}/users/${id}`, { username: p.username, email: p.email, role: p.role }));
  }

  async setUserActive(u: AdminUser, active: boolean): Promise<void> {
    if (MOCK.users) {
      users = users.map(x => (x.id === u.id ? { ...x, active } : x));
      return this.log(active ? 'Activated user' : 'Deactivated user', u.username);
    }
    if (!FEATURES.userMeta) throw new Error('Account status is not supported by the backend yet.');
    await firstValueFrom(this.http.patch(`${API_URL}/users/${u.id}/status`, { active }));
  }

  async deleteUser(u: AdminUser): Promise<void> {
    if (MOCK.users) { users = users.filter(x => x.id !== u.id); return this.log('Deleted user', u.username); }
    await firstValueFrom(this.http.delete(`${API_URL}/users/${u.id}`));
  }

  /** Admin sets a new password directly. POST /users/{id}/reset-password */
  async resetPassword(u: AdminUser, newPassword: string, mustChangePassword: boolean): Promise<void> {
    if (MOCK.users) return this.log('Reset password', u.username);
    await firstValueFrom(this.http.post(`${API_URL}/users/${u.id}/reset-password`, { newPassword, mustChangePassword }));
  }

  /** Emails a reset link to the user. POST /auth/forgot-password */
  async sendResetLink(email: string): Promise<void> {
    if (MOCK.users) return this.log('Sent reset link', email);
    if (!FEATURES.emailResetLink) throw new Error('Emailing reset links is not supported by the backend yet.');
    await firstValueFrom(this.http.post(`${API_URL}/auth/forgot-password`, { email }));
  }

  generatePassword() { return randomPassword(12); }

  // ----- Courses  (/courses) -----
  async listCourses(): Promise<CourseItem[]> {
    if (MOCK.courses) return [...courses];
    // The Bearer token is added by auth.interceptor.ts
    const res = await firstValueFrom(this.http.get<any>(`${API_URL}/courses`));
    const rows: any[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []); // plain array or Spring Page
    return rows.map(c => ({
      id: c.id ?? c.courseId,
      title: c.title ?? c.courseName ?? c.name ?? '',
      code: c.code ?? c.courseCode ?? '',
      gradeNo: Number(c.gradeNo ?? c.grade ?? c.gradeLevel ?? 0),
      enrolled: c.enrolled ?? c.enrolledCount ?? c.studentCount ?? 0,
    }));
  }
  async createCourse(p: CoursePayload): Promise<void> {
    await firstValueFrom(this.http.post(`${API_URL}/courses`, p));
  }
  async updateCourse(id: number, p: CoursePayload): Promise<void> {
    if (MOCK.courses) {
      if (courses.some(c => c.id !== id && c.code.toLowerCase() === p.code.toLowerCase())) throw new Error('Another course already uses this code.');
      courses = courses.map(c => (c.id === id ? { ...c, ...p } : c));
      return this.log('Updated course', p.code);
    }
    await firstValueFrom(this.http.put(`${API_URL}/courses/${id}`, p));
  }
  async deleteCourse(c: CourseItem): Promise<void> {
    if (MOCK.courses) { courses = courses.filter(x => x.id !== c.id); return this.log('Deleted course', c.code); }
    await firstValueFrom(this.http.delete(`${API_URL}/courses/${c.id}`));
  }

  // ----- Classes  (/classes) - ADMIN only -----
  listClasses(): Promise<ClassItem[]> {
    return firstValueFrom(this.http.get<ClassItem[]>(`${API_URL}/classes`));
  }
  async createClass(p: ClassPayload): Promise<void> {
    await firstValueFrom(this.http.post(`${API_URL}/classes`, p));
  }
  async updateClass(id: number, p: ClassPayload): Promise<void> {
    await firstValueFrom(this.http.put(`${API_URL}/classes/${id}`, p));
  }
  async deleteClass(c: ClassItem): Promise<void> {
    await firstValueFrom(this.http.delete(`${API_URL}/classes/${c.id}`));
  }

  // ----- Enrollments  (/enrollments) - the class's grade is stored with each enrollment -----
  listEnrollments(classId?: number): Promise<EnrollmentItem[]> {
    const url = classId ? `${API_URL}/enrollments?classId=${classId}` : `${API_URL}/enrollments`;
    return firstValueFrom(this.http.get<EnrollmentItem[]>(url));
  }
  enrollStudents(classId: number, studentIds: number[]): Promise<EnrollResult> {
    return firstValueFrom(this.http.post<EnrollResult>(`${API_URL}/enrollments`, { classId, studentIds }));
  }
  async moveEnrollment(id: number, classId: number): Promise<void> {
    await firstValueFrom(this.http.put(`${API_URL}/enrollments/${id}`, { classId }));
  }
  async removeEnrollment(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`${API_URL}/enrollments/${id}`));
  }

  // ----- Teacher <-> course assignments  (/teaches) -----
  listTeaching(): Promise<TeachingItem[]> {
    return firstValueFrom(this.http.get<TeachingItem[]>(`${API_URL}/teaches`));
  }
  async assignTeacher(teacherId: number, courseId: number): Promise<void> {
    await firstValueFrom(this.http.post(`${API_URL}/teaches`, { teacherId, courseId }));
  }
  async updateTeaching(id: number, teacherId: number, courseId: number): Promise<void> {
    await firstValueFrom(this.http.put(`${API_URL}/teaches/${id}`, { teacherId, courseId }));
  }
  async unassignTeacher(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`${API_URL}/teaches/${id}`));
  }

  // ----- Departments  (/departments) -----
  async listDepartments(): Promise<Department[]> {
    if (MOCK.departments) return [...departments];
    return firstValueFrom(this.http.get<Department[]>(`${API_URL}/departments`));
  }
  async createDepartment(p: DepartmentPayload): Promise<void> {
    if (MOCK.departments) { departments = [...departments, { ...p, id: this.nextId(departments) }]; return this.log('Created department', p.name); }
    await firstValueFrom(this.http.post(`${API_URL}/departments`, p));
  }
  async updateDepartment(id: number, p: DepartmentPayload): Promise<void> {
    if (MOCK.departments) { departments = departments.map(d => (d.id === id ? { ...d, ...p } : d)); return this.log('Updated department', p.name); }
    await firstValueFrom(this.http.put(`${API_URL}/departments/${id}`, p));
  }
  async deleteDepartment(d: Department): Promise<void> {
    if (MOCK.departments) { departments = departments.filter(x => x.id !== d.id); return this.log('Deleted department', d.name); }
    await firstValueFrom(this.http.delete(`${API_URL}/departments/${d.id}`));
  }

  // ----- System settings  (GET/PUT /admin/settings) -----
  async getSettings(): Promise<SystemSettings> {
    if (MOCK.settings) return { ...settings };
    return firstValueFrom(this.http.get<SystemSettings>(`${API_URL}/admin/settings`));
  }
  async saveSettings(s: SystemSettings): Promise<void> {
    if (MOCK.settings) { settings = { ...s }; return this.log('Updated system settings', '-'); }
    await firstValueFrom(this.http.put(`${API_URL}/admin/settings`, s));
  }

  // ----- Audit log  (GET /admin/audit-logs) -----
  async listAuditLogs(): Promise<AuditLog[]> {
    if (MOCK.audit) return [...audit];
    return firstValueFrom(this.http.get<AuditLog[]>(`${API_URL}/admin/audit-logs`));
  }

  // ----- Overview  (GET /admin/overview) -----
  async getOverview(): Promise<Overview> {
    // Built from the real user and course lists, so no /admin/overview endpoint is needed
    const [us, cs] = await Promise.all([this.listUsers(), this.listCourses()]);
    const week = Date.now() - 7 * 86_400_000;
    const day = Date.now() - 86_400_000;
    return {
      totalUsers: us.length,
      students: us.filter(u => u.role === 'STUDENT').length,
      teachers: us.filter(u => u.role === 'TEACHER').length,
      admins: us.filter(u => u.role === 'ADMIN').length,
      courses: cs.length,
      activeToday: us.filter(u => u.lastLogin && new Date(u.lastLogin).getTime() > day).length,
      newThisWeek: us.filter(u => u.createdAt && new Date(u.createdAt).getTime() > week).length,
    };
  }

  // ----- Student analytics  (GET /admin/analytics/students) -----
  async studentPerformance(): Promise<StudentPerf[]> {
    if (MOCK.analytics) return performance.map(s => ({ ...s, courses: [...s.courses] }));
    return firstValueFrom(this.http.get<StudentPerf[]>(`${API_URL}/admin/analytics/students`));
  }
}
