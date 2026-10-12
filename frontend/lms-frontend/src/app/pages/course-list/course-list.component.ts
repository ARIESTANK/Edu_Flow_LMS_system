import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { apiMessage } from '../../core/api';
import { StudentCourse, StudentCoursesService } from '../../core/student-courses.service';

@Component({
  selector: 'app-course-list',
  imports: [RouterLink],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold">My courses</h1>
        <p class="text-sm text-slate-500">{{ courses().length }} {{ courses().length === 1 ? 'course' : 'courses' }}</p>
      </div>
      <input class="input max-w-xs" placeholder="Search by title or code..." (input)="query.set($any($event.target).value)" aria-label="Search courses" />
    </div>

    @if (error()) {
      <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger" role="alert">{{ error() }}</p>
    }

    <div class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      @for (c of filtered(); track c.id) {
        <article class="card flex flex-col overflow-hidden">
          <div class="h-28 bg-linear-to-br" [class]="svc.gradient(c.id)"></div>
          <div class="flex flex-1 flex-col p-3">
            <a [routerLink]="['/student/courses', c.id]" class="text-sm font-semibold hover:text-primary">{{ c.title }}</a>
            <p class="text-xs text-slate-500">{{ c.code }} · Grade {{ c.gradeNo }}</p>
            <p class="mt-2 text-xs text-slate-500">{{ svc.teachersLabel(c) }}</p>
            <a [routerLink]="['/student/courses', c.id]" class="mt-auto self-start pt-3 text-xs font-semibold text-primary hover:underline">View course</a>
          </div>
        </article>
      } @empty {
        <p class="col-span-full py-12 text-center text-sm text-slate-500">
          {{ loading() ? 'Loading your courses…' : (courses().length ? 'No courses match your search.' : 'There are no courses for your grade yet.') }}
        </p>
      }
    </div>
  `,
})
export class CourseListComponent {
  svc = inject(StudentCoursesService);

  courses = signal<StudentCourse[]>([]);
  loading = signal(true);
  error = signal('');
  query = signal('');

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.courses().filter(c => !q || c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  });

  constructor() { this.load(); }

  private async load() {
    try { this.courses.set(await this.svc.list()); this.error.set(''); }
    catch (e: any) { this.error.set(apiMessage(e, 'Could not load your courses. Try again in a moment.')); }
    finally { this.loading.set(false); }
  }
}
