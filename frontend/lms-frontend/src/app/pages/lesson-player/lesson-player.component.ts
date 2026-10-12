import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-lesson-player',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <nav class="mb-3 text-xs text-slate-500" aria-label="Breadcrumb">
      <a [routerLink]="['/student/courses', course.id]" class="hover:text-primary">{{ course.title }}</a>
      <span class="mx-1">›</span> Module 2: JavaScript <span class="mx-1">›</span>
      <span class="text-slate-800">Lesson {{ lesson().id }}: {{ lesson().title }}</span>
    </nav>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <h1 class="mb-3 text-lg font-bold">Lesson {{ lesson().id }}: {{ lesson().title }}</h1>

        <!-- Replace src with your Spring Boot video stream / S3 URL -->
        <video class="aspect-video w-full rounded-xl bg-black" controls preload="metadata" poster="">
          <source [src]="videoUrl" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <section class="card mt-4">
          <div class="flex gap-6 border-b border-slate-200 px-4">
            @for (t of tabs; track t) {
              <button (click)="tab.set(t)" class="border-b-2 py-3 text-sm font-medium"
                      [class]="tab() === t ? 'border-primary text-primary' : 'border-transparent text-slate-500'">{{ t }}</button>
            }
          </div>
          <div class="p-4">
            @switch (tab()) {
              @case ('Notes') {
                <textarea class="input h-28 resize-none" [(ngModel)]="note" placeholder="Add your notes here..."></textarea>
                <div class="mt-3 flex items-center justify-end gap-3">
                  @if (saved()) { <span class="text-xs text-success">Note saved</span> }
                  <button class="btn-primary" (click)="saveNote()" [disabled]="!note.trim()">Save Note</button>
                </div>
              }
              @case ('Resources') { <p class="text-sm text-slate-500">No resources attached to this lesson.</p> }
              @case ('Discussion') { <p class="text-sm text-slate-500">No comments yet. Ask the first question.</p> }
            }
          </div>
        </section>
      </div>

      <aside class="card h-fit p-4">
        <h2 class="font-semibold">Lesson Outline</h2>
        <ul class="mt-3 space-y-1">
          @for (l of data.outline; track l.id) {
            <li>
              <a [routerLink]="['/student/courses', course.id, 'lessons', l.id]"
                 class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                 [class]="l.id === lesson().id ? 'bg-primary-light font-semibold text-primary' : ''">
                <span class="flex h-5 w-5 items-center justify-center rounded-full border text-[10px]"
                      [class]="l.done ? 'border-success bg-success text-white' : 'border-slate-300'">{{ l.done ? '✓' : '' }}</span>
                {{ l.id }}. {{ l.title }}
              </a>
            </li>
          }
        </ul>
      </aside>
    </div>
  `,
})
export class LessonPlayerComponent {
  data = inject(DataService);
  private route = inject(ActivatedRoute);

  course = this.data.getCourse(Number(this.route.snapshot.paramMap.get('id')));
  lessonId = Number(this.route.snapshot.paramMap.get('lessonId') ?? 1);
  lesson = computed(() => this.data.outline.find(l => l.id === this.lessonId) ?? this.data.outline[0]);

  videoUrl = 'assets/videos/sample.mp4';
  tabs = ['Notes', 'Resources', 'Discussion'];
  tab = signal('Notes');
  note = '';
  saved = signal(false);

  saveNote() {
    // TODO: POST /api/lessons/{id}/notes
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }
}
