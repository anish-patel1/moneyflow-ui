import { Component } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';
import { CommonModule } from '@angular/common';
import { CommonRefModule } from '../../money-flow/common/module/common-ref.module';
import { CommonService } from '../../money-flow/common/service/common.service';
import { Admin_API } from '../../money-flow/admin/admin-api';
import { NotificationService } from '../../money-flow/common/service/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, CommonRefModule, AppFloatingConfigurator],
  templateUrl: './register.component.html',
  styles: ``
})
export class RegisterComponent {
  // API
  User_API = Admin_API.User_API;

  // Form Items
  registerForm!: FormGroup;
  submitted = false;

  constructor(
    public commonService: CommonService,
    private notification: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.commonService.formBuilder.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // ======================================================
  // Custom Validator: Password & Confirm Password
  // ======================================================
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  // ======================================================
  // Form Details Getter
  // ======================================================
  get f() {
    return this.registerForm.controls;
  }

  // ======================================================
  // Register User
  // ======================================================
  registerUser() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    const userData = {
      username: this.f['username'].value,
      userDisplayName: this.f['fullName'].value,
      password: this.f['password'].value
    };

    this.commonService.postData(this.User_API + "Insert", userData).subscribe({
      next: (data: any) => {
        if (data.status === "success") {
          this.notification.showToast("success", data.message);
          this.router.navigate(["/auth/login"]);
        } else if (data.status === "exists") {
          this.notification.showToast("warn", data.message);
        }
      },
      error: (err) => {
        const errorMsg = err.error?.message || "Something went wrong!";
        this.notification.showToast("error", errorMsg);
      }
    });
  }
}
