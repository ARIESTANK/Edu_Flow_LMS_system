import { Role } from './auth.service';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;        // ISO date
  lastLogin: string | null; // ISO date
}

export interface UserPayload {
  username: string;
  email: string;
  role: Role;
  password?: string; // only on create
  active?: boolean;
}

export interface CourseItem {
  id: number;
  title: string;
  code: string;
  gradeNo: number; // 1-12
  enrolled: number;
}
export type CoursePayload = Omit<CourseItem, 'id' | 'enrolled'>;

export interface Department { id: number; name: string; head: string; }
export type DepartmentPayload = Omit<Department, 'id'>;

export interface AuditLog { id: number; time: string; actor: string; action: string; target: string; }

export interface SystemSettings {
  siteName: string;
  allowRegistration: boolean;
  defaultRole: Role;
  sessionTimeoutMin: number;
  passwordMinLength: number;
  maxUploadMb: number;
  maintenanceMode: boolean;
}

export interface Overview {
  totalUsers: number; students: number; teachers: number; admins: number;
  courses: number; activeToday: number; newThisWeek: number;
}

export interface StudentPerf {
  id: number;
  name: string;
  email: string;
  avgGrade: number;    // 0-100
  completion: number;  // 0-100 (% of lessons completed)
  attendance: number;  // 0-100
  trend: number;       // grade change vs previous term, in points
  courses: { course: string; grade: number }[];
}

// ---------- classes, teaching, enrollment ----------
export interface ClassItem { id: number; code: string; gradeNo: number; studentCount: number; }
export interface ClassPayload { code: string; gradeNo: number; }

export interface TeachingItem {
  id: number; teacherId: number; teacherName: string;
  courseId: number; courseTitle: string; courseCode: string; gradeNo: number;
}

export interface EnrollmentItem {
  id: number; studentId: number; studentName: string; studentEmail: string;
  classId: number; classCode: string; gradeNo: number; enrollmentDate: string | null;
}
export interface EnrollResult { created: number; skipped: string[]; }
