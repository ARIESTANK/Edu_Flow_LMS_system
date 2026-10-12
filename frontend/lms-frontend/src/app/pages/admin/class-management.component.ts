import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/admin.service';
import { AdminUser, ClassItem, ClassPayload, EnrollmentItem } from '../../core/admin.models';
import { apiMessage } from '../../core/api';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../layout/icon.component';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  selector: 'app-class-management',
  imports: [FormsModule, DatePipe, IconComponent, ModalComponent],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold">Classes &amp; students</h1>
        <p class="text-sm text-slate-500">Create classes, then enroll students. Each enrollment stores the class's grade.</p>
      </div>
      <button class="btn-primary gap-2" (click)="openCreate()"><app-icon name="plus" cls="h-4 w-4" /> Add class</button>
    </div>

    <div class="mt-4 flex flex-wrap gap-3">
      <input class="input max-w-xs" placeholder="Search class code..." [ngModel]="search()" (ngModelChange)="search.set($event)" aria-label="Search classes" />
      <select class="input w-auto" [ngModel]="gradeFilter()" (ngModelChange)="gradeFilter.set($event)" aria-label="Filter by grade">
        <option [ngValue]="0">All grades</option>
        @for (g of grades; track g) { <option [ngValue]="g">Grade {{ g }}</option> }
      </select>
    </div>

    @if (loadError()) { <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger" role="alert">{{ loadError() }}</p> }

    <section class="card mt-4 overflow-x-auto">
      <table class="w-full min-w-[32rem] text-left text-sm">
        <thead class="border-b border-slate-200 text-xs text-slate-500">
          <tr><th class="px-4 py-3 font-medium">Class</th><th class="px-4 py-3 font-medium">Grade</th><th class="px-4 py-3 font-medium">Students</th><th class="px-4 py-3 text-right font-medium">Actions</th></tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          @for (c of filtered(); track c.id) {
            <tr>
              <td class="px-4 py-3 font-medium">{{ c.code }}</td>
              <td class="px-4 py-3">Grade {{ c.gradeNo }}</td>
              <td class="px-4 py-3">{{ c.studentCount }}</td>
              <td class="px-4 py-3">
                <span class="flex justify-end gap-1">
                  <button class="btn-secondary px-3 py-1.5 text-xs" (click)="openStudents(c)">Students</button>
                  <button class="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary" title="Edit" [attr.aria-label]="'Edit ' + c.code" (click)="openEdit(c)"><app-icon name="edit" cls="h-4 w-4" /></button>
                  <button class="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-danger" title="Delete" [attr.aria-label]="'Delete ' + c.code" (click)="toDelete.set(c)"><app-icon name="trash" cls="h-4 w-4" /></button>
                </span>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="4" class="px-4 py-10 text-center text-slate-500">{{ loading() ? 'Loading classes…' : 'No classes yet. Add the first one.' }}</td></tr>
          }
        </tbody>
      </table>
    </section>

    <!-- Create / edit class -->
    <app-modal [open]="showForm()" [title]="editing() ? 'Edit class' : 'Add class'" (closed)="showForm.set(false)">
      <form class="space-y-4" (ngSubmit)="save()" novalidate>
        @if (formError()) { <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger" role="alert">{{ formError() }}</p> }
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="k-code" class="mb-1 block text-sm font-medium">Class code</label>
            <input id="k-code" name="code" class="input" [(ngModel)]="form.code" placeholder="10-A" />
          </div>
          <div>
            <label for="k-grade" class="mb-1 block text-sm font-medium">Grade</label>
            <select id="k-grade" name="gradeNo" class="input" [(ngModel)]="form.gradeNo">
              @for (g of grades; track g) { <option [ngValue]="g">Grade {{ g }}</option> }
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" (click)="showForm.set(false)">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="saving()">{{ saving() ? 'Saving…' : (editing() ? 'Save changes' : 'Create class') }}</button>
        </div>
      </form>
    </app-modal>

    <!-- Delete class -->
    <app-modal [open]="!!toDelete()" title="Delete class" (closed)="toDelete.set(null)">
      <p class="text-sm text-slate-600">Delete class <strong>{{ toDelete()?.code }}</strong>? A class that still has students can't be deleted. Remove or move them first.</p>
      <div class="mt-5 flex justify-end gap-2">
        <button class="btn-secondary" (click)="toDelete.set(null)">Cancel</button>
        <button class="inline-flex items-center justify-center rounded-lg bg-danger px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50" [disabled]="saving()" (click)="confirmDelete()">Delete class</button>
      </div>
    </app-modal>

    <!-- Students in a class -->
    <app-modal [open]="!!selected()" [title]="'Class ' + (selected()?.code ?? '') + ' · Grade ' + (selected()?.gradeNo ?? '')" size="max-w-2xl" (closed)="closeStudents()">
      @if (selected(); as cls) {
        <h3 class="text-sm font-semibold">Enrolled ({{ classEnrollments().length }})</h3>
        <ul class="mt-2 max-h-52 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 text-sm">
          @for (e of classEnrollments(); track e.id) {
            <li class="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <span>{{ e.studentName }}<span class="block text-xs text-slate-500">{{ e.studentEmail }}@if (e.enrollmentDate) { · enrolled {{ e.enrollmentDate | date: 'mediumDate' }} }</span></span>
              <span class="flex items-center gap-2">
                <select class="input w-auto py-1 text-xs" [ngModel]="null" (ngModelChange)="move(e, $event)" [attr.aria-label]="'Move ' + e.studentName + ' to another class'">
                  <option [ngValue]="null" disabled>Move to…</option>
                  @for (o of otherClasses(); track o.id) { <option [ngValue]="o.id">{{ o.code }} (Grade {{ o.gradeNo }})</option> }
                </select>
                <button class="text-xs font-medium text-danger hover:underline" (click)="unenroll(e)">Remove</button>
              </span>
            </li>
          } @empty {
            <li class="px-3 py-6 text-center text-slate-500">No students in this class yet.</li>
          }
        </ul>

        <h3 class="mt-5 text-sm font-semibold">Enroll students</h3>
        <p class="text-xs text-slate-500">Only students who are not enrolled in any class are listed. A student can have one enrollment, so remove it first to enroll them elsewhere. Their grade is saved as {{ cls.gradeNo }}.</p>
        <input class="input mt-2" placeholder="Search students..." [ngModel]="studentSearch()" (ngModelChange)="studentSearch.set($event)" aria-label="Search students" />

        <div class="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200">
          @if (candidates().length) {
            <label class="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium">
              <input type="checkbox" [checked]="allPicked()" (change)="togglePickAll()" class="rounded border-slate-300 text-primary focus:ring-primary" /> Select all {{ candidates().length }} shown
            </label>
          }
          @for (s of candidates(); track s.id) {
            <label class="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50">
              <input type="checkbox" [checked]="picked().includes(s.id)" (change)="togglePick(s.id)" class="rounded border-slate-300 text-primary focus:ring-primary" />
              <span>{{ s.username }}<span class="block text-xs text-slate-500">{{ s.email }}</span></span>
            </label>
          } @empty {
            <p class="px-3 py-6 text-center text-sm text-slate-500">No students available to enroll.</p>
          }
        </div>

        @if (skipped().length) {
          <ul class="mt-2 list-disc rounded-lg bg-amber-50 px-6 py-2 text-xs text-amber-800" role="status">
            @for (m of skipped(); track m) { <li>{{ m }}</li> }
          </ul>
        }

        <div class="mt-4 flex items-center justify-between">
          <span class="text-xs text-slate-500">{{ picked().length }} selected</span>
          <button class="btn-primary" [disabled]="!picked().length || saving()" (click)="enroll()">{{ saving() ? 'Enrolling…' : 'Enroll selected' }}</button>
        </div>
      }
    </app-modal>
  `,
})
export class ClassManagementComponent {
  private api = inject(AdminService);
  private toast = inject(ToastService);

  readonly grades = Array.from({ length: 12 }, (_, i) => i + 1);

  classes = signal<ClassItem[]>([]);
  students = signal<AdminUser[]>([]);
  enrollments = signal<EnrollmentItem[]>([]);
  loading = signal(true);
  loadError = signal('');
  saving = signal(false);

  search = signal('');
  gradeFilter = signal(0);
  filtered = computed(() => {
    const q = this.search().trim().toLowerCase(), g = this.gradeFilter();
    return this.classes().filter(c => (g === 0 || c.gradeNo === g) && (!q || c.code.toLowerCase().includes(q)));
  });

  // class form
  showForm = signal(false);
  editing = signal<ClassItem | null>(null);
  form: ClassPayload = { code: '', gradeNo: 1 };
  formError = signal('');
  toDelete = signal<ClassItem | null>(null);

  // students modal
  selected = signal<ClassItem | null>(null);
  studentSearch = signal('');
  picked = signal<number[]>([]);
  skipped = signal<string[]>([]);

  classEnrollments = computed(() => this.enrollments().filter(e => e.classId === this.selected()?.id));
  otherClasses = computed(() => this.classes().filter(c => c.id !== this.selected()?.id));
  candidates = computed(() => {
    const cls = this.selected();
    if (!cls) return [];
    const q = this.studentSearch().trim().toLowerCase();
    const enrolled = new Set(this.enrollments().map(e => e.studentId)); // one enrollment per student
    return this.students().filter(s => !enrolled.has(s.id) &&
      (!q || s.username.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)));
  });
  allPicked = computed(() => this.candidates().length > 0 && this.candidates().every(s => this.picked().includes(s.id)));

  constructor() { this.load(); }

  private async load() {
    this.loading.set(true);
    try {
      const [classes, users, enrollments] = await Promise.all([this.api.listClasses(), this.api.listUsers(), this.api.listEnrollments()]);
      this.classes.set(classes);
      this.students.set(users.filter(u => u.role === 'STUDENT'));
      this.enrollments.set(enrollments);
      const sel = this.selected();
      if (sel) this.selected.set(classes.find(c => c.id === sel.id) ?? null);
      this.loadError.set('');
    } catch (e: any) {
      this.loadError.set(apiMessage(e, 'Could not load classes. Try again in a moment.'));
    } finally { this.loading.set(false); }
  }

  // ----- class CRUD -----
  openCreate() { this.editing.set(null); this.form = { code: '', gradeNo: 1 }; this.formError.set(''); this.showForm.set(true); }
  openEdit(c: ClassItem) { this.editing.set(c); this.form = { code: c.code, gradeNo: c.gradeNo }; this.formError.set(''); this.showForm.set(true); }

  async save() {
    const code = this.form.code.trim(), grade = Number(this.form.gradeNo);
    if (!code) return this.formError.set('Enter a class code, for example 10-A.');
    if (!Number.isInteger(grade) || grade < 1 || grade > 12) return this.formError.set('Choose a grade from 1 to 12.');

    this.saving.set(true); this.formError.set('');
    try {
      const editing = this.editing();
      if (editing) await this.api.updateClass(editing.id, { code, gradeNo: grade });
      else await this.api.createClass({ code, gradeNo: grade });
      this.showForm.set(false); this.toast.show(editing ? 'Class updated.' : 'Class created.'); await this.load();
    } catch (e: any) { this.formError.set(apiMessage(e, 'Could not save the class. Try again.')); }
    finally { this.saving.set(false); }
  }

  async confirmDelete() {
    const c = this.toDelete(); if (!c) return;
    this.saving.set(true);
    try { await this.api.deleteClass(c); this.toDelete.set(null); this.toast.show('Class deleted.'); await this.load(); }
    catch (e: any) { this.toDelete.set(null); this.toast.error(apiMessage(e, 'Could not delete the class.')); }
    finally { this.saving.set(false); }
  }

  // ----- enrollment -----
  openStudents(c: ClassItem) { this.selected.set(c); this.studentSearch.set(''); this.picked.set([]); this.skipped.set([]); }
  closeStudents() { this.selected.set(null); }

  togglePick(id: number) { this.picked.update(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id])); }
  togglePickAll() {
    const ids = this.candidates().map(s => s.id);
    this.picked.set(this.allPicked() ? this.picked().filter(id => !ids.includes(id)) : [...new Set([...this.picked(), ...ids])]);
  }

  async enroll() {
    const cls = this.selected(); if (!cls || !this.picked().length) return;
    this.saving.set(true); this.skipped.set([]);
    try {
      const res = await this.api.enrollStudents(cls.id, this.picked());
      this.skipped.set(res.skipped);
      this.picked.set([]);
      if (res.created) this.toast.show(`${res.created} student${res.created === 1 ? '' : 's'} enrolled in ${cls.code}.`);
      await this.load();
    } catch (e: any) { this.toast.error(apiMessage(e, 'Could not enroll the students.')); }
    finally { this.saving.set(false); }
  }

  async unenroll(e: EnrollmentItem) {
    try { await this.api.removeEnrollment(e.id); this.toast.show(`${e.studentName} removed from the class.`); await this.load(); }
    catch (err: any) { this.toast.error(apiMessage(err, 'Could not remove the student.')); }
  }

  async move(e: EnrollmentItem, classId: number | null) {
    if (!classId) return;
    try { await this.api.moveEnrollment(e.id, classId); this.toast.show(`${e.studentName} moved.`); await this.load(); }
    catch (err: any) { this.toast.error(apiMessage(err, 'Could not move the student.')); }
  }
}
