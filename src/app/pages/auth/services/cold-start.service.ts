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
  /**
   * Initialized to true on app start so the waking loader in login
   * is immediately active until the first API call (e.g. GetLatestVersion) returns success.
   */
  private readonly _isWaking$ = new BehaviorSubject<boolean>(true);
  private _isServerAwake = false;

  /** Observable that emits `true` while retry attempts or initial wake-up are in progress. */
  readonly isWaking$: Observable<boolean> = this._isWaking$
    .asObservable()
    .pipe(distinctUntilChanged());

  /** Called by the interceptor to update the waking state. */
  setWaking(value: boolean): void {
    this._isWaking$.next(value);
  }

  /** Marks the server as confirmed awake and dismisses the waking loader. */
  markServerAwake(): void {
    this._isServerAwake = true;
    this._isWaking$.next(false);
  }

  /** Whether the server has already been confirmed awake in this session. */
  get isServerAwake(): boolean {
    return this._isServerAwake;
  }

  /** Snapshot of the current waking state (useful in templates via async pipe). */
  get isWaking(): boolean {
    return this._isWaking$.getValue();
  }
}
