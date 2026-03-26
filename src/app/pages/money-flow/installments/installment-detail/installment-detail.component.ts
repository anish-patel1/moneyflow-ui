import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CommonRefModule } from '../../common/module/common-ref.module';
import { API } from '../../apis/api-endpoints';
import { CommonService } from '../../common/service/common.service';
import { NotificationService } from '../../common/service/notification.service';
import { Transactions } from '../../models/transactions.model';

@Component({
  selector: 'app-installment-detail',
  imports: [CommonModule, CommonRefModule],
  templateUrl: './installment-detail.component.html',
  styleUrl: './installment-detail.component.scss'
})
export class InstallmentDetailComponent {
  // API
  COMMON_API = API.Installments;
  TRANSACTION_API = API.Transactions;

  // Select Data
  installmentData: any = [];
  transactionData: any = [];

  // Parameters
  installmentId: any = null;
  pageFrom: any = 'Loans';

  // Loadeer
  isgridloading: boolean = false;

  // Current User
  userId: any = null;

  constructor(
    public commonService: CommonService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.userId = this.commonService.GetUserData().userId;
    
    this.commonService.route.queryParams.subscribe((params) => {
      if (params["id"]) this.installmentId = params["id"];
      if (params["pageFrom"]) this.pageFrom = params["pageFrom"];
    });

    if (this.installmentId) {
      this.getLoanDetail(this.installmentId);
      this.loadTransactions(this.installmentId);
    }
  }

  // ======================================================
  // Get Loan Details
  // ======================================================
  getLoanDetail(id: any) {
    this.commonService.getData(this.COMMON_API + "Select?id=" + id).subscribe({
      next: (response: any) => {
        if (!response || response.length === 0) {
          this.notification.showToast('warning', 'Installment record not found');
          return;
        }

        this.installmentData = response[0];
        console.table(response);
      },
      error: (err) => {
        this.notification.showToast("error", err.message);
      },
    });
  }

  // ======================================================
  // Load Transaction
  // ======================================================
  loadTransactions(id: any) {
    this.transactionData = [];
    this.isgridloading = true;

    let obj = <Transactions>{};
    obj.UserId = this.userId;
    obj.InstallmentId = id;

    this.commonService.postData(this.TRANSACTION_API + "SelectAll", obj).subscribe({
      next: (data: any) => {
        this.isgridloading = false;
        this.transactionData = data.map((item: any) => ({
          ...item,
          amount: Number(item.amount).toFixed(2)
        }));

        console.table(data);
      }
    });
  }

  // ======================================================
  // Back Navigation
  // ======================================================
  backNav() {
    if(this.pageFrom === 'Dashboard')
      this.commonService.router.navigate(['/']);
    else
      this.commonService.router.navigate(['/loans']);
  }
}
