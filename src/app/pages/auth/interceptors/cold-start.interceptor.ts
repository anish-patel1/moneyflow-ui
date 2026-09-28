import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ColdStartService } from '../services/cold-start.service';

/** Status codes that indicate the server is still waking up (Render cold-start). */
const COLD_START_STATUSES = new Set([0, 502, 503, 504]);

/** Maximum number of retry attempts before giving up. */
const MAX_RETRIES = 5;

/** Delay between retries in milliseconds (7 seconds). */
const RETRY_DELAY_MS = 7_000;

/**
 * Intercepts HTTP requests and automatically retries when a Render cold-start
 * error is detected (status 0, 502, 503, 504). While retrying, it signals
 * the ColdStartService so the UI can show a "Waking up the server…" message.
 */
export const coldStartInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const coldStartService = inject(ColdStartService);

  // Signal the UI immediately when the very first request goes out.
  coldStartService.setWaking(true);

  /** Recursive helper that tracks how many attempts remain. */
  function attempt(retriesLeft: number): Observable<any> {
    return next(req).pipe(
      // On success, clear the waking state
      tap({ next: () => coldStartService.setWaking(false) }),
      catchError((error: HttpErrorResponse) => {
        const isColdStart = COLD_START_STATUSES.has(error.status);

        // Not a cold-start error, or we've exhausted retries — propagate.
        if (!isColdStart || retriesLeft <= 0) {
          coldStartService.setWaking(false);
          return throwError(() => error);
        }

        // Signal the UI that the server is waking up.
        coldStartService.setWaking(true);

        // Wait, then retry with one fewer attempt remaining.
        return timer(RETRY_DELAY_MS).pipe(
          switchMap(() => attempt(retriesLeft - 1))
        );
      })
    );
  }

  return attempt(MAX_RETRIES);
};
