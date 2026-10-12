import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from './api';

export interface StudentCourse {
  id: number;
  title: string;
  code: string;
  gradeNo: number;
  teachers: string[];
}

const GRADIENTS = [
  'from-blue-600 to-indigo-900',
  'from-sky-500 to-blue-900',
  'from-violet-600 to-slate-900',
  'from-teal-500 to-cyan-900',
  'from-fuchsia-600 to-indigo-900',
  'from-cyan-500 to-blue-900',
];

/** The signed-in student's own courses, straight from the backend (GET /api/me/courses). */
@Injectable({ providedIn: 'root' })
export class StudentCoursesService {
  private http = inject(HttpClient);

  list(): Promise<StudentCourse[]> {
    return firstValueFrom(this.http.get<StudentCourse[]>(`${API_URL}/me/courses`));
  }

  /** The API has no thumbnails yet, so each course gets a stable colour from its id */
  gradient(id: number): string {
    return GRADIENTS[Math.abs(id) % GRADIENTS.length];
  }

  teachersLabel(c: StudentCourse): string {
    return c.teachers.length ? c.teachers.join(', ') : 'No teacher assigned yet';
  }
}
