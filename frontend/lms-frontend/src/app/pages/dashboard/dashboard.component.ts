import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { apiMessage } from '../../core/api';
import { EnrollmentStatusService } from '../../core/enrollment-status.service';
import { StudentCourse, StudentCoursesService } from '../../core/student-courses.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  template: `
    <h1 class="text-xl font-bold">Welcome, {{ auth.user()?.name }}! 👋</h1>
    @if (enrollment.info(); as e) {
      @if (e.enrolled) { <p class="text-sm text-slate-500">Class {{ e.classCode }} · Grade {{ e.gradeNo }}</p> }
    }

    <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div class="card p-4">
        <p class="text-2xl font-bold text-primary">{{ loading() ? '–' : courses().length }}</p>
        <p class="text-xs text-slate-500">Courses this year</p>
      </div>
      <div class="card p-4">
        <p class="text-2xl font-bold text-secondary">{{ enrollment.info()?.classCode ?? '–' }}</p>
        <p class="text-xs text-slate-500">Your class</p>
      </div>
      <div class="card p-4">
        <p class="text-2xl font-bold text-success">{{ enrollment.info()?.gradeNo ?? '–' }}</p>
        <p class="text-xs text-slate-500">Grade</p>
      </div>
    </div>

    <div class="mt-6 flex items-center justify-between">
      <h2 class="font-semibold">My courses</h2>
      <a routerLink="/student/my-courses" class="text-sm font-medium text-primary hover:underline">View all</a>
    </div>

    @if (error()) {
      <p class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger" role="alert">{{ error() }}</p>
    }

    <div class="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      @for (c of courses().slice(0, 4); track c.id) {
        <a [routerLink]="['/student/courses', c.id]" class="card overflow-hidden transition hover:shadow-md">
          <div class="h-24 bg-linear-to-br" [class]="svc.gradient(c.id)"></div>
          <div class="p-3">
            <p class="text-sm font-semibold">{{ c.title }}</p>
            <p class="text-xs text-slate-500">{{ c.code }} · Grade {{ c.gradeNo }}</p>
            <p class="mt-2 text-xs text-slate-500">{{ svc.teachersLabel(c) }}</p>
          </div>
        </a>
      } @empty {
        <p class="col-span-full py-8 text-center text-sm text-slate-500">
          {{ loading() ? 'Loading your courses…' : 'There are no courses for your grade yet.' }}
        </p>
      }
    </div>
  `,
})
export class DashboardComponent {
  auth = inject(AuthService);
  enrollment = inject(EnrollmentStatusService);
  svc = inject(StudentCoursesService);

  courses = signal<StudentCourse[]>([]);
  loading = signal(true);
  error = signal('');

  constructor() { this.load(); }

  private async load() {
    try { this.courses.set(await this.svc.list()); this.error.set(''); }
    catch (e: any) { this.error.set(apiMessage(e, 'Could not load your courses. Try again in a moment.')); }
    finally { this.loading.set(false); }
  }
}
