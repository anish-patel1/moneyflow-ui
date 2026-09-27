import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/**
 * Global service that tracks whether the app is currently waiting for the
 * Render free-tier API to wake up after a period of inactivity.
 *
 * Components subscribe to `isWaking$` to show or hide the
 * "Waking up the server…" UI message.
 */
@Injectable({
  providedIn: 'root'
})
export class ColdStartService {
  private readonly _isWaking$ = new BehaviorSubject<boolean>(false);

  /** Observable that emits `true` while retry attempts are in progress. */
  readonly isWaking$: Observable<boolean> = this._isWaking$
    .asObservable()
    .pipe(distinctUntilChanged());

  /** Called by the interceptor to update the waking state. */
  setWaking(value: boolean): void {
    this._isWaking$.next(value);
  }

  /** Snapshot of the current waking state (useful in templates via async pipe). */
  get isWaking(): boolean {
    return this._isWaking$.getValue();
  }
}
