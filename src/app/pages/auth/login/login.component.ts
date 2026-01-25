import { Component } from '@angular/core';
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
import { CommonModule } from '@angular/common';
import { AppFooter } from '../../../layout/component/app.footer';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator],
  templateUrl: './login.component.html',
  styles: ``
})
export class LoginComponent {
  // API
  COMMON_API = Auth_API.Auth_API;

  // Log in Items
  username: string = '';
  password: string = '';

  // Loader
  btnLoading: boolean = false;

  // Version
  version = localStorage.getItem("version");

  constructor(
      private router: Router,
      private notification: NotificationService,
      public commonService: CommonService,
      private authService: AuthService
  ) {}

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
