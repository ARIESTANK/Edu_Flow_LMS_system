import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { EnrollmentStatusService } from '../../core/enrollment-status.service';

/**
 * Wraps every student page except Profile.
 * Enrolled student  -> the page.
 * No enrollment     -> an empty state (the page itself still opens, there is just nothing in it).
 */
@Component({
  selector: 'app-student-gate',
  imports: [RouterOutlet, RouterLink],
  template: `
    @if (!status.loaded()) {
      <p class="py-16 text-center text-sm text-slate-500">Loading…</p>
    } @else if (status.enrolled()) {
      <router-outlet />
    } @else {
      <section class="mx-auto mt-10 max-w-md rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h1 class="text-lg font-semibold">Nothing here yet</h1>
        <p class="mt-2 text-sm text-slate-500">
          You are not in a class right now, so there are no courses, assignments, events or grades to show.
          They will appear here once an administrator enrolls you.
        </p>
        @if (status.error()) {
          <p class="mt-3 text-xs text-slate-400">We couldn't check your enrollment just now.
            <button type="button" class="font-medium text-primary hover:underline" (click)="status.refresh()">Try again</button></p>
        }
        <a routerLink="/student/profile" class="btn-secondary mt-5">Go to your profile</a>
      </section>
    }
  `,
})
export class StudentGateComponent {
  status = inject(EnrollmentStatusService);

  constructor() {
    if (!this.status.loaded()) this.status.refresh();
    // Re-check on every navigation, so an admin's change shows up without signing in again
    inject(Router).events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.status.refresh());
  }
}
