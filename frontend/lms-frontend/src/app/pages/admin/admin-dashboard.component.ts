import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, FEATURES } from '../../core/admin.service';
import { AdminUser, Overview, SystemSettings } from '../../core/admin.models';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, DatePipe],
  template: `
    <h1 class="text-xl font-bold">Admin dashboard</h1>
    <p class="text-sm text-slate-500">Welcome back, {{ auth.user()?.name }}. Here is how the system looks today.</p>

    @if (error()) {
      <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger" role="alert">{{ error() }}</p>
    }

    @if (overview(); as o) {
      <div class="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        @for (c of cards(); track c.label) {
          <div class="card p-4">
            <p class="text-2xl font-bold" [class]="c.tone">{{ c.value }}</p>
            <p class="text-xs text-slate-500">{{ c.label }}</p>
          </div>
        }
      </div>

      <div class="mt-6 grid gap-4 lg:grid-cols-3">
        <section class="card p-5 lg:col-span-2">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">Recent sign-ups</h2>
            <a routerLink="/admin/users" class="text-sm font-medium text-primary hover:underline">Manage users</a>
          </div>
          <ul class="mt-3 divide-y divide-slate-100">
            @for (u of recent(); track u.id) {
              <li class="flex items-center justify-between py-3 text-sm">
                <span class="flex items-center gap-3">
                  <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary">{{ (u.username || '?')[0].toUpperCase() }}</span>
                  <span>{{ u.username }}<span class="block text-xs text-slate-500">{{ u.email }}</span></span>
                </span>
                <span class="text-right text-xs text-slate-500">
                  <span class="block capitalize">{{ u.role.toLowerCase() }}</span>{{ u.createdAt | date: 'mediumDate' }}
                </span>
              </li>
            } @empty {
              <li class="py-6 text-center text-sm text-slate-500">No users yet.</li>
            }
          </ul>
        </section>

        <div class="space-y-4">
          <section class="card p-5">
            <h2 class="font-semibold">Users by role</h2>
            <div class="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
              <span class="bg-success" [style.width.%]="pct(o.students, o.totalUsers)"></span>
              <span class="bg-primary" [style.width.%]="pct(o.teachers, o.totalUsers)"></span>
              <span class="bg-secondary" [style.width.%]="pct(o.admins, o.totalUsers)"></span>
            </div>
            <ul class="mt-3 space-y-1 text-sm">
              <li class="flex justify-between"><span><span class="mr-2 inline-block h-2 w-2 rounded-full bg-success"></span>Students</span>{{ o.students }}</li>
              <li class="flex justify-between"><span><span class="mr-2 inline-block h-2 w-2 rounded-full bg-primary"></span>Teachers</span>{{ o.teachers }}</li>
              <li class="flex justify-between"><span><span class="mr-2 inline-block h-2 w-2 rounded-full bg-secondary"></span>Admins</span>{{ o.admins }}</li>
            </ul>
          </section>

          @if (settings(); as s) {
            <section class="card p-5 text-sm">
              <h2 class="font-semibold">System status</h2>
              <ul class="mt-3 space-y-2">
                <li class="flex justify-between">Registration <span [class]="s.allowRegistration ? 'badge-success' : 'badge-warning'">{{ s.allowRegistration ? 'Open' : 'Closed' }}</span></li>
                <li class="flex justify-between">Maintenance mode <span [class]="s.maintenanceMode ? 'badge-error' : 'badge-success'">{{ s.maintenanceMode ? 'On' : 'Off' }}</span></li>
                <li class="flex justify-between">Session timeout <span class="text-slate-500">{{ s.sessionTimeoutMin }} min</span></li>
              </ul>
              <a routerLink="/admin/system" class="mt-4 inline-block font-medium text-primary hover:underline">Open settings</a>
            </section>
          }
        </div>
      </div>

      <div class="mt-6 grid gap-4 sm:grid-cols-3">
        <a routerLink="/admin/performance" class="card p-5 transition hover:shadow-md"><h3 class="font-semibold">Student performance</h3><p class="mt-1 text-sm text-slate-500">Grades, completion and at-risk students.</p></a>
        <a routerLink="/admin/courses" class="card p-5 transition hover:shadow-md"><h3 class="font-semibold">Courses</h3><p class="mt-1 text-sm text-slate-500">Create, publish and archive courses.</p></a>
        <a routerLink="/admin/system" class="card p-5 transition hover:shadow-md"><h3 class="font-semibold">Audit log</h3><p class="mt-1 text-sm text-slate-500">See who changed what, and when.</p></a>
      </div>
    } @else if (!error()) {
      <p class="mt-8 text-sm text-slate-500">Loading…</p>
    }
  `,
})
export class AdminDashboardComponent {
  private api = inject(AdminService);
  auth = inject(AuthService);

  overview = signal<Overview | null>(null);
  settings = signal<SystemSettings | null>(null);
  users = signal<AdminUser[]>([]);
  error = signal('');

  recent = computed(() => [...this.users()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5));

  cards = computed(() => {
    const o = this.overview();
    if (!o) return [];
    const all = [
      { label: 'Total users', value: o.totalUsers, tone: 'text-slate-800' },
      { label: 'Students', value: o.students, tone: 'text-success' },
      { label: 'Teachers', value: o.teachers, tone: 'text-primary' },
      { label: 'Courses', value: o.courses, tone: 'text-secondary' },
      { label: 'Active today', value: o.activeToday, tone: 'text-warning' },
      { label: 'New this week', value: o.newThisWeek, tone: 'text-slate-800' },
    ];
    // "Active today" and "New this week" need login/created dates, which the backend does not store yet
    return FEATURES.userMeta ? all : all.slice(0, 4);
  });

  constructor() { this.load(); }

  pct(n: number, total: number) { return total ? (n / total) * 100 : 0; }

  private async load() {
    try {
      const [o, s, u] = await Promise.all([this.api.getOverview(), this.api.getSettings(), this.api.listUsers()]);
      this.overview.set(o); this.settings.set(s); this.users.set(u);
    } catch {
      this.error.set('Could not load the dashboard. Check that the server is running and try again.');
    }
  }
}
