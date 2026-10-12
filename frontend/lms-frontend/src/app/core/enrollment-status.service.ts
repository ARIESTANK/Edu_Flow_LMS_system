import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from './api';

export interface MyEnrollment {
  enrolled: boolean;
  classId: number | null;
  classCode: string | null;
  gradeNo: number | null;
}

/** Whether the signed-in student is in a class. Without an enrollment the student pages show nothing. */
@Injectable({ providedIn: 'root' })
export class EnrollmentStatusService {
  private http = inject(HttpClient);

  private _state = signal<MyEnrollment | null>(null);
  readonly info = this._state.asReadonly();
  readonly loaded = computed(() => this._state() !== null);
  readonly enrolled = computed(() => this._state()?.enrolled === true);
  readonly error = signal(false);

  /** GET /api/me/enrollment. Fails closed: if the check fails the student sees the empty state. */
  async refresh(): Promise<void> {
    try {
      this._state.set(await firstValueFrom(this.http.get<MyEnrollment>(`${API_URL}/me/enrollment`)));
      this.error.set(false);
    } catch {
      this.error.set(true);
      if (this._state() === null) this._state.set({ enrolled: false, classId: null, classCode: null, gradeNo: null });
    }
  }

  /** Call on login and logout so the next user never sees the previous user's state. */
  reset(): void {
    this._state.set(null);
    this.error.set(false);
  }
}
