import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { IconComponent } from './icon.component';
import { ToastService } from '../core/toast.service';
import { EnrollmentStatusService } from '../core/enrollment-status.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, IconComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-100">
      @if (open()) {
        <div class="fixed inset-0 z-30 bg-black/50 lg:hidden" (click)="open.set(false)"></div>
      }

      <!-- Sidebar -->
      <aside class="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-navy text-slate-300 transition-transform lg:static lg:translate-x-0"
             [class.-translate-x-full]="!open()">
        <div class="flex items-center gap-2 px-5 py-5">
          <app-icon name="cap" cls="h-7 w-7 text-primary" />
          <span class="text-lg font-bold text-white">EduFlow</span>
        </div>

        <nav class="flex-1 space-y-1 px-3">
          @for (item of nav(); track item.path) {
            <a [routerLink]="item.path" routerLinkActive="bg-primary! text-white" (click)="open.set(false)"
               class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-navy-700">
              <app-icon [name]="item.icon" />
              {{ item.label }}
            </a>
          }
        </nav>

        <button (click)="auth.logout()"
                class="m-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-navy-700">
          <app-icon name="logout" /> Log out
        </button>
      </aside>

      <!-- Main -->
      <div class="flex min-w-0 flex-1 flex-col">
        <header class="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
          <button class="rounded-lg p-2 hover:bg-slate-100 lg:hidden" (click)="open.set(true)" aria-label="Open menu">
            <app-icon name="menu" />
          </button>

          <div class="relative hidden max-w-md flex-1 sm:block">
            <app-icon name="search" cls="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input class="input pl-9" placeholder="Search courses, instructors..." />
          </div>

          <div class="ml-auto flex items-center gap-4">
            <button class="relative rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications">
              <app-icon name="bell" />
              <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger"></span>
            </button>
            <a [routerLink]="profileLink()" class="flex items-center gap-2">
              <span class="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                {{ initials() }}
              </span>
              <span class="hidden text-left leading-tight md:block">
                <span class="block text-sm font-semibold">{{ auth.user()?.name }}</span>
                <span class="block text-xs capitalize text-slate-500">{{ auth.user()?.role?.toLowerCase() }}</span>
              </span>
            </a>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-4 lg:p-6">
          <router-outlet />
        </main>

        <div class="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" role="status" aria-live="polite">
          @for (t of toast.items(); track t.id) {
            <div class="pointer-events-auto flex items-start justify-between gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg"
                 [class]="t.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'">
              <span>{{ t.message }}</span>
              <button type="button" class="opacity-80 hover:opacity-100" aria-label="Dismiss" (click)="toast.dismiss(t.id)">✕</button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ShellComponent {
  auth = inject(AuthService);
  toast = inject(ToastService);
  private enrollment = inject(EnrollmentStatusService);

  constructor() {
    if (this.auth.hasRole('STUDENT')) this.enrollment.refresh();
  }
  open = signal(false);

  private studentNav = [
    { label: 'Dashboard', path: '/student/dashboard', icon: 'home' },
    { label: 'My Courses', path: '/student/my-courses', icon: 'book' },
    { label: 'Calendar', path: '/student/calendar', icon: 'calendar' },
    { label: 'Assignments', path: '/student/assignments', icon: 'doc' },
    { label: 'Grades', path: '/student/grades', icon: 'chart' },
    { label: 'Profile', path: '/student/profile', icon: 'user' },
  ];

  private adminNav = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: 'home' },
    { label: 'Manage Users', path: '/admin/users', icon: 'users' },
    { label: 'Manage Courses', path: '/admin/courses', icon: 'book' },
    { label: 'Classes & Students', path: '/admin/classes', icon: 'grid' },
    { label: 'Teachers & Courses', path: '/admin/teaching', icon: 'cap' },
    { label: 'Student Performance', path: '/admin/performance', icon: 'chart' },
    { label: 'System Settings', path: '/admin/system', icon: 'cog' },
    { label: 'Profile', path: '/admin/profile', icon: 'user' },
  ];

  profileLink = computed(() => (this.auth.hasRole('ADMIN') ? '/admin/profile' : '/student/profile'));
  /** A student with no enrollment only gets the dashboard (empty state) and Profile */
  private limitedStudentNav = [
    { label: 'Dashboard', path: '/student/dashboard', icon: 'home' },
    { label: 'Profile', path: '/student/profile', icon: 'user' },
  ];

  nav = computed(() => {
    if (this.auth.hasRole('ADMIN')) return this.adminNav;
    if (this.auth.hasRole('STUDENT') && !this.enrollment.enrolled()) return this.limitedStudentNav;
    return this.studentNav;
  });

  initials() {
    return (this.auth.user()?.name ?? '?').split(' ').map(s => s[0]).slice(0, 2).join('');
  }
}
