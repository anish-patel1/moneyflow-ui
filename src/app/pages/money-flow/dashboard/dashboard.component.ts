import { Component } from '@angular/core';
import { API } from '../apis/api-endpoints';
import { Transactions } from '../models/transactions.model';
import { CommonService } from '../common/service/common.service';
import { CommonModule } from '@angular/common';
import { CommonRefModule } from '../common/module/common-ref.module';
import { NotificationService } from '../common/service/notification.service';
import { DashboardSummary } from '../models/dashboardSummary.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CommonRefModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  // API
  COMMON_API = API.Dashboard;
  Transactions_API = API.Transactions;

  // Select All Data
  summaryData: DashboardSummary | null = null;
  transactionData: any = [];

  // Current User
  userId: any = null;

  // Loadeer
  isgridloading: boolean = false;

  constructor(
    public commonService: CommonService,
    private notification: NotificationService,
    // private confirmationService: ConfirmationService
  ) { }
  
  ngOnInit() {
    this.userId = this.commonService.GetUserData().userId;
    this.loadSummary();
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

        console.log(this.transactionData);
      }
    });
  }
}
