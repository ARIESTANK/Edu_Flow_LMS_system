import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; message: string; type: 'success' | 'error'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  items = signal<Toast[]>([]);

  show(message: string, type: Toast['type'] = 'success') {
    const id = this.nextId++;
    this.items.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
  error(message: string) { this.show(message, 'error'); }
  dismiss(id: number) { this.items.update(list => list.filter(t => t.id !== id)); }
}
