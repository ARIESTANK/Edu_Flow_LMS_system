import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/admin.service';
import { AdminUser, CourseItem, TeachingItem } from '../../core/admin.models';
import { apiMessage } from '../../core/api';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../layout/icon.component';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  selector: 'app-teaching-management',
  imports: [FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold">Teachers &amp; courses</h1>
        <p class="text-sm text-slate-500">{{ teaching().length }} assignments · {{ unassigned().length }} courses without a teacher</p>
      </div>
      <button class="btn-primary gap-2" (click)="openAssign()"><app-icon name="plus" cls="h-4 w-4" /> Assign teacher</button>
    </div>

    @if (loadError()) { <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger" role="alert">{{ loadError() }}</p> }

    @if (unassigned().length) {
      <section class="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h2 class="text-sm font-semibold text-amber-900">Courses without a teacher</h2>
        <div class="mt-2 flex flex-wrap gap-2">
          @for (c of unassigned(); track c.id) {
            <button class="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-900 ring-1 ring-amber-300 hover:bg-amber-100" (click)="openAssign(c.id)" [attr.aria-label]="'Assign a teacher to ' + c.title">
              {{ c.code }} · {{ c.title }} +
            </button>
          }
        </div>
      </section>
    }

    <div class="mt-4 flex flex-wrap gap-3">
      <input class="input max-w-xs" placeholder="Search course or teacher..." [ngModel]="search()" (ngModelChange)="search.set($event)" aria-label="Search assignments" />
      <select class="input w-auto" [ngModel]="gradeFilter()" (ngModelChange)="gradeFilter.set($event)" aria-label="Filter by grade">
        <option [ngValue]="0">All grades</option>
        @for (g of grades; track g) { <option [ngValue]="g">Grade {{ g }}</option> }
      </select>
    </div>

    <section class="card mt-4 overflow-x-auto">
      <table class="w-full min-w-[34rem] text-left text-sm">
        <thead class="border-b border-slate-200 text-xs text-slate-500">
          <tr><th class="px-4 py-3 font-medium">Course</th><th class="px-4 py-3 font-medium">Grade</th><th class="px-4 py-3 font-medium">Teacher</th><th class="px-4 py-3 text-right font-medium">Actions</th></tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          @for (t of rows(); track t.id) {
            <tr>
              <td class="px-4 py-3 font-medium">{{ t.courseTitle }}<span class="block text-xs font-normal text-slate-500">{{ t.courseCode }}</span></td>
              <td class="px-4 py-3">Grade {{ t.gradeNo }}</td>
              <td class="px-4 py-3">{{ t.teacherName }}</td>
              <td class="px-4 py-3">
                <span class="flex justify-end gap-1">
                  <button class="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary" title="Change teacher" [attr.aria-label]="'Change teacher for ' + t.courseTitle" (click)="openEdit(t)"><app-icon name="edit" cls="h-4 w-4" /></button>
                  <button class="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-danger" title="Remove assignment" [attr.aria-label]="'Remove ' + t.teacherName + ' from ' + t.courseTitle" (click)="toDelete.set(t)"><app-icon name="trash" cls="h-4 w-4" /></button>
                </span>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="4" class="px-4 py-10 text-center text-slate-500">{{ loading() ? 'Loading…' : 'No assignments match.' }}</td></tr>
          }
        </tbody>
      </table>
    </section>

    <app-modal [open]="showForm()" [title]="editing() ? 'Change teacher' : 'Assign teacher to course'" (closed)="showForm.set(false)">
      <form class="space-y-4" (ngSubmit)="save()" novalidate>
        @if (formError()) { <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger" role="alert">{{ formError() }}</p> }
        <div>
          <label for="t-course" class="mb-1 block text-sm font-medium">Course</label>
          <select id="t-course" name="courseId" class="input" [(ngModel)]="form.courseId">
            <option [ngValue]="null" disabled>Choose a course…</option>
            @for (c of courses(); track c.id) { <option [ngValue]="c.id">{{ c.code }} · {{ c.title }} (Grade {{ c.gradeNo }})</option> }
          </select>
        </div>
        <div>
          <label for="t-teacher" class="mb-1 block text-sm font-medium">Teacher</label>
          <select id="t-teacher" name="teacherId" class="input" [(ngModel)]="form.teacherId">
            <option [ngValue]="null" disabled>Choose a teacher…</option>
            @for (u of teachers(); track u.id) { <option [ngValue]="u.id">{{ u.username }} ({{ u.email }})</option> }
          </select>
          @if (!teachers().length) { <p class="mt-1 text-xs text-slate-500">No teacher accounts yet. Add one under Manage Users with the Teacher role.</p> }
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" (click)="showForm.set(false)">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="saving()">{{ saving() ? 'Saving…' : (editing() ? 'Save changes' : 'Assign') }}</button>
        </div>
      </form>
    </app-modal>

    <app-modal [open]="!!toDelete()" title="Remove assignment" (closed)="toDelete.set(null)">
      <p class="text-sm text-slate-600">Remove <strong>{{ toDelete()?.teacherName }}</strong> from <strong>{{ toDelete()?.courseTitle }}</strong>? The course and the teacher account stay.</p>
      <div class="mt-5 flex justify-end gap-2">
        <button class="btn-secondary" (click)="toDelete.set(null)">Cancel</button>
        <button class="inline-flex items-center justify-center rounded-lg bg-danger px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50" [disabled]="saving()" (click)="confirmDelete()">Remove</button>
      </div>
    </app-modal>
  `,
})
export class TeachingManagementComponent {
  private api = inject(AdminService);
  private toast = inject(ToastService);

  readonly grades = Array.from({ length: 12 }, (_, i) => i + 1);

  teaching = signal<TeachingItem[]>([]);
  courses = signal<CourseItem[]>([]);
  teachers = signal<AdminUser[]>([]);
  loading = signal(true);
  loadError = signal('');
  saving = signal(false);

  search = signal('');
  gradeFilter = signal(0);

  rows = computed(() => {
    const q = this.search().trim().toLowerCase(), g = this.gradeFilter();
    return this.teaching().filter(t => (g === 0 || t.gradeNo === g) &&
      (!q || `${t.courseTitle} ${t.courseCode} ${t.teacherName}`.toLowerCase().includes(q)));
  });
  unassigned = computed(() => {
    const assigned = new Set(this.teaching().map(t => t.courseId));
    return this.courses().filter(c => !assigned.has(c.id));
  });

  showForm = signal(false);
  editing = signal<TeachingItem | null>(null);
  form: { courseId: number | null; teacherId: number | null } = { courseId: null, teacherId: null };
  formError = signal('');
  toDelete = signal<TeachingItem | null>(null);

  constructor() { this.load(); }

  private async load() {
    this.loading.set(true);
    try {
      const [teaching, courses, users] = await Promise.all([this.api.listTeaching(), this.api.listCourses(), this.api.listUsers()]);
      this.teaching.set(teaching);
      this.courses.set(courses);
      this.teachers.set(users.filter(u => u.role === 'TEACHER'));
      this.loadError.set('');
    } catch (e: any) {
      this.loadError.set(apiMessage(e, 'Could not load assignments. Try again in a moment.'));
    } finally { this.loading.set(false); }
  }

  openAssign(courseId: number | null = null) {
    this.editing.set(null); this.form = { courseId, teacherId: null }; this.formError.set(''); this.showForm.set(true);
  }
  openEdit(t: TeachingItem) {
    this.editing.set(t); this.form = { courseId: t.courseId, teacherId: t.teacherId }; this.formError.set(''); this.showForm.set(true);
  }

  async save() {
    const { courseId, teacherId } = this.form;
    if (courseId == null) return this.formError.set('Choose a course.');
    if (teacherId == null) return this.formError.set('Choose a teacher.');

    this.saving.set(true); this.formError.set('');
    try {
      const editing = this.editing();
      if (editing) await this.api.updateTeaching(editing.id, teacherId, courseId);
      else await this.api.assignTeacher(teacherId, courseId);
      this.showForm.set(false); this.toast.show(editing ? 'Assignment updated.' : 'Teacher assigned.'); await this.load();
    } catch (e: any) { this.formError.set(apiMessage(e, 'Could not save the assignment. Try again.')); }
    finally { this.saving.set(false); }
  }

  async confirmDelete() {
    const t = this.toDelete(); if (!t) return;
    this.saving.set(true);
    try { await this.api.unassignTeacher(t.id); this.toDelete.set(null); this.toast.show('Assignment removed.'); await this.load(); }
    catch (e: any) { this.toDelete.set(null); this.toast.error(apiMessage(e, 'Could not remove the assignment.')); }
    finally { this.saving.set(false); }
  }
}
