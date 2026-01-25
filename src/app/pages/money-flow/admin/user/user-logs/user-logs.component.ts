import { Component } from '@angular/core';
import { Admin_API } from '../../admin-api';
import { CommonService } from '../../../common/service/common.service';
import { UserLog } from '../../model/user.model';
import { CommonModule } from '@angular/common';
import { CommonRefModule } from '../../../common/module/common-ref.module';

@Component({
  selector: 'app-user-logs',
  imports: [CommonModule, CommonRefModule],
  templateUrl: './user-logs.component.html',
  styleUrl: './user-logs.component.scss'
})
export class UserLogsComponent {
  // API
  COMMON_API = Admin_API.User_API;

  // Select All Data
  selectAllData: any = [];

  // Date Filter
  selectedDateRange: Date[] = [];

  // Loader
  isgridloading: boolean = false;

  // Current User
  userId: any = null;

  // For Breadcrumb
  breadcrumbHome = { icon: 'pi pi-user', label: 'User', routerLink: '/admin/user' };
  breadcrumbItems = [{ label: 'Logs' }];

  constructor(
    public commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.commonService.route.queryParams.subscribe((params) => {
      if (params["userId"]) this.userId = params["userId"];
    });

    this.setDefaultDateRange();
    this.selectAll();
  }

  // ======================================================
  // Date Range Filter
  // ======================================================
  setDefaultDateRange() {
    const today = new Date();
    const oneMonthBefore = new Date();
    oneMonthBefore.setMonth(today.getMonth() - 1);

    this.selectedDateRange = [oneMonthBefore, today];
  }

  onDateRangeSelected() {
    if (this.selectedDateRange && this.selectedDateRange.length === 2) {
      this.filterByDateRange(this.selectedDateRange[0], this.selectedDateRange[1]);
    }
  }

  filterByDateRange(startDate: Date, endDate: Date) {
    const fromDate = startDate ? this.commonService.formatDate(startDate) : null;
    const toDate = endDate ? this.commonService.formatDate(endDate) : null;

    if (fromDate && toDate) this.selectAll(fromDate, toDate);
  }

  // ======================================================
  // Select All
  // ======================================================
  selectAll(fromDate?: any, toDate?: any) {
    this.selectAllData = [];
    this.isgridloading = true;
    
    let obj = <UserLog>{};
    obj.UserId = this.userId;
    obj.FromDate = fromDate;
    obj.ToDate = toDate;

    this.commonService.postData(this.COMMON_API + "Log_SelectAll", obj).subscribe({
      next: (data: any) => {
        this.isgridloading = false;
        this.selectAllData = data;
      }
    });
  }

  // ======================================================
  // Log Activity - Tags
  // ======================================================
  // getActivityTypeLabel(type: string): string {
  //   switch (type) {
  //     case 'LOGIN_SUCCESS': return 'Login Success';
  //     case 'LOGOUT_SUCCESS': return 'Logout Success';
  //     case 'FAIL_WRONG_PASSWORD': return 'Wrong Password';
  //     case 'FAIL_INVALID_USER': return 'Invalid User';
  //     case 'FAIL_ACCOUNT_LOCKED': return 'Account Locked';
  //     case 'FAIL_INACTIVE_ACCOUNT': return 'Inactive Account';
  //     default: return '-';
  //   }
  // }

  // getActivityTypeSeverity(type: string): string {
  //   switch (type) {
  //     case 'LOGIN_SUCCESS':
  //     case 'LOGOUT_SUCCESS':
  //       return 'success';
  //     case 'FAIL_WRONG_PASSWORD':
  //     case 'FAIL_INVALID_USER':
  //       return 'warn';
  //     case 'FAIL_ACCOUNT_LOCKED':
  //     case 'FAIL_INACTIVE_ACCOUNT':
  //       return 'danger';
  //     default:
  //       return 'info';
  //   }
  // }
  getActivityTypeLabel(type: string): string {
  switch (type) {
    case 'LOGIN_SUCCESS': return 'Login Success';
    case 'LOGOUT_SUCCESS': return 'Logout Success';
    case 'FAIL_WRONG_PASSWORD': return 'Wrong Password';
    case 'FAIL_INVALID_USER': return 'Invalid User';
    case 'FAIL_ACCOUNT_LOCKED': return 'Account Locked';
    case 'FAIL_INACTIVE_ACCOUNT': return 'Inactive Account';
    default: return '-';
  }
}

getActivityTypeClass(type: string): string {
  switch (type) {
    case 'LOGIN_SUCCESS': return 'login-success';
    case 'LOGOUT_SUCCESS': return 'logout-success';
    case 'FAIL_WRONG_PASSWORD': return 'fail-warning';
    case 'FAIL_INVALID_USER': return 'fail-warning';
    case 'FAIL_ACCOUNT_LOCKED': return 'fail-danger';
    case 'FAIL_INACTIVE_ACCOUNT': return 'fail-danger';
    default: return 'info-default';
  }
}


}
