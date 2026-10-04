import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../money-flow/common/service/notification.service';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FormsModule } from '@angular/forms';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';
import { CommonService } from '../../money-flow/common/service/common.service';
import { Auth_API } from '../auth-api';
import { AsyncPipe, CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ColdStartService } from '../services/cold-start.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LayoutService } from '../../../layout/service/layout.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, AsyncPipe, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
  // API
  COMMON_API = Auth_API.Auth_API;

  // Log in Items
  username: string = '';
  password: string = '';

  // Loader
  btnLoading: boolean = false;

  // Version
  version = localStorage.getItem("version");

  /** Emits true while the cold-start retry loop is active. */
  isWaking$!: Observable<boolean>;
  private destroy$ = new Subject<void>();

  constructor(
      private router: Router,
      private notification: NotificationService,
      public commonService: CommonService,
      private authService: AuthService,
      public coldStartService: ColdStartService,
      public layoutService: LayoutService
  ) {}

  ngOnInit(): void {
    this.isWaking$ = this.coldStartService.isWaking$;

    // Once waking completes (1st API call succeeds), refresh version from localStorage
    this.isWaking$.pipe(takeUntil(this.destroy$)).subscribe((isWaking) => {
      if (!isWaking) {
        setTimeout(() => {
          this.version = localStorage.getItem("version");
        }, 50);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ======================================================
  // Log In
  // ======================================================
  login() {
    if (!this.username || !this.password) return;

    this.btnLoading = true;

    const userCredential = {
      username: this.username,
      password: this.password
    };

    this.commonService.postData(this.COMMON_API + "Authentication", userCredential).subscribe({
      next: (data: any) => {
        this.btnLoading = false;

        if (data.status === "success") {
          if (data.token && data.user) {
            // Save Auth Data
            this.authService.saveAuthData(data.token, data.user);
            // Redirect to main page according to user type
            if (data.user.userType === 'S') this.router.navigate(['/admin/version']);
            else this.router.navigate(['/']);
          } else this.notification.showToast("error", "Invalid response from server.");
        } else this.notification.showToast(data.status, data.message);
      },
      error: (err) => {
        this.btnLoading = false;
        const errorMsg = err.error?.message || "Something went wrong! Please try again.";
        this.notification.showToast("error", errorMsg);
      }
    });
  }
}
