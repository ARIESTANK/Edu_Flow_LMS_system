import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/admin.service';
import { StudentPerf } from '../../core/admin.models';
import { histogram, mean, median, stdev } from '../../core/stats';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../layout/icon.component';

type SortKey = 'name' | 'grade' | 'completion' | 'attendance' | 'trend';
type Risk = 'At risk' | 'Watch' | 'On track';
interface Row extends StudentPerf { grade: number; risk: Risk; }

const PASS_MARK = 60;
const EDGES = [0, 50, 60, 70, 80, 90, 101];
const BUCKETS = ['<50', '50–59', '60–69', '70–79', '80–89', '90+'];
const BUCKET_COLORS = ['bg-danger', 'bg-warning', 'bg-sky-400', 'bg-primary', 'bg-success', 'bg-emerald-700'];

function riskOf(grade: number, completion: number, attendance: number): Risk {
  if (grade < PASS_MARK || completion < 40 || attendance < 70) return 'At risk';
  if (grade < 70 || completion < 60) return 'Watch';
  return 'On track';
}

@Component({
  selector: 'app-student-performance',
  imports: [FormsModule, IconComponent],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold">Student performance</h1>
        <p class="text-sm text-slate-500">Pass mark is {{ passMark }}%. A student is at risk when the grade is below it, completion is under 40%, or attendance is under 70%.</p>
      </div>
      <button class="btn-secondary gap-2" (click)="exportCsv()" [disabled]="!rows().length"><app-icon name="download" cls="h-4 w-4" /> Export CSV</button>
    </div>

    @if (loadError()) { <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger" role="alert">{{ loadError() }}</p> }

    <div class="mt-4 flex flex-wrap gap-3">
      <select class="input w-auto" [ngModel]="course()" (ngModelChange)="course.set($event)" aria-label="Filter by course">
        <option value="ALL">All courses (average)</option>
        @for (c of courseNames(); track c) { <option [value]="c">{{ c }}</option> }
      </select>
      <select class="input w-auto" [ngModel]="riskFilter()" (ngModelChange)="riskFilter.set($event)" aria-label="Filter by risk">
        <option value="ALL">Any status</option><option value="At risk">At risk</option><option value="Watch">Watch</option><option value="On track">On track</option>
      </select>
      <input class="input max-w-xs" placeholder="Search student..." [ngModel]="search()" (ngModelChange)="search.set($event)" aria-label="Search students" />
    </div>

    <!-- Summary -->
    <div class="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-6">
      @for (s of summary(); track s.label) {
        <div class="card p-4"><p class="text-2xl font-bold" [class]="s.tone">{{ s.value }}</p><p class="text-xs text-slate-500">{{ s.label }}</p></div>
      }
    </div>

    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      <!-- Distribution -->
      <section class="card p-5">
        <h2 class="font-semibold">Grade distribution</h2>
        <p class="text-xs text-slate-500">Number of students per grade band</p>
        <div class="mt-4 flex h-44 items-end gap-3" role="img" [attr.aria-label]="'Grade distribution: ' + distributionLabel()">
          @for (n of distribution(); track $index) {
            <div class="flex flex-1 flex-col items-center justify-end gap-1">
              <span class="text-xs font-medium">{{ n }}</span>
              <span class="w-full rounded-t-md" [class]="bucketColors[$index]" [style.height.%]="barHeight(n)"></span>
              <span class="text-[11px] text-slate-500">{{ buckets[$index] }}</span>
            </div>
          }
        </div>
      </section>

      <!-- Per-course averages -->
      <section class="card p-5">
        <h2 class="font-semibold">Average grade by course</h2>
        <p class="text-xs text-slate-500">All students, pass mark marked</p>
        <ul class="mt-4 space-y-4">
          @for (c of courseAverages(); track c.course) {
            <li>
              <div class="flex justify-between text-sm"><span>{{ c.course }}</span><span class="font-medium">{{ c.avg }}%</span></div>
              <div class="relative mt-1 h-2.5 rounded-full bg-slate-100">
                <span class="block h-full rounded-full" [class]="c.avg >= passMark ? 'bg-primary' : 'bg-danger'" [style.width.%]="c.avg"></span>
                <span class="absolute -top-1 h-4.5 w-px bg-slate-400" [style.left.%]="passMark"></span>
              </div>
            </li>
          }
        </ul>
      </section>
    </div>

    <!-- Table -->
    <section class="card mt-4 overflow-x-auto">
      <table class="w-full min-w-[46rem] text-left text-sm">
        <thead class="border-b border-slate-200 text-xs text-slate-500">
          <tr>
            @for (h of headers; track h.key) {
              <th class="px-4 py-3 font-medium" [attr.aria-sort]="sortKey() === h.key ? (sortDir() === 'asc' ? 'ascending' : 'descending') : 'none'">
                <button type="button" class="inline-flex items-center gap-1 hover:text-slate-800" (click)="sortBy(h.key)">
                  {{ h.label }} @if (sortKey() === h.key) { <span aria-hidden="true">{{ sortDir() === 'asc' ? '↑' : '↓' }}</span> }
                </button>
              </th>
            }
            <th class="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          @for (r of rows(); track r.id) {
            <tr class="cursor-pointer hover:bg-slate-50" (click)="toggle(r.id)" [attr.aria-expanded]="expanded() === r.id">
              <td class="px-4 py-3 font-medium">{{ r.name }}<span class="block text-xs font-normal text-slate-500">{{ r.email }}</span></td>
              <td class="px-4 py-3 font-semibold">{{ r.grade }}%</td>
              <td class="px-4 py-3">
                <span class="flex items-center gap-2"><span class="h-1.5 w-24 rounded-full bg-slate-100"><span class="block h-full rounded-full bg-primary" [style.width.%]="r.completion"></span></span><span class="text-xs text-slate-500">{{ r.completion }}%</span></span>
              </td>
              <td class="px-4 py-3">{{ r.attendance }}%</td>
              <td class="px-4 py-3" [class]="r.trend > 0 ? 'text-success' : r.trend < 0 ? 'text-danger' : 'text-slate-500'">{{ r.trend > 0 ? '▲ +' + r.trend : r.trend < 0 ? '▼ ' + r.trend : '–' }}</td>
              <td class="px-4 py-3"><span [class]="riskBadge(r.risk)">{{ r.risk }}</span></td>
            </tr>
            @if (expanded() === r.id) {
              <tr class="bg-slate-50">
                <td colspan="6" class="px-4 py-3">
                  <div class="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                    @for (c of r.courses; track c.course) { <span>{{ c.course }}: <strong [class]="c.grade < passMark ? 'text-danger' : ''">{{ c.grade }}%</strong></span> }
                  </div>
                </td>
              </tr>
            }
          } @empty {
            <tr><td colspan="6" class="px-4 py-10 text-center text-slate-500">{{ loading() ? 'Loading…' : 'No students match your filters.' }}</td></tr>
          }
        </tbody>
      </table>
    </section>
  `,
})
export class StudentPerformanceComponent {
  private api = inject(AdminService);
  private toast = inject(ToastService);

  readonly passMark = PASS_MARK;
  readonly buckets = BUCKETS;
  readonly bucketColors = BUCKET_COLORS;
  headers: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Student' }, { key: 'grade', label: 'Grade' }, { key: 'completion', label: 'Completion' },
    { key: 'attendance', label: 'Attendance' }, { key: 'trend', label: 'Trend' },
  ];

  students = signal<StudentPerf[]>([]);
  loading = signal(true);
  loadError = signal('');
  course = signal('ALL');
  riskFilter = signal<'ALL' | Risk>('ALL');
  search = signal('');
  sortKey = signal<SortKey>('grade');
  sortDir = signal<'asc' | 'desc'>('asc');
  expanded = signal<number | null>(null);

  courseNames = computed(() => [...new Set(this.students().flatMap(s => s.courses.map(c => c.course)))]);

  /** Every student with the grade for the chosen course (or overall average) */
  private base = computed<Row[]>(() => {
    const c = this.course();
    const out: Row[] = [];
    for (const s of this.students()) {
      const grade = c === 'ALL' ? s.avgGrade : s.courses.find(x => x.course === c)?.grade;
      if (grade === undefined) continue;
      out.push({ ...s, grade, risk: riskOf(grade, s.completion, s.attendance) });
    }
    return out;
  });

  rows = computed(() => {
    const q = this.search().trim().toLowerCase(), r = this.riskFilter();
    const key = this.sortKey(), dir = this.sortDir() === 'asc' ? 1 : -1;
    return this.base()
      .filter(x => (r === 'ALL' || x.risk === r) && (!q || x.name.toLowerCase().includes(q) || x.email.toLowerCase().includes(q)))
      .sort((a, b) => (key === 'name' ? a.name.localeCompare(b.name) : a[key] - b[key]) * dir);
  });

  private grades = computed(() => this.rows().map(r => r.grade));

  summary = computed(() => {
    const g = this.grades(), n = g.length;
    const pass = n ? Math.round((g.filter(x => x >= PASS_MARK).length / n) * 100) : 0;
    return [
      { label: 'Students', value: n, tone: 'text-slate-800' },
      { label: 'Average grade', value: n ? mean(g).toFixed(1) + '%' : '–', tone: 'text-primary' },
      { label: 'Median', value: n ? median(g).toFixed(1) + '%' : '–', tone: 'text-primary' },
      { label: 'Std. deviation', value: n ? stdev(g).toFixed(1) : '–', tone: 'text-slate-800' },
      { label: 'Pass rate', value: n ? pass + '%' : '–', tone: 'text-success' },
      { label: 'At risk', value: this.rows().filter(r => r.risk === 'At risk').length, tone: 'text-danger' },
    ];
  });

  distribution = computed(() => histogram(this.grades(), EDGES));
  distributionLabel = computed(() => this.distribution().map((n, i) => `${BUCKETS[i]}: ${n}`).join(', '));
  private maxBucket = computed(() => Math.max(1, ...this.distribution()));
  barHeight(n: number) { return Math.max(n ? 4 : 1, (n / this.maxBucket()) * 80); }

  courseAverages = computed(() => this.courseNames().map(course => ({
    course,
    avg: Math.round(mean(this.students().map(s => s.courses.find(c => c.course === course)?.grade).filter((g): g is number => g !== undefined))),
  })));

  constructor() { this.load(); }

  private async load() {
    try { this.students.set(await this.api.studentPerformance()); }
    catch { this.loadError.set('Could not load performance data. Check that the server is running and try again.'); }
    finally { this.loading.set(false); }
  }

  sortBy(k: SortKey) {
    if (this.sortKey() === k) this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    else { this.sortKey.set(k); this.sortDir.set(k === 'name' ? 'asc' : 'asc'); }
  }
  toggle(id: number) { this.expanded.set(this.expanded() === id ? null : id); }
  riskBadge(r: Risk) { return r === 'At risk' ? 'badge-error' : r === 'Watch' ? 'badge-warning' : 'badge-success'; }

  exportCsv() {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [['Name', 'Email', 'Grade', 'Completion %', 'Attendance %', 'Trend', 'Status'].join(',')]
      .concat(this.rows().map(r => [r.name, r.email, r.grade, r.completion, r.attendance, r.trend, r.risk].map(esc).join(',')));
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'student-performance.csv'; a.click();
    URL.revokeObjectURL(url);
    this.toast.show('CSV exported.');
  }
}
