import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, FEATURES } from '../../core/admin.service';
import { apiMessage } from '../../core/api';
import { AdminUser } from '../../core/admin.models';
import { AuthService, Role } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../layout/icon.component';
import { ModalComponent } from '../../shared/modal.component';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-user-management',
  imports: [FormsModule, DatePipe, IconComponent, ModalComponent],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold">Manage users</h1>
        <p class="text-sm text-slate-500">{{ filtered().length }} of {{ users().length }} users</p>
      </div>
      <button class="btn-primary gap-2" (click)="openCreate()"><app-icon name="plus" cls="h-4 w-4" /> Add user</button>
    </div>

    <!-- Filters -->
    <div class="mt-4 flex flex-wrap gap-3">
      <input class="input max-w-xs" placeholder="Search name or email..." [ngModel]="search()" (ngModelChange)="setSearch($event)" aria-label="Search users" />
      <select class="input w-auto" [ngModel]="roleFilter()" (ngModelChange)="setRole($event)" aria-label="Filter by role">
        <option value="ALL">All roles</option><option value="STUDENT">Students</option><option value="TEACHER">Teachers</option><option value="ADMIN">Admins</option>
      </select>
      @if (features.userMeta) {
        <select class="input w-auto" [ngModel]="statusFilter()" (ngModelChange)="setStatus($event)" aria-label="Filter by status">
          <option value="ALL">Any status</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
        </select>
      }
    </div>

    @if (loadError()) { <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger" role="alert">{{ loadError() }}</p> }

    <section class="card mt-4 overflow-x-auto">
      <table class="w-full min-w-[46rem] text-left text-sm">
        <thead class="border-b border-slate-200 text-xs text-slate-500">
          <tr>
            <th class="px-4 py-3 font-medium">User</th><th class="px-4 py-3 font-medium">Role</th>
            @if (features.userMeta) { <th class="px-4 py-3 font-medium">Status</th><th class="px-4 py-3 font-medium">Last login</th> }
            <th class="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          @for (u of paged(); track u.id) {
            <tr>
              <td class="px-4 py-3">
                <span class="flex items-center gap-3">
                  <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary">{{ (u.username || '?')[0].toUpperCase() }}</span>
                  <span class="font-medium">{{ u.username }}@if (isSelf(u)) { <span class="ml-1 text-xs text-slate-400">(you)</span> }<span class="block text-xs font-normal text-slate-500">{{ u.email }}</span></span>
                </span>
              </td>
              <td class="px-4 py-3"><span [class]="roleBadge(u.role)">{{ u.role.toLowerCase() }}</span></td>
              @if (features.userMeta) {
                <td class="px-4 py-3"><span [class]="u.active ? 'badge-success' : 'badge-error'">{{ u.active ? 'Active' : 'Inactive' }}</span></td>
                <td class="px-4 py-3 text-slate-500">{{ u.lastLogin ? (u.lastLogin | date: 'MMM d, y') : 'Never' }}</td>
              }
              <td class="px-4 py-3">
                <span class="flex justify-end gap-1">
                  <button class="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary" title="Edit" [attr.aria-label]="'Edit ' + u.username" (click)="openEdit(u)"><app-icon name="edit" cls="h-4 w-4" /></button>
                  <button class="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary" title="Reset password" [attr.aria-label]="'Reset password for ' + u.username" (click)="openReset(u)"><app-icon name="key" cls="h-4 w-4" /></button>
                  @if (features.userMeta) {
                    <button class="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-warning disabled:opacity-30" [title]="u.active ? 'Deactivate' : 'Activate'" [attr.aria-label]="(u.active ? 'Deactivate ' : 'Activate ') + u.username" [disabled]="isSelf(u)" (click)="toggleActive(u)"><app-icon [name]="u.active ? 'ban' : 'check'" cls="h-4 w-4" /></button>
                  }
                  <button class="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-danger disabled:opacity-30" title="Delete" [attr.aria-label]="'Delete ' + u.username" [disabled]="isSelf(u)" (click)="toDelete.set(u)"><app-icon name="trash" cls="h-4 w-4" /></button>
                </span>
              </td>
            </tr>
          } @empty {
            <tr><td [attr.colspan]="features.userMeta ? 5 : 3" class="px-4 py-10 text-center text-slate-500">{{ loading() ? 'Loading users…' : 'No users match your filters.' }}</td></tr>
          }
        </tbody>
      </table>

      <div class="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
        <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
        <span class="flex gap-2">
          <button class="btn-secondary px-3 py-1.5" [disabled]="currentPage() <= 1" (click)="page.set(currentPage() - 1)">Previous</button>
          <button class="btn-secondary px-3 py-1.5" [disabled]="currentPage() >= totalPages()" (click)="page.set(currentPage() + 1)">Next</button>
        </span>
      </div>
    </section>

    <!-- Create / edit -->
    <app-modal [open]="showForm()" [title]="editing() ? 'Edit user' : 'Add user'" (closed)="showForm.set(false)">
      <form class="space-y-4" (ngSubmit)="save()" novalidate>
        @if (formError()) { <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger" role="alert">{{ formError() }}</p> }

        <div>
          <label for="u-name" class="mb-1 block text-sm font-medium">Username</label>
          <input id="u-name" name="username" class="input" [(ngModel)]="form.username" />
          @if (errors()['username']) { <p class="mt-1 text-xs text-danger">{{ errors()['username'] }}</p> }
        </div>
        <div>
          <label for="u-email" class="mb-1 block text-sm font-medium">Email</label>
          <input id="u-email" name="email" type="email" class="input" [(ngModel)]="form.email" />
          @if (errors()['email']) { <p class="mt-1 text-xs text-danger">{{ errors()['email'] }}</p> }
        </div>
        <div>
          <label for="u-role" class="mb-1 block text-sm font-medium">Role</label>
          <select id="u-role" name="role" class="input" [(ngModel)]="form.role">
            <option value="STUDENT">Student</option><option value="TEACHER">Teacher</option><option value="ADMIN">Admin</option>
          </select>
          @if (errors()['role']) { <p class="mt-1 text-xs text-danger">{{ errors()['role'] }}</p> }
        </div>

        @if (!editing()) {
          <div>
            <label for="u-pw" class="mb-1 block text-sm font-medium">Temporary password</label>
            <div class="flex gap-2">
              <input id="u-pw" name="password" class="input" [(ngModel)]="form.password" autocomplete="new-password" />
              <button type="button" class="btn-secondary shrink-0" (click)="form.password = api.generatePassword()">Generate</button>
            </div>
            @if (errors()['password']) { <p class="mt-1 text-xs text-danger">{{ errors()['password'] }}</p> }
          </div>
        } @else if (features.userMeta) {
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" [(ngModel)]="form.active" class="rounded border-slate-300 text-primary focus:ring-primary" /> Account is active
          </label>
        }

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" (click)="showForm.set(false)">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="saving()">{{ saving() ? 'Saving…' : (editing() ? 'Save changes' : 'Create user') }}</button>
        </div>
      </form>
    </app-modal>

    <!-- Delete -->
    <app-modal [open]="!!toDelete()" title="Delete user" (closed)="toDelete.set(null)">
      <p class="text-sm text-slate-600">Delete <strong>{{ toDelete()?.username }}</strong>? Their account is removed and this can't be undone. To keep their records, deactivate the account instead.</p>
      <div class="mt-5 flex justify-end gap-2">
        <button class="btn-secondary" (click)="toDelete.set(null)">Cancel</button>
        <button class="inline-flex items-center justify-center rounded-lg bg-danger px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50" [disabled]="saving()" (click)="confirmDelete()">Delete user</button>
      </div>
    </app-modal>

    <!-- Reset password -->
    <app-modal [open]="!!resetTarget()" title="Reset password" (closed)="closeReset()">
      @if (resetTarget(); as t) {
        @if (resetDone()) {
          <p class="text-sm text-slate-600">New password for <strong>{{ t.username }}</strong>. It is shown only once, so copy it now and share it through a secure channel.</p>
          <div class="mt-3 flex gap-2">
            <input class="input font-mono" readonly [value]="resetResult()" aria-label="New password" />
            <button class="btn-secondary shrink-0" (click)="copy(resetResult())">Copy</button>
          </div>
          <div class="mt-5 flex justify-end"><button class="btn-primary" (click)="closeReset()">Done</button></div>
        } @else {
          <p class="text-sm text-slate-600">Choose how to reset the password for <strong>{{ t.username }}</strong> ({{ t.email }}).</p>

          <div class="mt-4 space-y-3 text-sm">
            <label class="flex cursor-pointer gap-2 rounded-lg border p-3" [class]="resetMode() === 'generate' ? 'border-primary bg-primary-light' : 'border-slate-200'">
              <input type="radio" name="rm" class="mt-0.5" [checked]="resetMode() === 'generate'" (change)="resetMode.set('generate')" />
              <span><span class="font-medium">Generate a password</span><span class="block text-xs text-slate-500">A strong random password you can hand to the user.</span></span>
            </label>
            <label class="flex cursor-pointer gap-2 rounded-lg border p-3" [class]="resetMode() === 'manual' ? 'border-primary bg-primary-light' : 'border-slate-200'">
              <input type="radio" name="rm" class="mt-0.5" [checked]="resetMode() === 'manual'" (change)="resetMode.set('manual')" />
              <span class="flex-1"><span class="font-medium">Set it myself</span>
                @if (resetMode() === 'manual') {
                  <input class="input mt-2" [(ngModel)]="manualPw" name="manualPw" placeholder="At least 8 characters" autocomplete="new-password" />
                }
              </span>
            </label>
            @if (features.emailResetLink) {
              <label class="flex cursor-pointer gap-2 rounded-lg border p-3" [class]="resetMode() === 'email' ? 'border-primary bg-primary-light' : 'border-slate-200'">
                <input type="radio" name="rm" class="mt-0.5" [checked]="resetMode() === 'email'" (change)="resetMode.set('email')" />
                <span><span class="font-medium">Email a reset link</span><span class="block text-xs text-slate-500">The user picks their own new password.</span></span>
              </label>
            }
          </div>

          @if (resetMode() !== 'email' && features.forcePasswordChange) {
            <label class="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" [(ngModel)]="forceChange" name="forceChange" class="rounded border-slate-300 text-primary focus:ring-primary" /> Make them change it at next login
            </label>
          }
          @if (resetError()) { <p class="mt-3 text-sm text-danger" role="alert">{{ resetError() }}</p> }

          <div class="mt-5 flex justify-end gap-2">
            <button class="btn-secondary" (click)="closeReset()">Cancel</button>
            <button class="btn-primary" [disabled]="saving()" (click)="doReset(t)">{{ resetMode() === 'email' ? 'Send link' : 'Reset password' }}</button>
          </div>
        }
      }
    </app-modal>
  `,
})
export class UserManagementComponent {
  api = inject(AdminService);
  readonly features = FEATURES;
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  users = signal<AdminUser[]>([]);
  loading = signal(true);
  loadError = signal('');

  search = signal('');
  roleFilter = signal<'ALL' | Role>('ALL');
  statusFilter = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  page = signal(1);
  readonly pageSize = 8;

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const r = this.roleFilter(), s = this.statusFilter();
    return this.users().filter(u =>
      (r === 'ALL' || u.role === r) &&
      (s === 'ALL' || (s === 'ACTIVE') === u.active) &&
      (!q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  });
  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  currentPage = computed(() => Math.min(this.page(), this.totalPages()));
  paged = computed(() => this.filtered().slice((this.currentPage() - 1) * this.pageSize, this.currentPage() * this.pageSize));

  // create / edit
  showForm = signal(false);
  editing = signal<AdminUser | null>(null);
  form = { username: '', email: '', role: 'STUDENT' as Role, password: '', active: true };
  errors = signal<Record<string, string>>({});
  formError = signal('');
  saving = signal(false);

  // delete / reset
  toDelete = signal<AdminUser | null>(null);
  resetTarget = signal<AdminUser | null>(null);
  resetMode = signal<'generate' | 'manual' | 'email'>('generate');
  manualPw = '';
  forceChange = true;
  resetResult = signal('');
  resetDone = signal(false);
  resetError = signal('');

  constructor() { this.load(); }

  isSelf(u: AdminUser) { return u.id === this.auth.user()?.id; }
  roleBadge(r: Role) { return r === 'ADMIN' ? 'badge-warning capitalize' : r === 'TEACHER' ? 'badge-success capitalize' : 'rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-700'; }
  setSearch(v: string) { this.search.set(v); this.page.set(1); }
  setRole(v: 'ALL' | Role) { this.roleFilter.set(v); this.page.set(1); }
  setStatus(v: 'ALL' | 'ACTIVE' | 'INACTIVE') { this.statusFilter.set(v); this.page.set(1); }

  private async load() {
    this.loading.set(true);
    try { this.users.set(await this.api.listUsers()); this.loadError.set(''); }
    catch (e: any) { this.loadError.set(this.describe(e)); }
    finally { this.loading.set(false); }
  }

  /** Turns an HTTP error into a message the admin can act on */
  private describe(e: any): string {
    switch (e?.status) {
      case 0: return "Can't reach the server at localhost:8080. Check that Spring Boot is running and that CORS allows http://localhost:4200.";
      case 401: this.auth.logout(); return 'Your session expired. Sign in again.';
      case 403: return "Your account isn't allowed to list users. The backend must allow the ADMIN role on GET /api/users.";
      default: return 'Could not load users. Try again in a moment.';
    }
  }

  openCreate() {
    this.editing.set(null);
    this.form = { username: '', email: '', role: 'STUDENT', password: this.api.generatePassword(), active: true };
    this.errors.set({}); this.formError.set(''); this.showForm.set(true);
  }
  openEdit(u: AdminUser) {
    this.editing.set(u);
    this.form = { username: u.username, email: u.email, role: u.role, password: '', active: u.active };
    this.errors.set({}); this.formError.set(''); this.showForm.set(true);
  }

  async save() {
    const e: Record<string, string> = {};
    const f = this.form, editing = this.editing();
    if (f.username.trim().length < 3) e['username'] = 'Username must be at least 3 characters.';
    if (!EMAIL_RE.test(f.email.trim())) e['email'] = 'Enter a valid email address.';
    if (!editing && (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password))) e['password'] = 'Use at least 8 characters with a letter and a number.';
    if (editing && this.isSelf(editing) && editing.role === 'ADMIN' && f.role !== 'ADMIN') e['role'] = "You can't remove your own admin role.";
    if (editing && this.isSelf(editing) && !f.active) e['role'] = "You can't deactivate your own account.";
    this.errors.set(e);
    if (Object.keys(e).length) return;

    this.saving.set(true); this.formError.set('');
    try {
      const base = { username: f.username.trim(), email: f.email.trim().toLowerCase(), role: f.role };
      if (editing) await this.api.updateUser(editing.id, { ...base, active: f.active });
      else await this.api.createUser({ ...base, password: f.password });
      this.showForm.set(false);
      this.toast.show(editing ? 'User updated.' : 'User created.');
      await this.load();
    } catch (err: any) {
      this.formError.set(apiMessage(err, 'Could not save the user. Try again.'));
    } finally { this.saving.set(false); }
  }

  async toggleActive(u: AdminUser) {
    try {
      await this.api.setUserActive(u, !u.active);
      this.toast.show(`${u.username} is now ${u.active ? 'inactive' : 'active'}.`);
      await this.load();
    } catch (e: any) { this.toast.error(apiMessage(e, 'Could not change the account status.')); }
  }

  async confirmDelete() {
    const u = this.toDelete(); if (!u) return;
    this.saving.set(true);
    try { await this.api.deleteUser(u); this.toDelete.set(null); this.toast.show('User deleted.'); await this.load(); }
    catch (e: any) { this.toast.error(apiMessage(e, 'Could not delete the user.')); }
    finally { this.saving.set(false); }
  }

  openReset(u: AdminUser) {
    this.resetTarget.set(u); this.resetMode.set('generate'); this.manualPw = ''; this.forceChange = true;
    this.resetDone.set(false); this.resetResult.set(''); this.resetError.set('');
  }
  closeReset() { this.resetTarget.set(null); this.resetResult.set(''); this.resetDone.set(false); }

  async doReset(u: AdminUser) {
    this.resetError.set('');
    this.saving.set(true);
    try {
      if (this.resetMode() === 'email') {
        await this.api.sendResetLink(u.email);
        this.toast.show(`Reset link sent to ${u.email}.`);
        this.closeReset();
        return;
      }
      const pw = this.resetMode() === 'manual' ? this.manualPw : this.api.generatePassword();
      if (pw.length < 8 || !/[A-Za-z]/.test(pw) || !/\d/.test(pw)) { this.resetError.set('Use at least 8 characters with a letter and a number.'); return; }
      await this.api.resetPassword(u, pw, this.forceChange);
      this.resetResult.set(pw); this.resetDone.set(true);
    } catch (e: any) { this.resetError.set(apiMessage(e, 'Could not reset the password. Try again.')); }
    finally { this.saving.set(false); }
  }

  async copy(text: string) {
    try { await navigator.clipboard.writeText(text); this.toast.show('Copied to clipboard.'); }
    catch { this.toast.error('Copy failed. Select the text and copy it manually.'); }
  }
}
