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
  CategoryReconciliation,
  YearAtAGlanceItem,
  SavingsSummaryItem,
  YearAtAGlanceSummary,
  AnnualSavingsKPISummary
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
  userDisplayName: string = '';
  currentPrintDate: Date = new Date();

  // Active Tab: 'reconciliation' | 'savings' | 'glance'
  activeTab: 'reconciliation' | 'savings' | 'glance' = 'reconciliation';

  // ----------------------------------------------------
  // TAB 1: MONTHLY RECONCILIATION
  // ----------------------------------------------------
  isLoading: boolean = false;
  maxDate: Date = new Date();
  selectedPeriodDate: Date = new Date();
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;

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

  // ----------------------------------------------------
  // TAB 2: SAVINGS SUMMARY & TRENDS
  // ----------------------------------------------------
  isSavingsLoading: boolean = false;
  savingsYear: number = new Date().getFullYear();
  savingsList: SavingsSummaryItem[] = [];
  savingsKPI: AnnualSavingsKPISummary | null = null;
  savingsChartData: any = null;
  savingsChartOptions: any = null;

  get isCurrentSavingsYear(): boolean {
    return this.savingsYear === new Date().getFullYear();
  }

  // ----------------------------------------------------
  // TAB 3: YEAR AT A GLANCE (EXPENSE PIVOT MATRIX)
  // ----------------------------------------------------
  isGlanceLoading: boolean = false;
  glanceYear: number = new Date().getFullYear();
  glanceList: YearAtAGlanceItem[] = [];
  filteredGlanceList: YearAtAGlanceItem[] = [];
  glanceKPI: YearAtAGlanceSummary | null = null;
  glanceSearchText: string = '';

  get isCurrentGlanceYear(): boolean {
    return this.glanceYear === new Date().getFullYear();
  }

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

  // ----------------------------------------------------
  // TAB NAVIGATION
  // ----------------------------------------------------
  switchTab(tab: 'reconciliation' | 'savings' | 'glance'): void {
    this.activeTab = tab;
    if (tab === 'reconciliation' && !this.accounts.length) {
      this.loadReconciliation();
    } else if (tab === 'savings' && !this.savingsList.length) {
      this.loadSavingsSummary();
    } else if (tab === 'glance' && !this.glanceList.length) {
      this.loadYearAtAGlance();
    }
  }

  // ----------------------------------------------------
  // TAB 1 METHODS (RECONCILIATION)
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // TAB 2 METHODS (SAVINGS SUMMARY)
  // ----------------------------------------------------
  prevSavingsYear(): void {
    this.savingsYear--;
    this.loadSavingsSummary();
  }

  nextSavingsYear(): void {
    if (this.isCurrentSavingsYear) return;
    this.savingsYear++;
    this.loadSavingsSummary();
  }

  resetToCurrentSavingsYear(): void {
    this.savingsYear = new Date().getFullYear();
    this.loadSavingsSummary();
  }

  loadSavingsSummary(): void {
    this.isSavingsLoading = true;

    const obj = <Reports>{
      UserId: this.userId,
      Year: this.savingsYear
    };

    this.commonService.postData(this.REPORTS_API + 'SavingsSummary', obj).subscribe({
      next: (res: SavingsSummaryItem[]) => {
        this.isSavingsLoading = false;
        this.savingsList = res || [];
        this.calculateSavingsKPI(this.savingsList);
        this.initSavingsChart(this.savingsList);
      },
      error: (err: any) => {
        this.isSavingsLoading = false;
        this.notification.showToast('error', err.message || 'Failed to load savings summary');
      }
    });
  }

  private calculateSavingsKPI(data: SavingsSummaryItem[]): void {
    const totalAnnualIncome = data.reduce((acc, d) => acc + (d.income || 0), 0);
    const totalAnnualExpense = data.reduce((acc, d) => acc + (d.expense || 0), 0);
    const totalAnnualTransfers = data.reduce((acc, d) => acc + (d.transfers || 0), 0);
    const netAnnualSavings = totalAnnualIncome - totalAnnualExpense;
    const annualSavingsRate = totalAnnualIncome > 0 ? (netAnnualSavings > 0 ? (netAnnualSavings / totalAnnualIncome) * 100 : 0) : 0;

    let peakMonthName = '—';
    let peakMonthSavings = -Infinity;
    data.forEach(d => {
      if (d.netSavings > peakMonthSavings) {
        peakMonthSavings = d.netSavings;
        peakMonthName = d.monthName;
      }
    });

    if (peakMonthSavings === -Infinity) peakMonthSavings = 0;

    this.savingsKPI = {
      totalAnnualIncome,
      totalAnnualExpense,
      totalAnnualTransfers,
      netAnnualSavings,
      annualSavingsRate,
      peakMonthName,
      peakMonthSavings
    };
  }

  private initSavingsChart(data: SavingsSummaryItem[]): void {
    const labels = data.map(d => d.monthName);
    const incomeData = data.map(d => d.income || 0);
    const expenseData = data.map(d => d.expense || 0);
    const cumulativeData = data.map(d => d.cumulativeSavings || 0);

    const docStyle = getComputedStyle(document.documentElement);
    const textColor = docStyle.getPropertyValue('--text-color') || '#495057';
    const textColorSecondary = docStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
    const surfaceBorder = docStyle.getPropertyValue('--surface-border') || '#e5e7eb';

    this.savingsChartData = {
      labels: labels,
      datasets: [
        {
          type: 'line',
          label: 'Cumulative Savings',
          borderColor: '#6366f1',
          borderWidth: 3,
          fill: false,
          tension: 0.35,
          pointBackgroundColor: '#6366f1',
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'y1',
          data: cumulativeData
        },
        {
          type: 'bar',
          label: 'Income',
          backgroundColor: '#10b981',
          borderRadius: 6,
          data: incomeData,
          yAxisID: 'y'
        },
        {
          type: 'bar',
          label: 'Expense',
          backgroundColor: '#f43f5e',
          borderRadius: 6,
          data: expenseData,
          yAxisID: 'y'
        }
      ]
    };

    this.savingsChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
            usePointStyle: true,
            boxWidth: 8,
            boxHeight: 8
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(context.parsed.y);
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {
            color: textColorSecondary,
            callback: (val: number) => '₹' + val.toLocaleString()
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          ticks: {
            color: textColorSecondary,
            callback: (val: number) => '₹' + val.toLocaleString()
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    };
  }

  // ----------------------------------------------------
  // TAB 3 METHODS (YEAR AT A GLANCE)
  // ----------------------------------------------------
  prevGlanceYear(): void {
    this.glanceYear--;
    this.loadYearAtAGlance();
  }

  nextGlanceYear(): void {
    if (this.isCurrentGlanceYear) return;
    this.glanceYear++;
    this.loadYearAtAGlance();
  }

  resetToCurrentGlanceYear(): void {
    this.glanceYear = new Date().getFullYear();
    this.loadYearAtAGlance();
  }

  private readonly frequencyRank: { [key: string]: number } = {
    monthly: 1,
    bimonthly: 2,
    quarterly: 3,
    sixmonthly: 4,
    yearly: 5,
    onetime: 6
  };

  getFrequencyRank(freq?: string): number {
    const key = (freq || 'Monthly').toLowerCase().replace(/[-_ ]/g, '');
    return this.frequencyRank[key] ?? 99;
  }

  getFrequencyClass(freq?: string): string {
    const key = (freq || 'Monthly').toLowerCase().replace(/[-_ ]/g, '');
    switch (key) {
      case 'monthly': return 'text-blue-600 dark:text-blue-400 bg-blue-500/10';
      case 'bimonthly': return 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10';
      case 'quarterly': return 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10';
      case 'sixmonthly': return 'text-purple-600 dark:text-purple-400 bg-purple-500/10';
      case 'yearly': return 'text-amber-600 dark:text-amber-400 bg-amber-500/10';
      case 'onetime': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10';
      default: return 'text-surface-600 dark:text-surface-400 bg-surface-500/10';
    }
  }

  private sortGlanceItems(items: YearAtAGlanceItem[]): YearAtAGlanceItem[] {
    return [...items].sort((a, b) => {
      const rankA = this.getFrequencyRank(a.frequency);
      const rankB = this.getFrequencyRank(b.frequency);
      if (rankA !== rankB) return rankA - rankB;
      return (a.categoryName || '').localeCompare(b.categoryName || '');
    });
  }

  onGlanceSearch(): void {
    const q = (this.glanceSearchText || '').trim().toLowerCase();
    if (!q) {
      this.filteredGlanceList = this.sortGlanceItems(this.glanceList);
    } else {
      const filtered = this.glanceList.filter(item =>
        (item.categoryName || '').toLowerCase().includes(q) ||
        (item.frequency || '').toLowerCase().includes(q)
      );
      this.filteredGlanceList = this.sortGlanceItems(filtered);
    }
  }

  loadYearAtAGlance(): void {
    this.isGlanceLoading = true;

    const obj = <Reports>{
      UserId: this.userId,
      Year: this.glanceYear
    };

    this.commonService.postData(this.REPORTS_API + 'YearAtAGlance', obj).subscribe({
      next: (res: YearAtAGlanceItem[]) => {
        this.isGlanceLoading = false;
        this.glanceList = this.sortGlanceItems(res || []);
        this.onGlanceSearch();
        this.calculateGlanceKPI(this.glanceList);
      },
      error: (err: any) => {
        this.isGlanceLoading = false;
        this.notification.showToast('error', err.message || 'Failed to load Year at a Glance report');
      }
    });
  }

  private calculateGlanceKPI(data: YearAtAGlanceItem[]): void {
    const totalAnnualExpense = data.reduce((acc, d) => acc + (d.totalAmount || 0), 0);
    const monthlyAverageExpense = totalAnnualExpense / 12.0;

    let topCategoryName = '—';
    let topCategoryAmount = 0;
    data.forEach(d => {
      if (d.totalAmount > topCategoryAmount) {
        topCategoryAmount = d.totalAmount;
        topCategoryName = d.categoryName;
      }
    });

    const monthTotals: { [key: string]: number } = {
      jan: data.reduce((acc, d) => acc + (d.jan || 0), 0),
      feb: data.reduce((acc, d) => acc + (d.feb || 0), 0),
      mar: data.reduce((acc, d) => acc + (d.mar || 0), 0),
      apr: data.reduce((acc, d) => acc + (d.apr || 0), 0),
      may: data.reduce((acc, d) => acc + (d.may || 0), 0),
      jun: data.reduce((acc, d) => acc + (d.jun || 0), 0),
      jul: data.reduce((acc, d) => acc + (d.jul || 0), 0),
      aug: data.reduce((acc, d) => acc + (d.aug || 0), 0),
      sep: data.reduce((acc, d) => acc + (d.sep || 0), 0),
      oct: data.reduce((acc, d) => acc + (d.oct || 0), 0),
      nov: data.reduce((acc, d) => acc + (d.nov || 0), 0),
      dec: data.reduce((acc, d) => acc + (d.dec || 0), 0),
      total: totalAnnualExpense
    };

    this.glanceKPI = {
      totalAnnualExpense,
      topCategoryName,
      topCategoryAmount,
      monthlyAverageExpense,
      monthTotals
    };
  }

  exportGlanceToCsv(): void {
    const listToExport = this.filteredGlanceList.length ? this.filteredGlanceList : this.glanceList;
    if (!listToExport.length) return;

    const headers = [
      'Category',
      'Frequency',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
      'Total',
      'Monthly Average'
    ];

    const rows = listToExport.map(item => [
      `"${item.categoryName}"`,
      item.frequency,
      item.jan,
      item.feb,
      item.mar,
      item.apr,
      item.may,
      item.jun,
      item.jul,
      item.aug,
      item.sep,
      item.oct,
      item.nov,
      item.dec,
      item.totalAmount,
      item.monthlyAverage
    ]);

    // Footer row
    if (this.glanceKPI) {
      const mt = this.glanceKPI.monthTotals;
      rows.push([
        '"Total (All Categories)"',
        '—',
        mt['jan'],
        mt['feb'],
        mt['mar'],
        mt['apr'],
        mt['may'],
        mt['jun'],
        mt['jul'],
        mt['aug'],
        mt['sep'],
        mt['oct'],
        mt['nov'],
        mt['dec'],
        mt['total'],
        (mt['total'] / 12.0)
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Year_at_a_Glance_${this.glanceYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printReport(): void {
    this.currentPrintDate = new Date();
    const docEl = document.documentElement;
    const isDark = docEl.classList.contains('app-dark');

    if (isDark) {
      docEl.classList.remove('app-dark');
    }

    setTimeout(() => {
      window.print();
      if (isDark) {
        docEl.classList.add('app-dark');
      }
    }, 120);
  }
}
