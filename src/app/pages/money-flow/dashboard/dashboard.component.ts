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
  loanData: any = [
    {
      installmentId   :1,
      installmentName :'Laptop Loan',
      monthlyAmount   :'5,000.00',
      durationMonths  : 12,
      paidMonths      : 3,
      remainingMonths:   9 },
      {
      installmentId   :2,
      installmentName :'Home Loan',
      monthlyAmount   :'30,000.00',
      durationMonths  : 240,
      paidMonths      : 12,
      remainingMonths:   228 }
  ];

  // Current User
  userId: any = null;

  // Loadeer
  isgridloading: boolean = false;

  constructor(
    public commonService: CommonService,
    private notification: NotificationService
  ) { }
  
  ngOnInit() {
    this.userId = this.commonService.GetUserData().userId;
    this.loadSummary();
    this.getAccountBalances();
    this.getLoans();
    this.getTransactions();
  }

  loadSummary() {
    this.commonService.getData(this.COMMON_API + "SummarySelect?id=" + this.userId).subscribe({
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

    let obj = <Transactions>{};
    obj.UserId = this.userId;
    obj.PageSize = 5;

    this.commonService.postData(this.Transactions_API + "SelectAll", obj).subscribe({
      next: (data: any) => {
        this.isgridloading = false;
        this.transactionData = data.map((item: any) => ({
          ...item,
          amount: Number(item.amount).toFixed(2)
        }));
      }
    });
  }
}
