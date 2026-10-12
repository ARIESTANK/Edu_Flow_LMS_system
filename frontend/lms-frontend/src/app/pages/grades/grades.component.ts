import { Component, computed, inject, signal } from '@angular/core';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-grades',
  standalone: true,
  template: `
    <div class="flex flex-wrap items-start justify-between gap-4">
      <h1 class="text-xl font-bold">Grades & Progress</h1>

      <div class="card flex items-center gap-4 px-5 py-3">
        <svg viewBox="0 0 36 36" class="h-16 w-16 -rotate-90" aria-hidden="true">
          <circle cx="18" cy="18" r="15.9" fill="none" class="stroke-slate-100" stroke-width="3.5" />
          <circle cx="18" cy="18" r="15.9" fill="none" class="stroke-success" stroke-width="3.5"
                  stroke-linecap="round" [attr.stroke-dasharray]="overall() + ' 100'" />
        </svg>
        <div>
          <p class="text-xs text-slate-500">Overall Progress</p>
          <p class="text-2xl font-bold">{{ overall() }}%</p>
        </div>
      </div>
    </div>

    <div class="mt-4 flex gap-2">
      @for (t of ['Courses', 'Summary']; track t) {
        <button (click)="tab.set(t)" class="rounded-lg px-4 py-1.5 text-sm font-medium"
                [class]="tab() === t ? 'bg-primary text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'">{{ t }}</button>
      }
    </div>

    <section class="card mt-4 overflow-x-auto">
      @if (tab() === 'Courses') {
        <table class="w-full min-w-[34rem] text-left text-sm">
          <thead class="border-b border-slate-200 text-xs text-slate-500">
            <tr><th class="px-4 py-3 font-medium">Course</th><th class="px-4 py-3 font-medium">Grade</th>
                <th class="px-4 py-3 font-medium">Progress</th><th class="px-4 py-3 font-medium">Status</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (g of data.grades; track g.course) {
              <tr>
                <td class="px-4 py-3 font-medium">{{ g.course }}</td>
                <td class="px-4 py-3">{{ g.score }} / 100</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="h-1.5 w-32 rounded-full bg-slate-100"><div class="h-full rounded-full bg-primary" [style.width.%]="g.score"></div></div>
                    <span class="text-xs text-slate-500">{{ g.score }}%</span>
                  </div>
                </td>
                <td class="px-4 py-3"><span class="badge-success">{{ g.status }}</span></td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <div class="grid gap-4 p-5 sm:grid-cols-3">
          <div><p class="text-xs text-slate-500">Average grade</p><p class="text-2xl font-bold">{{ average() }}%</p></div>
          <div><p class="text-xs text-slate-500">Highest</p><p class="text-2xl font-bold">{{ highest().score }}%</p><p class="text-xs text-slate-500">{{ highest().course }}</p></div>
          <div><p class="text-xs text-slate-500">Courses tracked</p><p class="text-2xl font-bold">{{ data.grades.length }}</p></div>
        </div>
      }
    </section>
  `,
})
export class GradesComponent {
  data = inject(DataService);
  tab = signal('Courses');
  average = computed(() => Math.round(this.data.grades.reduce((s, g) => s + g.score, 0) / this.data.grades.length));
  highest = computed(() => this.data.grades.reduce((a, b) => (b.score > a.score ? b : a)));
  overall = computed(() => 68); // TODO: from API (completed lessons / total lessons)
}
