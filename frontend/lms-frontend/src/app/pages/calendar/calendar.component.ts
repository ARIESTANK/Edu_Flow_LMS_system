import { Component, computed, inject, signal } from '@angular/core';
import { DataService } from '../../core/data.service';

interface CalendarEvent {
  title: string;
  date: string;
  sub: string;
  time: string;
  type: string;
}

interface CalendarCell {
  day: number | null;
  today: boolean;
  events: CalendarEvent[];
}

interface CalEvent { date: string; title: string; sub: string; time: string; type: string; }

@Component({
  selector: 'app-calendar',
  standalone: true,
  template: `
    <div class="grid gap-4 lg:grid-cols-3">
      <section class="card p-4 lg:col-span-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h1 class="text-lg font-bold">{{ title() }}</h1>

            <button
              class="rounded p-1 hover:bg-slate-100"
              (click)="shift(-1)"
              aria-label="Previous month"
            >
              ‹
            </button>

            <button
              class="rounded p-1 hover:bg-slate-100"
              (click)="shift(1)"
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div class="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
            <span class="rounded-md bg-primary px-3 py-1 text-white">
              Month
            </span>

            <span class="px-3 py-1 text-slate-500">
              Week
            </span>

            <span class="px-3 py-1 text-slate-500">
              Day
            </span>
          </div>
        </div>

        <div
          class="mt-4 grid grid-cols-7 border-l border-t border-slate-200 text-center text-xs"
        >
          @for (d of weekdays; track d) {
            <div
              class="border-b border-r border-slate-200 bg-slate-50 py-2 font-medium text-slate-500"
            >
              {{ d }}
            </div>
          }

          @for (c of cells(); track $index) {
            <div
              class="min-h-16 border-b border-r border-slate-200 p-1 text-left sm:min-h-20"
              [class.bg-slate-50]="!c.day"
            >
              @if (c.day) {
                <span
                  class="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs"
                  [class]="
                    c.today
                      ? 'bg-primary font-semibold text-white'
                      : 'text-slate-600'
                  "
                >
                  {{ c.day }}
                </span>

                @for (e of c.events; track e.title) {
                  <span
                    class="mt-0.5 block truncate rounded px-1 text-[10px] font-medium"
                    [class]="color(e.type)"
                  >
                    {{ e.title }}
                  </span>
                }
              }
            </div>
          }
        </div>
      </section>

      <aside class="card h-fit p-4">
        <h2 class="font-semibold">Upcoming Events</h2>

        <ul class="mt-3 space-y-3">
          @for (e of data.events; track e.title) {
            <li class="flex gap-3">
              <span
                class="flex w-12 shrink-0 flex-col items-center rounded-lg bg-primary-light py-1 text-primary"
              >
                <span class="text-[10px]">OCT</span>
                <span class="text-base font-bold">
                  {{ e.date.slice(8) }}
                </span>
              </span>

              <span class="text-sm">
                <span class="font-semibold">{{ e.title }}</span>
                <br />

                <span class="text-xs text-slate-500">
                  {{ e.sub }}
                  <br />
                  {{ e.time }}
                </span>
              </span>
            </li>
          }
        </ul>
      </aside>
    </div>
  `,
})
export class CalendarComponent {
  data = inject(DataService);

  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  cursor = signal(new Date(2026, 9, 1));

  title = computed(() =>
    this.cursor().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  );

  cells = computed<CalendarCell[]>(() => {
    const y = this.cursor().getFullYear();
    const m = this.cursor().getMonth();

    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();

    const now = new Date();

    const out: CalendarCell[] = [];

    // Empty cells before the first day of the month
    for (let i = 0; i < first; i++) {
      out.push({
        day: null,
        today: false,
        events: [],
      });
    }

    // Actual days
    for (let d = 1; d <= days; d++) {
      const iso =
        `${y}-${String(m + 1).padStart(2, '0')}-` +
        `${String(d).padStart(2, '0')}`;

      out.push({
        day: d,

        today:
          now.getFullYear() === y &&
          now.getMonth() === m &&
          now.getDate() === d,

        events: this.data.events.filter(
          (e) => e.date === iso
        ),
      });
    }

    return out;
  });

  shift(n: number) {
    this.cursor.update(
      (c) => new Date(c.getFullYear(), c.getMonth() + n, 1)
    );
  }

  color(type: string) {
    return type === 'quiz'
      ? 'bg-blue-100 text-blue-700'
      : type === 'assignment'
        ? 'bg-red-100 text-red-700'
        : 'bg-emerald-100 text-emerald-700';
  }
}
