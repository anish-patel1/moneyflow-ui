import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonRefModule } from '../common/module/common-ref.module';
import { CommonService } from '../common/service/common.service';
import { NotificationService } from '../common/service/notification.service';
import { API } from '../apis/api-endpoints';
import {
  Reports,
  AccountReconciliation,
  ReconciliationSummary,
  CategoryReconciliation
} from '../models/reports.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, CommonRefModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  REPORTS_API = API.Reports;

  userId: any = null;
  isLoading: boolean = false;

  // Period Navigation
  maxDate: Date = new Date();
  selectedPeriodDate: Date = new Date();
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;

  // Report Data
  accounts: AccountReconciliation[] = [];
  incomeCategories: CategoryReconciliation[] = [];
  expenseCategories: CategoryReconciliation[] = [];
  summary: ReconciliationSummary | null = null;

  get isCurrentMonth(): boolean {
    const now = new Date();
    return this.selectedYear === now.getFullYear() && this.selectedMonth === (now.getMonth() + 1);
  }

  get displayMonthLabel(): string {
    const d = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  userDisplayName: string = '';
  currentPrintDate: Date = new Date();

  constructor(
    public commonService: CommonService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const user = this.commonService.GetUserData();
    this.userId = user.userId;
    this.userDisplayName = user.userDisplayName || user.userName || 'Account Owner';
    this.selectedPeriodDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    this.loadReconciliation();
  }

  prevMonth(): void {
    if (this.selectedMonth === 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.selectedPeriodDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    this.loadReconciliation();
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
    this.loadReconciliation();
  }

  onPeriodDateSelect(date: Date): void {
    if (!date) return;
    this.selectedYear = date.getFullYear();
    this.selectedMonth = date.getMonth() + 1;
    this.selectedPeriodDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    this.loadReconciliation();
  }

  resetToCurrentMonth(): void {
    const now = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth() + 1;
    this.selectedPeriodDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    this.loadReconciliation();
  }

  loadReconciliation(): void {
    this.isLoading = true;

    const obj = <Reports>{
      UserId: this.userId,
      Year: this.selectedYear,
      Month: this.selectedMonth
    };

    forkJoin({
      accounts: this.commonService.postData(this.REPORTS_API + 'MonthlyReconciliation', obj),
      categories: this.commonService.postData(this.REPORTS_API + 'CategoryBreakdown', obj)
    }).subscribe({
      next: (res: { accounts: AccountReconciliation[]; categories: CategoryReconciliation[] }) => {
        this.isLoading = false;
        this.accounts = res.accounts || [];
        this.summary = this.calculateSummary(this.accounts);

        const cats = res.categories || [];
        this.incomeCategories = cats.filter(c => c.transactionType === 'Income');
        this.expenseCategories = cats.filter(c => c.transactionType === 'Expense');
      },
      error: (err: any) => {
        this.isLoading = false;
        this.notification.showToast('error', err.message || 'Failed to load reconciliation report');
      }
    });
  }

  private calculateSummary(accountList: AccountReconciliation[]): ReconciliationSummary {
    const totalOpeningBalance = accountList.reduce((acc, a) => acc + (a.openingBalance || 0), 0);
    const totalAccountInflow = accountList.reduce((acc, a) => acc + (a.inflow || 0), 0);
    const totalAccountOutflow = accountList.reduce((acc, a) => acc + (a.outflow || 0), 0);
    const totalInflow = accountList.reduce((acc, a) => acc + (a.externalInflow !== undefined ? a.externalInflow : (a.inflow || 0)), 0);
    const totalOutflow = accountList.reduce((acc, a) => acc + (a.externalOutflow !== undefined ? a.externalOutflow : (a.outflow || 0)), 0);
    const totalTransfers = accountList.reduce((acc, a) => acc + (a.transferOut || 0), 0);
    const netFlow = totalInflow - totalOutflow;
    const totalClosingBalance = accountList.reduce((acc, a) => acc + (a.closingBalance || 0), 0);
    const savingsRate = totalInflow > 0 ? (netFlow > 0 ? (netFlow / totalInflow) * 100 : 0) : 0;

    return {
      year: this.selectedYear,
      month: this.selectedMonth,
      totalOpeningBalance,
      totalInflow,
      totalOutflow,
      totalTransfers,
      totalAccountInflow,
      totalAccountOutflow,
      netFlow,
      totalClosingBalance,
      savingsRate
    };
  }

  printReport(): void {
    this.currentPrintDate = new Date();
    const docEl = document.documentElement;
    const isDark = docEl.classList.contains('app-dark');

    if (isDark) {
      docEl.classList.remove('app-dark');
    }

    // Small delay to allow the DOM to repaint without dark theme before print dialog captures it
    setTimeout(() => {
      window.print();
      if (isDark) {
        docEl.classList.add('app-dark');
      }
    }, 120);
  }
}
