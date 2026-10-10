import { Component } from '@angular/core';
import { API } from '../apis/api-endpoints';
import { Transactions } from '../models/transactions.model';
import { CommonService } from '../common/service/common.service';
import { CommonModule } from '@angular/common';
import { CommonRefModule } from '../common/module/common-ref.module';
import { NotificationService } from '../common/service/notification.service';
import { DashboardSummary } from '../models/dashboardSummary.model';
import { Accounts } from '../models/accounts.model';
import { Installments } from '../models/installments.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CommonRefModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  // API
  COMMON_API = API.Dashboard;
  Accounts_API = API.Accounts;
  Transactions_API = API.Transactions;
  Loans_API = API.Installments;

  // Select All Data
  summaryData: DashboardSummary | null = null;
  accountData: any = [];
  transactionData: any = [];
  loanData: any = [];

  // Current User
  userId: any = null;

  // Period / Date Navigation
  maxDate: Date = new Date();
  selectedPeriodDate: Date = new Date();
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1; // 1-12

  get isCurrentMonth(): boolean {
    const now = new Date();
    return this.selectedYear === now.getFullYear() && this.selectedMonth === (now.getMonth() + 1);
  }

  get displayMonthLabel(): string {
    const d = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // Loader
  isgridloading: boolean = false;

  constructor(
    public commonService: CommonService,
    private notification: NotificationService
  ) { }
  
  ngOnInit() {
    this.userId = this.commonService.GetUserData().userId;
    this.selectedPeriodDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    this.loadSummary();
    this.getAccountBalances();
    this.getLoans();
    this.getTransactions();
  }

  prevMonth(): void {
    if (this.selectedMonth === 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.selectedPeriodDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    this.onPeriodChange();
  }

  nextMonth(): void {
    if (this.isCurrentMonth) return;
    if (this.selectedMonth === 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.selectedPeriodDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    this.onPeriodChange();
  }

  onPeriodDateSelect(date: Date): void {
    if (!date) return;
    this.selectedYear = date.getFullYear();
    this.selectedMonth = date.getMonth() + 1;
    this.selectedPeriodDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    this.onPeriodChange();
  }

  resetToCurrentMonth(): void {
    const now = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth() + 1;
    this.selectedPeriodDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    this.onPeriodChange();
  }

  onPeriodChange(): void {
    this.loadSummary();
    this.getTransactions();
  }

  loadSummary() {
    this.summaryData = null;
    const url = `${this.COMMON_API}SummarySelect?id=${this.userId}&year=${this.selectedYear}&month=${this.selectedMonth}`;
    this.commonService.getData(url).subscribe({
      next: (response: any) => {
        if (!response || response.length === 0) {
          this.notification.showToast('warning', 'Data not found');
          return;
        }

        this.summaryData = response[0];
      },
      error: (err) => {
        this.notification.showToast("error", err.message);
      },
    });
  }

  getAccountBalances() {
    this.accountData = [];
    this.isgridloading = true;
    
    let obj = <Accounts>{};
    obj.UserId = this.userId;

    this.commonService.postData(this.Accounts_API + "SelectAll", obj).subscribe({
      next: (data: any) => {
        this.isgridloading = false;
        this.accountData = data;
      }
    });
  }

  getLoans() {
    this.loanData = [];
    this.isgridloading = true;
    
    let obj = <Installments>{};
    obj.UserId = this.userId;
    obj.Status = 'A';

    this.commonService.postData(this.Loans_API + "SelectAll", obj).subscribe({
      next: (data: any) => {
        this.isgridloading = false;
        this.loanData = data;
      }
    });
  }

  getTransactions() {
    this.transactionData = [];
    this.isgridloading = true;

    const lastDay = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    const monthStr = String(this.selectedMonth).padStart(2, '0');
    const fromDate = `${this.selectedYear}-${monthStr}-01`;
    const toDate = `${this.selectedYear}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

    let obj = <Transactions>{};
    obj.UserId = this.userId;
    obj.PageSize = 5;
    obj.FromDate = fromDate;
    obj.ToDate = toDate;

    this.commonService.postData(this.Transactions_API + "SelectAll", obj).subscribe({
      next: (data: any) => {
        this.isgridloading = false;
        this.transactionData = (data || []).map((item: any) => ({
          ...item,
          amount: Number(item.amount).toFixed(2)
        }));
      },
      error: (err) => {
        this.isgridloading = false;
        this.notification.showToast("error", err.message);
      }
    });
  }
}
