import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService, FEATURES } from '../../core/admin.service';
import { apiMessage } from '../../core/api';
import { CourseItem, CoursePayload } from '../../core/admin.models';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../layout/icon.component';
import { ModalComponent } from '../../shared/modal.component';

const BLANK: CoursePayload = { title: '', code: '', gradeNo: 1 };

@Component({
  selector: 'app-course-management',
  imports: [FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold">Manage courses</h1>
        <p class="text-sm text-slate-500">{{ filtered().length }} of {{ courses().length }} courses</p>
      </div>
      <button class="btn-primary gap-2" (click)="openCreate()"><app-icon name="plus" cls="h-4 w-4" /> Add course</button>
    </div>

    <div class="mt-4 flex flex-wrap gap-3">
      <input class="input max-w-xs" placeholder="Search title or code..." [ngModel]="search()" (ngModelChange)="search.set($event)" aria-label="Search courses" />
      <select class="input w-auto" [ngModel]="gradeFilter()" (ngModelChange)="gradeFilter.set($event)" aria-label="Filter by grade">
        <option [ngValue]="0">All grades</option>
        @for (g of grades; track g) { <option [ngValue]="g">Grade {{ g }}</option> }
      </select>
    </div>

    @if (loadError()) { <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger" role="alert">{{ loadError() }}</p> }

    <section class="card mt-4 overflow-x-auto">
      <table class="w-full min-w-[32rem] text-left text-sm">
        <thead class="border-b border-slate-200 text-xs text-slate-500">
          <tr><th class="px-4 py-3 font-medium">Course</th><th class="px-4 py-3 font-medium">Grade</th>@if (features.courseEnrolledCount) { <th class="px-4 py-3 font-medium">Enrolled</th> }<th class="px-4 py-3 text-right font-medium">Actions</th></tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          @for (c of filtered(); track c.id) {
            <tr>
              <td class="px-4 py-3 font-medium">{{ c.title }}<span class="block text-xs font-normal text-slate-500">{{ c.code }}</span></td>
              <td class="px-4 py-3">Grade {{ c.gradeNo }}</td>
              @if (features.courseEnrolledCount) { <td class="px-4 py-3">{{ c.enrolled }}</td> }
              <td class="px-4 py-3">
                <span class="flex justify-end gap-1">
                  <button class="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary" title="Edit" [attr.aria-label]="'Edit ' + c.title" (click)="openEdit(c)"><app-icon name="edit" cls="h-4 w-4" /></button>
                  <button class="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-danger" title="Delete" [attr.aria-label]="'Delete ' + c.title" (click)="toDelete.set(c)"><app-icon name="trash" cls="h-4 w-4" /></button>
                </span>
              </td>
            </tr>
          } @empty {
            <tr><td [attr.colspan]="features.courseEnrolledCount ? 4 : 3" class="px-4 py-10 text-center text-slate-500">{{ loading() ? 'Loading courses…' : 'No courses match your filters.' }}</td></tr>
          }
        </tbody>
      </table>
    </section>

    <app-modal [open]="showForm()" [title]="editing() ? 'Edit course' : 'Add course'" (closed)="showForm.set(false)">
      <form class="space-y-4" (ngSubmit)="save()" novalidate>
        @if (formError()) { <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger" role="alert">{{ formError() }}</p> }

        <div>
          <label for="c-title" class="mb-1 block text-sm font-medium">Title</label>
          <input id="c-title" name="title" class="input" [(ngModel)]="form.title" />
          @if (errors()['title']) { <p class="mt-1 text-xs text-danger">{{ errors()['title'] }}</p> }
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="c-code" class="mb-1 block text-sm font-medium">Code</label>
            <input id="c-code" name="code" class="input uppercase" [(ngModel)]="form.code" placeholder="CS105" />
            @if (errors()['code']) { <p class="mt-1 text-xs text-danger">{{ errors()['code'] }}</p> }
          </div>
          <div>
            <label for="c-grade" class="mb-1 block text-sm font-medium">Grade</label>
            <select id="c-grade" name="gradeNo" class="input" [(ngModel)]="form.gradeNo">
              @for (g of grades; track g) { <option [ngValue]="g">Grade {{ g }}</option> }
            </select>
            @if (errors()['gradeNo']) { <p class="mt-1 text-xs text-danger">{{ errors()['gradeNo'] }}</p> }
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" (click)="showForm.set(false)">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="saving()">{{ saving() ? 'Saving…' : (editing() ? 'Save changes' : 'Create course') }}</button>
        </div>
      </form>
    </app-modal>

    <app-modal [open]="!!toDelete()" title="Delete course" (closed)="toDelete.set(null)">
      <p class="text-sm text-slate-600">Delete <strong>{{ toDelete()?.title }}</strong>?
        @if ((toDelete()?.enrolled ?? 0) > 0) { <span class="text-danger"> {{ toDelete()?.enrolled }} students are enrolled.</span> }
        This can't be undone.</p>
      <div class="mt-5 flex justify-end gap-2">
        <button class="btn-secondary" (click)="toDelete.set(null)">Cancel</button>
        <button class="inline-flex items-center justify-center rounded-lg bg-danger px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50" [disabled]="saving()" (click)="confirmDelete()">Delete course</button>
      </div>
    </app-modal>
  `,
})
export class CourseManagementComponent {
  private api = inject(AdminService);
  readonly features = FEATURES;
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  readonly grades = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12

  courses = signal<CourseItem[]>([]);
  loading = signal(true);
  loadError = signal('');
  search = signal('');
  gradeFilter = signal(0); // 0 = all grades

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase(), g = this.gradeFilter();
    return this.courses().filter(c => (g === 0 || c.gradeNo === g) &&
      (!q || c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)));
  });

  showForm = signal(false);
  editing = signal<CourseItem | null>(null);
  form: CoursePayload = { ...BLANK };
  errors = signal<Record<string, string>>({});
  formError = signal('');
  saving = signal(false);
  toDelete = signal<CourseItem | null>(null);

  constructor() { this.load(); }

  private async load() {
    this.loading.set(true);
    try { this.courses.set(await this.api.listCourses()); this.loadError.set(''); }
    catch (e: any) {
      switch (e?.status) {
        case 0: this.loadError.set("Can't reach the server at localhost:8080. Check that Spring Boot is running and CORS allows http://localhost:4200."); break;
        case 401: this.loadError.set('Your session expired. Sign in again.'); this.auth.logout(); break;
        case 403: this.loadError.set("Your account isn't allowed to list courses. The backend must allow the ADMIN role on GET /api/courses."); break;
        default: this.loadError.set('Could not load courses. Try again in a moment.');
      }
    }
    finally { this.loading.set(false); }
  }

  openCreate() { this.editing.set(null); this.form = { ...BLANK }; this.errors.set({}); this.formError.set(''); this.showForm.set(true); }
  openEdit(c: CourseItem) {
    this.editing.set(c);
    this.form = { title: c.title, code: c.code, gradeNo: c.gradeNo };
    this.errors.set({}); this.formError.set(''); this.showForm.set(true);
  }

  async save() {
    const f = this.form, e: Record<string, string> = {};
    const grade = Number(f.gradeNo);
    if (f.title.trim().length < 3) e['title'] = 'Enter a course title.';
    if (!/^[A-Za-z]{2,4}\d{2,4}$/.test(f.code.trim())) e['code'] = 'Use a code like CS101.';
    if (!Number.isInteger(grade) || grade < 1 || grade > 12) e['gradeNo'] = 'Choose a grade from 1 to 12.';
    this.errors.set(e);
    if (Object.keys(e).length) return;

    this.saving.set(true); this.formError.set('');
    const payload: CoursePayload = { title: f.title.trim(), code: f.code.trim().toUpperCase(), gradeNo: grade };
    try {
      const editing = this.editing();
      if (editing) await this.api.updateCourse(editing.id, payload); else await this.api.createCourse(payload);
      this.showForm.set(false); this.toast.show(editing ? 'Course updated.' : 'Course created.'); await this.load();
    } catch (err: any) {
      this.formError.set(apiMessage(err, 'Could not save the course. Try again.'));
    } finally { this.saving.set(false); }
  }

  async confirmDelete() {
    const c = this.toDelete(); if (!c) return;
    this.saving.set(true);
    try { await this.api.deleteCourse(c); this.toDelete.set(null); this.toast.show('Course deleted.'); await this.load(); }
    catch (e: any) { this.toast.error(apiMessage(e, 'Could not delete the course.')); }
    finally { this.saving.set(false); }
  }
}
