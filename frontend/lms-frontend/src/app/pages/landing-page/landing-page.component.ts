import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink],
  template: `
    <!-- Header -->
    <header class="sticky top-0 z-30 border-b border-white/10 bg-navy/95 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a routerLink="/" class="flex items-center gap-2 text-white">
          <svg class="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          <span class="text-lg font-bold">EduFlow</span>
        </a>

        <nav class="hidden items-center gap-7 text-sm text-slate-300 md:flex" aria-label="Main">
          @for (l of links; track l.id) {
            <button type="button" class="hover:text-white" (click)="go(l.id)">{{ l.label }}</button>
          }
        </nav>

        <div class="hidden items-center gap-3 md:flex">
          <a routerLink="/login" class="text-sm font-medium text-slate-200 hover:text-white">Sign in</a>
          <a routerLink="/login" class="btn-primary">Get started</a>
        </div>

        <button type="button" class="rounded-lg p-2 text-white hover:bg-white/10 md:hidden" (click)="menu.set(!menu())" aria-label="Toggle menu">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      @if (menu()) {
        <div class="space-y-1 border-t border-white/10 px-4 py-3 md:hidden">
          @for (l of links; track l.id) {
            <button type="button" class="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10" (click)="go(l.id)">{{ l.label }}</button>
          }
          <a routerLink="/login" class="btn-primary mt-2 w-full">Get started</a>
        </div>
      }
    </header>

    <main>
      <!-- Hero -->
      <section class="bg-linear-to-br from-navy via-navy-800 to-primary-dark text-white">
        <div class="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <h1 class="text-4xl font-bold leading-tight sm:text-5xl">Build skills.<br>Achieve goals.<br>Create your future.</h1>
            <p class="mt-5 max-w-md text-slate-300">
              EduFlow is a learning management system where students take courses, submit assignments and track grades, and teachers and admins manage it all in one place.
            </p>
            <div class="mt-8 flex flex-wrap gap-3">
              <a routerLink="/login" class="btn-primary px-6">Sign in to your account</a>
              <button type="button" class="btn-secondary border-white/20 bg-white/10 px-6 text-white hover:bg-white/20" (click)="go('overview')">See what's inside</button>
            </div>
            <p class="mt-6 text-xs text-slate-400">Angular · Tailwind CSS · Spring Boot · JWT</p>
          </div>

          <!-- Dashboard preview -->
          <div class="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl" aria-hidden="true">
            <div class="rounded-xl bg-slate-50 p-4 text-slate-800">
              <p class="text-sm font-semibold">Good morning, Kaung Khant Lin!</p>
              <div class="mt-3 grid grid-cols-4 gap-2 text-center">
                @for (s of preview; track s.label) {
                  <div class="rounded-lg bg-white p-2 shadow-sm">
                    <p class="text-base font-bold" [class]="s.tone">{{ s.value }}</p>
                    <p class="text-[10px] text-slate-500">{{ s.label }}</p>
                  </div>
                }
              </div>
              <div class="mt-3 space-y-2">
                @for (c of courses; track c.title) {
                  <div class="flex items-center gap-3 rounded-lg bg-white p-2 shadow-sm">
                    <span class="h-9 w-12 rounded-md bg-linear-to-br" [class]="c.gradient"></span>
                    <span class="flex-1">
                      <span class="block text-xs font-semibold">{{ c.title }}</span>
                      <span class="mt-1 block h-1.5 rounded-full bg-slate-100"><span class="block h-full rounded-full bg-primary" [style.width.%]="c.progress"></span></span>
                    </span>
                    <span class="text-[10px] text-slate-500">{{ c.progress }}%</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Feature strip -->
      <section id="features" class="bg-white">
        <div class="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
          @for (f of features; track f.title) {
            <div>
              <h2 class="font-semibold">{{ f.title }}</h2>
              <p class="mt-1 text-sm text-slate-500">{{ f.text }}</p>
            </div>
          }
        </div>
      </section>

      <!-- Project overview -->
      <section id="overview" class="bg-slate-50">
        <div class="mx-auto max-w-6xl px-4 py-16">
          <h2 class="text-2xl font-bold">What's inside EduFlow</h2>
          <p class="mt-2 max-w-xl text-sm text-slate-500">Nine screens cover the full learning journey, from signing in to checking your final grade. All of them work on phones too.</p>

          <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (p of pages; track p.title) {
              <div class="card p-5">
                <h3 class="font-semibold">{{ p.title }}</h3>
                <p class="mt-1 text-sm text-slate-500">{{ p.text }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Roles -->
      <section id="roles" class="bg-white">
        <div class="mx-auto max-w-6xl px-4 py-16">
          <h2 class="text-2xl font-bold">One platform, three roles</h2>
          <div class="mt-8 grid gap-4 md:grid-cols-3">
            @for (r of roles; track r.name) {
              <div class="rounded-xl border p-5" [class]="r.box">
                <h3 class="text-lg font-semibold" [class]="r.title">{{ r.name }}</h3>
                <ul class="mt-3 space-y-2 text-sm text-slate-600">
                  @for (i of r.items; track i) {
                    <li class="flex gap-2"><span class="font-bold" [class]="r.title">✓</span>{{ i }}</li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="bg-navy text-white">
        <div class="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center">
          <h2 class="text-2xl font-bold">Your learning journey, simplified.</h2>
          <p class="max-w-md text-sm text-slate-300">Sign in to pick up your courses where you left off.</p>
          <a routerLink="/login" class="btn-primary px-8">Sign in</a>
        </div>
      </section>
    </main>

    <footer class="bg-navy-800 py-6 text-center text-xs text-slate-400">
      © {{ year }} EduFlow LMS · Learn · Practice · Grow
    </footer>
  `,
})
export class LandingPage {
  menu = signal(false);
  year = new Date().getFullYear();

  links = [
    { id: 'features', label: 'Features' },
    { id: 'overview', label: 'Overview' },
    { id: 'roles', label: 'Roles' },
  ];

  preview = [
    { label: 'Enrolled', value: '5', tone: 'text-primary' },
    { label: 'Completed', value: '2', tone: 'text-secondary' },
    { label: 'Pending', value: '3', tone: 'text-success' },
    { label: 'Avg. grade', value: '89%', tone: 'text-warning' },
  ];

  courses = [
    { title: 'Web Development', progress: 75, gradient: 'from-blue-600 to-indigo-900' },
    { title: 'Database Systems', progress: 40, gradient: 'from-sky-500 to-blue-900' },
    { title: 'English for IT', progress: 50, gradient: 'from-teal-500 to-cyan-900' },
  ];

  features = [
    { title: 'Modern UI/UX', text: 'Clean, intuitive screens that stay out of your way.' },
    { title: 'Secure & scalable', text: 'JWT authentication on a Spring Boot backend.' },
    { title: 'Flexible learning', text: 'Study anytime, anywhere, on any device.' },
    { title: 'For everyone', text: 'Built for students, teachers and administrators.' },
  ];

  pages = [
    { title: 'Login', text: 'Sign in with email or a Google or Microsoft account.' },
    { title: 'Student dashboard', text: 'Course progress, upcoming deadlines and recent activity at a glance.' },
    { title: 'Browse courses', text: 'Filter by category and enroll in featured courses.' },
    { title: 'Course detail', text: 'Overview, lessons, assignments, discussions and the full syllabus.' },
    { title: 'Lesson player', text: 'Watch lessons, follow the outline and keep your own notes.' },
    { title: 'Assignments', text: 'Drag and drop your files and see your submission status.' },
    { title: 'Calendar', text: 'Quizzes, due dates and live classes in one monthly view.' },
    { title: 'Grades & progress', text: 'Scores per course and your overall progress.' },
    { title: 'Profile & settings', text: 'Update your details, password and notifications.' },
  ];

  roles = [
    { name: 'Student', box: 'border-emerald-200 bg-emerald-50/50', title: 'text-success',
      items: ['View courses', 'Enroll in courses', 'Submit assignments', 'View grades', 'Track progress'] },
    { name: 'Teacher', box: 'border-blue-200 bg-blue-50/50', title: 'text-primary',
      items: ['Manage courses', 'Create assignments', 'Grade students', 'View analytics', 'Post announcements'] },
    { name: 'Admin', box: 'border-violet-200 bg-violet-50/50', title: 'text-secondary',
      items: ['User management', 'Course management', 'System settings', 'Reports & logs', 'Department management'] },
  ];

  go(id: string) {
    this.menu.set(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
