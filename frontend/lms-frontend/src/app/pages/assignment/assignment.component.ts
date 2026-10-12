import { Component, signal } from '@angular/core';
import { IconComponent } from '../../layout/icon.component';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ['zip', 'rar', 'pdf', 'doc', 'docx'];

@Component({
  selector: 'app-assignment',
  standalone: true,
  imports: [IconComponent],
  template: `
    <nav class="mb-3 text-xs text-slate-500">Assignments <span class="mx-1">›</span> <span class="text-slate-800">Assignment 2</span></nav>

    <div class="grid gap-4 lg:grid-cols-3">
      <section class="card p-5 lg:col-span-2">
        <h1 class="text-lg font-bold">Assignment 2: Build a Simple To-Do App</h1>
        <p class="mt-2 text-sm"><span class="badge-success">Open</span>
          <span class="ml-2 text-slate-500">Due: 2026-10-15 11:59 PM</span></p>
        <p class="mt-4 text-sm text-slate-600">
          Create a simple to-do list application using Angular. The application should allow users to add, delete, and mark tasks as completed.
        </p>

        <h2 class="mt-6 font-semibold">Submission</h2>

        <div class="mt-2 rounded-xl border-2 border-dashed p-8 text-center transition"
             [class]="dragging() ? 'border-primary bg-primary-light' : 'border-slate-300'"
             (dragover)="$event.preventDefault(); dragging.set(true)"
             (dragleave)="dragging.set(false)"
             (drop)="onDrop($event)">
          <app-icon name="upload" cls="mx-auto h-10 w-10 text-primary" />
          <p class="mt-2 text-sm">Drag and drop your files here <span class="text-slate-400">or</span></p>
          <label class="cursor-pointer text-sm font-semibold text-primary hover:underline">
            Browse Files
            <input type="file" class="sr-only" multiple accept=".zip,.rar,.pdf,.doc,.docx" (change)="onPick($event)" />
          </label>
          <p class="mt-2 text-xs text-slate-400">Supported formats: .zip, .rar, .pdf, .doc, .docx (Max 10MB)</p>
        </div>

        @if (error()) { <p class="mt-2 text-sm text-danger" role="alert">{{ error() }}</p> }

        @if (files().length) {
          <ul class="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
            @for (f of files(); track f.name; let i = $index) {
              <li class="flex items-center justify-between px-3 py-2 text-sm">
                <span>{{ f.name }} <span class="text-xs text-slate-400">({{ (f.size / 1024).toFixed(0) }} KB)</span></span>
                <button class="text-xs text-danger hover:underline" (click)="remove(i)">Remove</button>
              </li>
            }
          </ul>
        }
      </section>

      <aside class="space-y-4">
        <section class="card p-5">
          <h2 class="font-semibold">Submission Status</h2>
          <p class="mt-3">
            <span [class]="submitted() ? 'badge-success' : 'badge-error'">{{ submitted() ? 'Submitted' : 'Not Submitted' }}</span>
          </p>
          <p class="mt-3 text-xs text-slate-500">Grade</p>
          <p class="text-sm">–</p>
          <button class="btn-primary mt-4 w-full" [disabled]="!files().length || submitted()" (click)="submit()">
            Submit Assignment
          </button>
        </section>
        <section class="card p-5">
          <h2 class="font-semibold">Your Submissions</h2>
          <p class="mt-2 text-sm text-slate-500">{{ submitted() ? 'Submitted just now.' : 'No submissions yet.' }}</p>
        </section>
      </aside>
    </div>
  `,
})
export class AssignmentComponent {
  files = signal<File[]>([]);
  dragging = signal(false);
  error = signal('');
  submitted = signal(false);

  onDrop(e: DragEvent) {
    e.preventDefault(); this.dragging.set(false);
    this.add(Array.from(e.dataTransfer?.files ?? []));
  }
  onPick(e: Event) {
    const input = e.target as HTMLInputElement;
    this.add(Array.from(input.files ?? [])); input.value = '';
  }

  private add(incoming: File[]) {
    this.error.set('');
    const ok: File[] = [];
    for (const f of incoming) {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
      if (!ALLOWED.includes(ext)) { this.error.set(`${f.name}: unsupported format. Use .zip, .rar, .pdf, .doc or .docx.`); continue; }
      if (f.size > MAX_BYTES) { this.error.set(`${f.name} is larger than 10MB. Compress it and try again.`); continue; }
      ok.push(f);
    }
    this.files.update(cur => [...cur, ...ok]);
  }

  remove(i: number) { this.files.update(cur => cur.filter((_, idx) => idx !== i)); }

  submit() {
    // TODO: POST multipart/form-data to /api/assignments/2/submissions
    const form = new FormData();
    this.files().forEach(f => form.append('files', f));
    this.submitted.set(true);
  }
}
