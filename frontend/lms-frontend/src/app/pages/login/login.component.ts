import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { IconComponent } from '../../layout/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="grid min-h-screen lg:grid-cols-2">
      <!-- Brand panel -->
      <section class="relative hidden flex-col justify-between bg-linear-to-br from-navy via-navy-800 to-primary-dark p-12 text-white lg:flex">
        <div class="flex items-center gap-2">
          <app-icon name="cap" cls="h-8 w-8" />
          <span class="text-xl font-bold">EduFlow</span>
        </div>
        <div>
          <h1 class="text-4xl font-bold leading-tight">Better Learning<br>Brighter Future</h1>
          <p class="mt-4 max-w-sm text-slate-300">Access your courses, track your progress, and achieve your goals with EduFlow.</p>
        </div>
        <p class="text-xs text-slate-400">LMS · Learn · Practice · Grow</p>
      </section>

      <!-- Form -->
      <section class="flex items-center justify-center bg-white p-6">
        <form class="w-full max-w-sm space-y-4" (ngSubmit)="submit()">
          <div>
            <h2 class="text-2xl font-bold">Welcome Back!</h2>
            <p class="mt-1 text-sm text-slate-500">Sign in to your account</p>
          </div>

          @if (error()) {
            <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger" role="alert">{{ error() }}</p>
          }

          <label class="block">
            <span class="sr-only">Email or username</span>
            <input class="input" name="email" [(ngModel)]="email" placeholder="Email or username" autocomplete="username" required />
          </label>

          <label class="relative block">
            <span class="sr-only">Password</span>
            <input class="input pr-16" name="password" [(ngModel)]="password" [type]="show() ? 'text' : 'password'"
                   placeholder="Password" autocomplete="current-password" required />
            <button type="button" (click)="show.set(!show())"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-primary">
              {{ show() ? 'Hide' : 'Show' }}
            </button>
          </label>

          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2">
              <input type="checkbox" name="remember" [(ngModel)]="remember" class="rounded border-slate-300 text-primary focus:ring-primary" />
              Remember me
            </label>
            <a href="#" class="font-medium text-primary hover:underline">Forgot password?</a>
          </div>

          <button class="btn-primary w-full" type="submit" [disabled]="loading()">
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>

          <div class="flex items-center gap-3 text-xs text-slate-400">
            <span class="h-px flex-1 bg-slate-200"></span>or continue with<span class="h-px flex-1 bg-slate-200"></span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button type="button" class="btn-secondary">Google</button>
            <button type="button" class="btn-secondary">Microsoft</button>
          </div>

          <p class="text-center text-sm text-slate-500">
            Don't have an account? <a href="/signup" class="font-semibold text-primary hover:underline">Sign Up</a>
          </p>
        </form>
      </section>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = ''; password = ''; remember = false;
  show = signal(false); loading = signal(false); error = signal('');

  async submit() {
    this.error.set(''); this.loading.set(true);
    try {
      await this.auth.login(this.email.trim(), this.password);


    } catch (e: any) {
      this.error.set(e.message ?? 'Sign in failed. Check your details and try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
