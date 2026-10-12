import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/admin.service';
import { AuditLog, Department, SystemSettings } from '../../core/admin.models';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../layout/icon.component';
import { ModalComponent } from '../../shared/modal.component';

type Tab = 'General' | 'Departments' | 'Audit log';

@Component({
  selector: 'app-system-settings',
  imports: [FormsModule, DatePipe, IconComponent, ModalComponent],
  template: `
    <h1 class="text-xl font-bold">System settings</h1>

    <div class="mt-4 flex gap-6 overflow-x-auto border-b border-slate-200" role="tablist">
      @for (t of tabs; track t) {
        <button role="tab" [attr.aria-selected]="tab() === t" (click)="tab.set(t)" class="whitespace-nowrap border-b-2 py-3 text-sm font-medium"
                [class]="tab() === t ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'">{{ t }}</button>
      }
    </div>

    @if (loadError()) { <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger" role="alert">{{ loadError() }}</p> }

    @switch (tab()) {
      @case ('General') {
        <form class="card mt-4 max-w-2xl space-y-5 p-5" (ngSubmit)="saveSettings()" novalidate>
          <div>
            <label for="s-name" class="mb-1 block text-sm font-medium">Site name</label>
            <input id="s-name" name="siteName" class="input" [(ngModel)]="settings.siteName" />
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <div>
              <label for="s-role" class="mb-1 block text-sm font-medium">Default role</label>
              <select id="s-role" name="defaultRole" class="input" [(ngModel)]="settings.defaultRole">
                <option value="STUDENT">Student</option><option value="TEACHER">Teacher</option>
              </select>
            </div>
            <div>
              <label for="s-timeout" class="mb-1 block text-sm font-medium">Session timeout (min)</label>
              <input id="s-timeout" name="timeout" type="number" min="5" class="input" [(ngModel)]="settings.sessionTimeoutMin" />
            </div>
            <div>
              <label for="s-upload" class="mb-1 block text-sm font-medium">Max upload (MB)</label>
              <input id="s-upload" name="upload" type="number" min="1" class="input" [(ngModel)]="settings.maxUploadMb" />
            </div>
          </div>

          <div class="max-w-xs">
            <label for="s-pw" class="mb-1 block text-sm font-medium">Minimum password length</label>
            <input id="s-pw" name="pwlen" type="number" min="6" max="64" class="input" [(ngModel)]="settings.passwordMinLength" />
          </div>

          <div class="space-y-3 text-sm">
            <label class="flex items-start gap-2"><input type="checkbox" name="reg" class="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary" [(ngModel)]="settings.allowRegistration" />
              <span><span class="font-medium">Allow public registration</span><span class="block text-xs text-slate-500">When off, only admins can create accounts.</span></span></label>
            <label class="flex items-start gap-2"><input type="checkbox" name="maint" class="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary" [(ngModel)]="settings.maintenanceMode" />
              <span><span class="font-medium">Maintenance mode</span><span class="block text-xs text-slate-500">Students and teachers see a maintenance notice. Admins can still sign in.</span></span></label>
          </div>

          @if (settingsError()) { <p class="text-sm text-danger" role="alert">{{ settingsError() }}</p> }
          <div class="flex justify-end"><button type="submit" class="btn-primary" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save settings' }}</button></div>
        </form>
      }

      @case ('Departments') {
        <div class="mt-4 flex items-center justify-between">
          <p class="text-sm text-slate-500">{{ departments().length }} departments</p>
          <button class="btn-primary gap-2" (click)="openDept()"><app-icon name="plus" cls="h-4 w-4" /> Add department</button>
        </div>
        <section class="card mt-3 divide-y divide-slate-100">
          @for (d of departments(); track d.id) {
            <div class="flex items-center justify-between px-4 py-3 text-sm">
              <span class="font-medium">{{ d.name }}<span class="block text-xs font-normal text-slate-500">Head: {{ d.head || 'Not assigned' }}</span></span>
              <span class="flex gap-1">
                <button class="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary" [attr.aria-label]="'Edit ' + d.name" (click)="openDept(d)"><app-icon name="edit" cls="h-4 w-4" /></button>
                <button class="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-danger" [attr.aria-label]="'Delete ' + d.name" (click)="deptToDelete.set(d)"><app-icon name="trash" cls="h-4 w-4" /></button>
              </span>
            </div>
          } @empty {
            <p class="px-4 py-10 text-center text-sm text-slate-500">No departments yet.</p>
          }
        </section>
      }

      @case ('Audit log') {
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <input class="input max-w-xs" placeholder="Filter by user, action or target..." [ngModel]="logSearch()" (ngModelChange)="logSearch.set($event)" aria-label="Filter audit log" />
          <button class="btn-secondary" (click)="loadLogs()">Refresh</button>
        </div>
        <section class="card mt-3 overflow-x-auto">
          <table class="w-full min-w-[36rem] text-left text-sm">
            <thead class="border-b border-slate-200 text-xs text-slate-500"><tr><th class="px-4 py-3 font-medium">When</th><th class="px-4 py-3 font-medium">Who</th><th class="px-4 py-3 font-medium">Action</th><th class="px-4 py-3 font-medium">Target</th></tr></thead>
            <tbody class="divide-y divide-slate-100">
              @for (l of filteredLogs(); track l.id) {
                <tr><td class="px-4 py-2.5 text-slate-500">{{ l.time | date: 'MMM d, h:mm a' }}</td><td class="px-4 py-2.5">{{ l.actor }}</td><td class="px-4 py-2.5">{{ l.action }}</td><td class="px-4 py-2.5 text-slate-500">{{ l.target }}</td></tr>
              } @empty {
                <tr><td colspan="4" class="px-4 py-10 text-center text-slate-500">No log entries.</td></tr>
              }
            </tbody>
          </table>
        </section>
      }
    }

    <app-modal [open]="showDept()" [title]="editingDept() ? 'Edit department' : 'Add department'" (closed)="showDept.set(false)">
      <form class="space-y-4" (ngSubmit)="saveDept()" novalidate>
        <div>
          <label for="d-name" class="mb-1 block text-sm font-medium">Name</label>
          <input id="d-name" name="dname" class="input" [(ngModel)]="deptForm.name" />
          @if (deptError()) { <p class="mt-1 text-xs text-danger">{{ deptError() }}</p> }
        </div>
        <div>
          <label for="d-head" class="mb-1 block text-sm font-medium">Department head</label>
          <input id="d-head" name="dhead" class="input" [(ngModel)]="deptForm.head" />
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary" (click)="showDept.set(false)">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="saving()">Save</button>
        </div>
      </form>
    </app-modal>

    <app-modal [open]="!!deptToDelete()" title="Delete department" (closed)="deptToDelete.set(null)">
      <p class="text-sm text-slate-600">Delete <strong>{{ deptToDelete()?.name }}</strong>? Courses and users linked to it keep their data but lose the department.</p>
      <div class="mt-5 flex justify-end gap-2">
        <button class="btn-secondary" (click)="deptToDelete.set(null)">Cancel</button>
        <button class="inline-flex items-center justify-center rounded-lg bg-danger px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50" [disabled]="saving()" (click)="confirmDeleteDept()">Delete</button>
      </div>
    </app-modal>
  `,
})
export class SystemSettingsComponent {
  private api = inject(AdminService);
  private toast = inject(ToastService);

  tabs: Tab[] = ['General', 'Departments', 'Audit log'];
  tab = signal<Tab>('General');
  loadError = signal('');
  saving = signal(false);

  settings: SystemSettings = { siteName: '', allowRegistration: true, defaultRole: 'STUDENT', sessionTimeoutMin: 60, passwordMinLength: 8, maxUploadMb: 10, maintenanceMode: false };
  settingsError = signal('');

  departments = signal<Department[]>([]);
  showDept = signal(false);
  editingDept = signal<Department | null>(null);
  deptForm = { name: '', head: '' };
  deptError = signal('');
  deptToDelete = signal<Department | null>(null);

  logs = signal<AuditLog[]>([]);
  logSearch = signal('');
  filteredLogs = computed(() => {
    const q = this.logSearch().trim().toLowerCase();
    return this.logs().filter(l => !q || `${l.actor} ${l.action} ${l.target}`.toLowerCase().includes(q)).slice(0, 100);
  });

  constructor() { this.loadAll(); }

  private async loadAll() {
    try {
      const [s, d, l] = await Promise.all([this.api.getSettings(), this.api.listDepartments(), this.api.listAuditLogs()]);
      this.settings = { ...s }; this.departments.set(d); this.logs.set(l);
    } catch { this.loadError.set('Could not load system settings. Check that the server is running and try again.'); }
  }

  async saveSettings() {
    const s = this.settings;
    this.settingsError.set('');
    if (!s.siteName.trim()) return this.settingsError.set('Enter a site name.');
    if (s.sessionTimeoutMin < 5) return this.settingsError.set('Session timeout must be at least 5 minutes.');
    if (s.passwordMinLength < 6) return this.settingsError.set('Minimum password length must be at least 6.');
    if (s.maxUploadMb < 1) return this.settingsError.set('Max upload must be at least 1 MB.');
    this.saving.set(true);
    try { await this.api.saveSettings({ ...s, siteName: s.siteName.trim() }); this.toast.show('Settings saved.'); await this.loadLogs(); }
    catch { this.settingsError.set('Could not save settings. Try again.'); }
    finally { this.saving.set(false); }
  }

  async loadLogs() {
    try { this.logs.set(await this.api.listAuditLogs()); } catch { this.toast.error('Could not refresh the audit log.'); }
  }

  openDept(d?: Department) {
    this.editingDept.set(d ?? null);
    this.deptForm = { name: d?.name ?? '', head: d?.head ?? '' };
    this.deptError.set(''); this.showDept.set(true);
  }
  async saveDept() {
    const name = this.deptForm.name.trim();
    if (name.length < 2) return this.deptError.set('Enter a department name.');
    const editing = this.editingDept();
    if (this.departments().some(d => d.id !== editing?.id && d.name.toLowerCase() === name.toLowerCase())) return this.deptError.set('This department already exists.');
    this.saving.set(true);
    try {
      const payload = { name, head: this.deptForm.head.trim() };
      if (editing) await this.api.updateDepartment(editing.id, payload); else await this.api.createDepartment(payload);
      this.showDept.set(false); this.toast.show(editing ? 'Department updated.' : 'Department added.');
      this.departments.set(await this.api.listDepartments()); await this.loadLogs();
    } catch { this.deptError.set('Could not save the department. Try again.'); }
    finally { this.saving.set(false); }
  }
  async confirmDeleteDept() {
    const d = this.deptToDelete(); if (!d) return;
    this.saving.set(true);
    try { await this.api.deleteDepartment(d); this.deptToDelete.set(null); this.toast.show('Department deleted.'); this.departments.set(await this.api.listDepartments()); await this.loadLogs(); }
    catch { this.toast.error('Could not delete the department.'); }
    finally { this.saving.set(false); }
  }
}
