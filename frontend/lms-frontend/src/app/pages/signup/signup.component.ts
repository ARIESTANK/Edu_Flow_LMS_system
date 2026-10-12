import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterRequest } from '../../core/auth.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="grid min-h-screen lg:grid-cols-2">
      <!-- Brand panel -->
      <section class="hidden flex-col justify-between bg-linear-to-br from-navy via-navy-800 to-primary-dark p-12 text-white lg:flex">
        <a routerLink="/" class="flex items-center gap-2">
          <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          <span class="text-xl font-bold">EduFlow</span>
        </a>

        <div>
          <h1 class="text-4xl font-bold leading-tight">Start learning<br>today</h1>
          <p class="mt-4 max-w-sm text-slate-300">
            Create your account to enroll in courses, submit assignments and track your grades.
          </p>
        </div>

        <p class="text-xs text-slate-400">Learn · Practice · Grow</p>
      </section>

      <!-- Form -->
      <section class="flex items-center justify-center bg-white p-6">
        <form class="w-full max-w-sm space-y-4" (ngSubmit)="submit()" novalidate>
          <a routerLink="/" class="mb-2 block text-lg font-bold text-primary lg:hidden">EduFlow</a>

          <div>
            <h2 class="text-2xl font-bold">Create your account</h2>
            <p class="mt-1 text-sm text-slate-500">It only takes a minute.</p>
          </div>

          @if (serverError()) {
            <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger" role="alert">{{ serverError() }}</p>
          }

          <div>
            <label for="fullName" class="mb-1 block text-sm font-medium">Full name</label>
            <input id="fullName" name="fullName" class="input" [(ngModel)]="fullName" autocomplete="name" placeholder="Kaung Khant Lin" />
            @if (submitted() && errors().fullName) { <p class="mt-1 text-xs text-danger">{{ errors().fullName }}</p> }
          </div>

          <div>
            <label for="email" class="mb-1 block text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" class="input" [(ngModel)]="email" autocomplete="email" placeholder="you@example.com" />
            @if (submitted() && errors().email) { <p class="mt-1 text-xs text-danger">{{ errors().email }}</p> }
          </div>

          <fieldset>
            <legend class="mb-1 block text-sm font-medium">I am a</legend>
            <div class="grid grid-cols-2 gap-3">
              @for (r of roles; track r.value) {
                <label class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition"
                       [class]="role === r.value ? 'border-primary bg-primary-light font-semibold text-primary' : 'border-slate-300 hover:bg-slate-50'">
                  <input type="radio" name="role" class="sr-only" [value]="r.value" [(ngModel)]="role" />
                  {{ r.label }}
                </label>
              }
            </div>
          </fieldset>

          <div>
            <label for="password" class="mb-1 block text-sm font-medium">Password</label>
            <div class="relative">
              <input id="password" name="password" class="input pr-16" [(ngModel)]="password"
                     [type]="showPassword() ? 'text' : 'password'" autocomplete="new-password"
                     placeholder="At least 8 characters" (ngModelChange)="pw.set($event)" />
              <button type="button" (click)="showPassword.set(!showPassword())"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-primary">
                {{ showPassword() ? 'Hide' : 'Show' }}
              </button>
            </div>
            @if (pw()) {
              <div class="mt-2 flex items-center gap-2">
                <div class="flex flex-1 gap-1" aria-hidden="true">
                  @for (i of [1, 2, 3]; track i) {
                    <span class="h-1 flex-1 rounded-full" [class]="i <= strength().level ? strength().color : 'bg-slate-200'"></span>
                  }
                </div>
                <span class="text-xs text-slate-500">{{ strength().label }}</span>
              </div>
            }
            @if (submitted() && errors().password) { <p class="mt-1 text-xs text-danger">{{ errors().password }}</p> }
          </div>

          <div>
            <label for="confirm" class="mb-1 block text-sm font-medium">Confirm password</label>
            <input id="confirm" name="confirm" class="input" [(ngModel)]="confirm"
                   [type]="showPassword() ? 'text' : 'password'" autocomplete="new-password" placeholder="Re-enter your password" />
            @if (submitted() && errors().confirm) { <p class="mt-1 text-xs text-danger">{{ errors().confirm }}</p> }
          </div>

          <div>
            <label class="flex items-start gap-2 text-sm">
              <input type="checkbox" name="terms" [(ngModel)]="terms" class="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary" />
              <span>I agree to the Terms of Use and Privacy Policy</span>
            </label>
            @if (submitted() && errors().terms) { <p class="mt-1 text-xs text-danger">{{ errors().terms }}</p> }
          </div>

          <button type="submit" class="btn-primary w-full" [disabled]="loading()">
            {{ loading() ? 'Creating account…' : 'Create account' }}
          </button>

          <p class="text-center text-sm text-slate-500">
            Already have an account?
            <a routerLink="/login" class="font-semibold text-primary hover:underline">Sign in</a>
          </p>
        </form>
      </section>
    </div>
  `,
})
export class Signup {
  private auth = inject(AuthService);
  private router = inject(Router);

  fullName = '';
  email = '';
  role: RegisterRequest['role'] = 'STUDENT';
  password = '';
  confirm = '';
  terms = false;

  roles: { value: RegisterRequest['role']; label: string }[] = [
    { value: 'STUDENT', label: 'Student' },
    { value: 'TEACHER', label: 'Teacher' },
  ];

  pw = signal('');
  showPassword = signal(false);
  submitted = signal(false);
  loading = signal(false);
  serverError = signal('');

  strength = computed(() => {
    const p = this.pw();
    let score = 0;
    if (p.length >= 8) score++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
    if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) score++;
    return [
      { level: 1, label: 'Weak', color: 'bg-danger' },
      { level: 1, label: 'Weak', color: 'bg-danger' },
      { level: 2, label: 'Okay', color: 'bg-warning' },
      { level: 3, label: 'Strong', color: 'bg-success' },
    ][score];
  });

  /** Field errors; refreshed each time the form is submitted. */
  errors = signal<Partial<Record<'fullName' | 'email' | 'password' | 'confirm' | 'terms', string>>>({});

  private validate() {
    const e: Record<string, string> = {};
    if (this.fullName.trim().length < 2) e['fullName'] = 'Enter your full name.';
    if (!EMAIL_RE.test(this.email.trim())) e['email'] = 'Enter a valid email address.';
    if (this.password.length < 8 || !/[A-Za-z]/.test(this.password) || !/\d/.test(this.password)) {
      e['password'] = 'Use at least 8 characters with a letter and a number.';
    }
    if (this.confirm !== this.password) e['confirm'] = 'Passwords do not match.';
    if (!this.terms) e['terms'] = 'Accept the terms to create an account.';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  async submit() {
    this.submitted.set(true);
    this.serverError.set('');
    if (!this.validate()) return;

    this.loading.set(true);
    try {
      await this.auth.register({
        username: this.fullName.trim(),
        email: this.email.trim().toLowerCase(),
        password: this.password,
        role: this.role,
      });
      // Sign the new user straight in
      // login() sends the user to their own area (/student/** or /admin/**)
      await this.auth.login(this.email.trim().toLowerCase(), this.password);
    } catch (e: any) {
      this.serverError.set(e?.message ?? 'Could not create your account. Try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
