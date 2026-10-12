import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  host: { '(document:keydown.escape)': 'onEscape()' },
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" [attr.aria-label]="title()">
        <div class="absolute inset-0 bg-black/50" (click)="closed.emit()"></div>
        <div class="relative max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white shadow-xl" [class]="size()">
          <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 class="font-semibold">{{ title() }}</h2>
            <button type="button" class="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label="Close" (click)="closed.emit()">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="p-5"><ng-content /></div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  open = input(false);
  title = input('');
  size = input('max-w-lg');
  closed = output<void>();

  onEscape() { if (this.open()) this.closed.emit(); }
}
