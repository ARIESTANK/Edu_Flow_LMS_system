import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h1 class="text-xl font-bold">Profile</h1>

    <section class="card mt-4">
      <div class="flex gap-6 overflow-x-auto border-b border-slate-200 px-5">
        @for (t of tabs; track t) {
          <button (click)="tab.set(t)" class="whitespace-nowrap border-b-2 py-3 text-sm font-medium"
                  [class]="tab() === t ? 'border-primary text-primary' : 'border-transparent text-slate-500'">{{ t }}</button>
        }
      </div>

      <div class="p-5">
        @switch (tab()) {
          @case ('Personal Info') {
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <span class="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">KK</span>
                <div>
                  <p class="font-semibold">{{ form.fullName }}</p>
                  <p class="text-xs text-slate-500">Student · S-170001<br>{{ form.email }}</p>
                </div>
              </div>
              <button class="btn-primary" (click)="editing.set(!editing())">{{ editing() ? 'Cancel' : 'Edit Profile' }}</button>
            </div>

            <form class="mt-6 grid gap-4 sm:grid-cols-2" (ngSubmit)="save()">
              <label class="block text-sm"><span class="text-xs text-slate-500">Full Name</span>
                <input class="input mt-1" name="fullName" [(ngModel)]="form.fullName" [disabled]="!editing()" /></label>
              <label class="block text-sm"><span class="text-xs text-slate-500">Department</span>
                <input class="input mt-1" name="department" [(ngModel)]="form.department" [disabled]="!editing()" /></label>
              <label class="block text-sm"><span class="text-xs text-slate-500">Email Address</span>
                <input class="input mt-1" type="email" name="email" [(ngModel)]="form.email" [disabled]="!editing()" /></label>
              <label class="block text-sm"><span class="text-xs text-slate-500">Joined Date</span>
                <input class="input mt-1" name="joined" [(ngModel)]="form.joined" disabled /></label>
              <label class="block text-sm"><span class="text-xs text-slate-500">Phone</span>
                <input class="input mt-1" name="phone" [(ngModel)]="form.phone" [disabled]="!editing()" /></label>

              @if (editing()) {
                <div class="flex items-end justify-end gap-2 sm:col-span-2">
                  <button type="submit" class="btn-primary">Save changes</button>
                </div>
              }
            </form>
            @if (saved()) { <p class="mt-3 text-sm text-success">Profile updated.</p> }
          }

          @case ('Change Password') {
            <form class="max-w-sm space-y-4" (ngSubmit)="changePassword()">
              <input class="input" type="password" name="cur" [(ngModel)]="pw.current" placeholder="Current password" autocomplete="current-password" />
              <input class="input" type="password" name="nw" [(ngModel)]="pw.next" placeholder="New password (min 8 characters)" autocomplete="new-password" />
              <input class="input" type="password" name="cf" [(ngModel)]="pw.confirm" placeholder="Confirm new password" autocomplete="new-password" />
              @if (pwError()) { <p class="text-sm text-danger" role="alert">{{ pwError() }}</p> }
              @if (pwDone()) { <p class="text-sm text-success" role="status">Password updated.</p> }
              <button class="btn-primary" type="submit" [disabled]="pwSaving()">{{ pwSaving() ? 'Updating…' : 'Update password' }}</button>
            </form>
          }

          @case ('Notification') {
            <ul class="max-w-md divide-y divide-slate-100">
              @for (n of notifications; track n.label) {
                <li class="flex items-center justify-between py-3 text-sm">
                  {{ n.label }}
                  <input type="checkbox" [(ngModel)]="n.on" class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                </li>
              }
            </ul>
          }
        }
      </div>
    </section>
  `,
})
export class ProfileComponent {
  private auth = inject(AuthService);
  tabs = ['Personal Info', 'Change Password', 'Notification'];
  tab = signal('Personal Info');
  editing = signal(false);
  saved = signal(false);
  pwError = signal('');
  pwDone = signal(false);
  pwSaving = signal(false);

  form = {
    fullName: this.auth.user()?.name ?? '',
    email: this.auth.user()?.email ?? '',
    department: 'Computer Science',
    joined: '2026-06-01',
    phone: '',
  };
  pw = { current: '', next: '', confirm: '' };
  notifications = [
    { label: 'Assignment deadlines', on: true },
    { label: 'Course announcements', on: true },
    { label: 'Grade updates', on: false },
  ];

  save() {
    // TODO: PUT /api/users/me
    this.editing.set(false); this.saved.set(true);
  }

  async changePassword() {
    this.pwError.set(''); this.pwDone.set(false);
    if (!this.pw.current) return this.pwError.set('Enter your current password.');
    if (this.pw.next.length < 8 || !/[A-Za-z]/.test(this.pw.next) || !/\d/.test(this.pw.next)) {
      return this.pwError.set('New password must be at least 8 characters with a letter and a number.');
    }
    if (this.pw.next !== this.pw.confirm) return this.pwError.set('Passwords do not match.');

    this.pwSaving.set(true);
    try {
      await this.auth.changePassword(this.pw.current, this.pw.next);
      this.pw = { current: '', next: '', confirm: '' };
      this.pwDone.set(true);
    } catch (e: any) {
      this.pwError.set(e?.message ?? 'Could not change the password. Try again.');
    } finally {
      this.pwSaving.set(false);
    }
  }
}
