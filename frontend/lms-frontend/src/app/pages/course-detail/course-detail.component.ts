import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { apiMessage } from '../../core/api';
import { StudentCourse, StudentCoursesService } from '../../core/student-courses.service';

@Component({
  selector: 'app-course-detail',
  imports: [RouterLink],
  template: `
    <a routerLink="/student/my-courses" class="text-sm font-medium text-primary hover:underline">← My courses</a>

    @if (error()) {
      <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger" role="alert">{{ error() }}</p>
    } @else if (course(); as c) {
      <section class="card mt-3 overflow-hidden">
        <div class="h-32 bg-linear-to-br" [class]="svc.gradient(c.id)"></div>
        <div class="p-5">
          <h1 class="text-xl font-bold">{{ c.title }}</h1>
          <p class="mt-1 text-sm text-slate-500">{{ c.code }} · Grade {{ c.gradeNo }}</p>
        </div>
      </section>

      <section class="mt-4 grid gap-4 lg:grid-cols-3">
        <div class="card p-5 lg:col-span-2">
          <h2 class="font-semibold">Lessons &amp; assignments</h2>
          <p class="mt-2 text-sm text-slate-500">Nothing has been added to this course yet. Lessons and assignments will appear here when your teacher posts them.</p>
        </div>
        <aside class="card h-fit p-5 text-sm">
          <h2 class="font-semibold">{{ c.teachers.length === 1 ? 'Teacher' : 'Teachers' }}</h2>
          @if (c.teachers.length) {
            <ul class="mt-3 space-y-2">
              @for (t of c.teachers; track t) {
                <li class="flex items-center gap-3">
                  <span class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary">{{ t[0].toUpperCase() }}</span>{{ t }}
                </li>
              }
            </ul>
          } @else {
            <p class="mt-2 text-slate-500">No teacher assigned yet.</p>
          }
        </aside>
      </section>
    } @else {
      <p class="mt-6 text-sm text-slate-500">Loading…</p>
    }
  `,
})
export class CourseDetailComponent {
  svc = inject(StudentCoursesService);
  private id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  course = signal<StudentCourse | null>(null);
  error = signal('');

  constructor() { this.load(); }

  private async load() {
    try {
      const found = (await this.svc.list()).find(c => c.id === this.id);
      if (found) this.course.set(found);
      else this.error.set("This course isn't part of your class.");
    } catch (e: any) {
      this.error.set(apiMessage(e, 'Could not load the course. Try again in a moment.'));
    }
  }
}
