import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CommonRefModule } from '../../common/module/common-ref.module';
import { API } from '../../apis/api-endpoints';
import { CommonService } from '../../common/service/common.service';
import { NotificationService } from '../../common/service/notification.service';
import { Transactions } from '../../models/transactions.model';
import { InstallmentSchedule } from '../../models/installment-schedule.model';
import { ConfirmationService } from 'primeng/api';
import { UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-installment-detail',
  imports: [CommonModule, CommonRefModule],
  templateUrl: './installment-detail.component.html',
  styleUrl: './installment-detail.component.scss'
})
export class InstallmentDetailComponent implements OnInit {
  // APIs
  COMMON_API = API.Installments;
  TRANSACTION_API = API.Transactions;
  ACCOUNTS_API = API.Accounts;

  // Loan Detail
  installmentData: any = {};
  transactionData: any[] = [];
  scheduleData: InstallmentSchedule[] = [];
  filteredScheduleData: InstallmentSchedule[] = [];

  // Route & Navigation Parameters
  installmentId: any = null;
  pageFrom: string = 'Loans';

  // Loaders
  isgridloading: boolean = false;
  isScheduleLoading: boolean = false;

  // Active View Tab ('schedule' | 'transactions')
  activeTab: 'schedule' | 'transactions' = 'schedule';

  // Schedule Filter ('All' | 'Pending' | 'Done' | 'Overdue')
  scheduleFilter: string = 'All';

  // Current User
  userId: any = null;

  // Accounts list for payment dropdown
  accountList: any[] = [];

  // Summary Metrics for Schedule
  totalScheduledAmount: number = 0;
  totalPrincipal: number = 0;
  totalInterest: number = 0;
  totalExtraCharges: number = 0;
  paidScheduleAmount: number = 0;
  paidCount: number = 0;
  pendingCount: number = 0;
  overdueCount: number = 0;

  // ==========================================
  // Auto-Generate Schedule Dialog State
  // ==========================================
  generateDialog: boolean = false;
  generateForm!: UntypedFormGroup;
  previewRows: InstallmentSchedule[] = [];

  calculationMethods = [
    { label: 'Reducing Balance (Standard Bank EMI)', value: 'ReducingBalance' },
    { label: 'Flat Interest Rate', value: 'FlatRate' },
    { label: 'Zero Interest / Equal Split', value: 'ZeroInterest' }
  ];

  // ==========================================
  // Record Payment Dialog State
  // ==========================================
  payDialog: boolean = false;
  payForm!: UntypedFormGroup;
  selectedScheduleRow: InstallmentSchedule | null = null;
  paySubmitted: boolean = false;

  // ==========================================
  // Batch / Multi-EMI Payment Dialog State (Case 1)
  // ==========================================
  payMultipleDialog: boolean = false;
  payMultipleForm!: UntypedFormGroup;
  selectedMultiRows: InstallmentSchedule[] = [];
  payMultipleSubmitted: boolean = false;

  // ==========================================
  // Single Row Edit/Add Dialog State
  // ==========================================
  rowDialog: boolean = false;
  rowForm!: UntypedFormGroup;
  isEditingRow: boolean = false;
  rowSubmitted: boolean = false;

  constructor(
    public commonService: CommonService,
    private notification: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.userId = this.commonService.GetUserData().userId;

    this.initForms();

    this.commonService.route.queryParams.subscribe((params) => {
      if (params['id']) this.installmentId = params['id'];
      if (params['pageFrom']) this.pageFrom = params['pageFrom'];
    });

    if (this.installmentId) {
      this.getLoanDetail(this.installmentId);
      this.loadTransactions(this.installmentId);
      this.loadSchedule(this.installmentId);
    }

    this.loadAccounts();
  }

  // ======================================================
  // Initialize Forms
  // ======================================================
  initForms(): void {
    // Generate Form
    this.generateForm = this.commonService.formBuilder.group({
      CalculationMethod: ['ReducingBalance', Validators.required],
      BillingType: ['FixedDate', Validators.required],
      InterestRate: [10.5, [Validators.required, Validators.min(0)]],
      ExtraCharges: [0, [Validators.min(0)]],
      ChargesDescription: ['GST / Extra Charges'],
      StartDate: [new Date(), Validators.required],
      BillingDay: [5, [Validators.required, Validators.min(1), Validators.max(31)]],
      DueDay: [20, [Validators.min(1), Validators.max(31)]],
      MarkInitialAsPaid: [true]
    });

    // Pay Form
    this.payForm = this.commonService.formBuilder.group({
      InstallmentScheduleId: [null],
      InstallmentNo: [{ value: '', disabled: true }],
      DueDate: [{ value: '', disabled: true }],
      AccountId: [null, Validators.required],
      TransactionDate: [new Date(), Validators.required],
      ScheduledAmount: [{ value: 0, disabled: true }],
      ExtraCharges: [0, [Validators.min(0)]],
      ChargesDescription: ['Late Fee / Penalty'],
      Amount: [0, [Validators.required, Validators.min(0.01)]],
      Description: ['']
    });

    // Pay Multiple (Batch) Form
    this.payMultipleForm = this.commonService.formBuilder.group({
      AccountId: [null, Validators.required],
      TransactionDate: [new Date(), Validators.required],
      Count: [2, [Validators.required, Validators.min(2)]],
      ScheduledAmount: [{ value: 0, disabled: true }],
      ExtraCharges: [0, [Validators.min(0)]],
      ChargesDescription: ['Late Fee / Penalty'],
      Amount: [0, [Validators.required, Validators.min(0.01)]],
      Description: ['']
    });

    // Single Row Form
    this.rowForm = this.commonService.formBuilder.group({
      InstallmentScheduleId: [null],
      InstallmentId: [this.installmentId],
      InstallmentNo: [1, [Validators.required, Validators.min(1)]],
      PaymentStartDate: [null],
      DueDate: [new Date(), Validators.required],
      OpeningBalance: [0],
      ScheduledAmount: [0, [Validators.required, Validators.min(0.01)]],
      Principal: [0, [Validators.required, Validators.min(0)]],
      Interest: [0, [Validators.required, Validators.min(0)]],
      InterestRate: [0],
      ExtraCharges: [0],
      ChargesDescription: [''],
      ClosingBalance: [0],
      ScheduleStatus: ['Pending', Validators.required],
      Notes: ['']
    });
  }

  // ======================================================
  // Load Accounts Dropdown
  // ======================================================
  loadAccounts(): void {
    this.commonService.postData(this.ACCOUNTS_API + 'DropDown', { UserId: this.userId }).subscribe({
      next: (data: any) => {
        this.accountList = data || [];
      }
    });
  }

  // ======================================================
  // Get Loan Details
  // ======================================================
  getLoanDetail(id: any): void {
    this.commonService.getData(this.COMMON_API + 'Select?id=' + id).subscribe({
      next: (response: any) => {
        if (!response || response.length === 0) {
          this.notification.showToast('warn', 'Installment record not found');
          return;
        }

        this.installmentData = response[0];
      },
      error: (err) => {
        this.notification.showToast('error', err.message);
      }
    });
  }

  // ======================================================
  // Load Transactions History
  // ======================================================
  loadTransactions(id: any): void {
    this.transactionData = [];
    this.isgridloading = true;

    const obj = <Transactions>{};
    obj.UserId = this.userId;
    obj.InstallmentId = id;

    this.commonService.postData(this.TRANSACTION_API + 'SelectAll', obj).subscribe({
      next: (data: any) => {
        this.isgridloading = false;
        this.transactionData = (data || []).map((item: any) => ({
          ...item,
          amount: Number(item.amount).toFixed(2)
        }));
      },
      error: () => {
        this.isgridloading = false;
      }
    });
  }

  // ======================================================
  // Load Amortization Schedule
  // ======================================================
  loadSchedule(id: any): void {
    this.isScheduleLoading = true;
    const payload = {
      InstallmentId: id,
      UserId: this.userId
    };

    this.commonService.postData(this.COMMON_API + 'ScheduleSelectAll', payload).subscribe({
      next: (data: any[]) => {
        this.isScheduleLoading = false;
        this.scheduleData = (data || []).map((item) => ({
          InstallmentScheduleId: item.installmentScheduleId ?? item.InstallmentScheduleId,
          InstallmentId: item.installmentId ?? item.InstallmentId,
          UserId: item.userId ?? item.UserId,
          InstallmentNo: item.installmentNo ?? item.InstallmentNo,
          DueDate: item.dueDateFormatted || item.DueDateFormatted || item.dueDate || item.DueDate,
          DueDateFormatted: item.dueDateFormatted ?? item.DueDateFormatted,
          OpeningBalance: Number(item.openingBalance ?? item.OpeningBalance ?? 0),
          ScheduledAmount: Number(item.scheduledAmount ?? item.ScheduledAmount ?? 0),
          Principal: Number(item.principal ?? item.Principal ?? 0),
          Interest: Number(item.interest ?? item.Interest ?? 0),
          InterestRate: item.interestRate ?? item.InterestRate,
          ExtraCharges: Number(item.extraCharges ?? item.ExtraCharges ?? 0),
          ChargesDescription: item.chargesDescription ?? item.ChargesDescription,
          ClosingBalance: Number(item.closingBalance ?? item.ClosingBalance ?? 0),
          ScheduleStatus: item.scheduleStatus ?? item.ScheduleStatus ?? 'Pending',
          PaidDate: item.paidDate ?? item.PaidDate,
          PaidDateFormatted: item.paidDateFormatted ?? item.PaidDateFormatted,
          PaidAmount: item.paidAmount != null ? Number(item.paidAmount ?? item.PaidAmount) : undefined,
          TransactionId: item.transactionId ?? item.TransactionId,
          Notes: item.notes ?? item.Notes,
          AccountId: item.accountId ?? item.AccountId,
          AccountName: item.accountName ?? item.AccountName
        }));

        this.calculateScheduleMetrics();
        this.applyScheduleFilter();
      },
      error: (err) => {
        this.isScheduleLoading = false;
        this.notification.showToast('error', err.message || 'Failed to load schedule');
      }
    });
  }

  // ======================================================
  // Compute Schedule Metrics
  // ======================================================
  calculateScheduleMetrics(): void {
    this.totalScheduledAmount = 0;
    this.totalPrincipal = 0;
    this.totalInterest = 0;
    this.totalExtraCharges = 0;
    this.paidScheduleAmount = 0;
    this.paidCount = 0;
    this.pendingCount = 0;
    this.overdueCount = 0;

    for (const row of this.scheduleData) {
      this.totalScheduledAmount += row.ScheduledAmount;
      this.totalPrincipal += row.Principal;
      this.totalInterest += row.Interest;
      this.totalExtraCharges += row.ExtraCharges;

      const isDone = (row.ScheduleStatus || '').toLowerCase() === 'done';
      if (isDone) {
        this.paidCount++;
        this.paidScheduleAmount += row.PaidAmount != null ? row.PaidAmount : row.ScheduledAmount;
      } else if (this.isOverdue(row.DueDate, row.ScheduleStatus)) {
        this.overdueCount++;
      } else {
        this.pendingCount++;
      }
    }
  }

  // ======================================================
  // Filter Schedule Rows
  // ======================================================
  setScheduleFilter(filter: string): void {
    this.scheduleFilter = filter;
    this.applyScheduleFilter();
  }

  applyScheduleFilter(): void {
    if (this.scheduleFilter === 'Overdue' && this.overdueCount === 0) {
      this.scheduleFilter = 'All';
    }

    if (this.scheduleFilter === 'All') {
      this.filteredScheduleData = [...this.scheduleData];
      return;
    }

    this.filteredScheduleData = this.scheduleData.filter((item) => {
      const isDone = (item.ScheduleStatus || '').toLowerCase() === 'done';
      if (this.scheduleFilter === 'Done') return isDone;
      if (this.scheduleFilter === 'Pending') {
        return !isDone && !this.isOverdue(item.DueDate, item.ScheduleStatus);
      }
      if (this.scheduleFilter === 'Overdue') {
        return !isDone && this.isOverdue(item.DueDate, item.ScheduleStatus);
      }
      return true;
    });
  }

  get isLoanActive(): boolean {
    if (!this.installmentData) return false;
    const status = this.installmentData.status ?? this.installmentData.Status;
    if (status && status !== 'A') return false;

    const paid = Number(this.installmentData.paidMonths ?? this.installmentData.PaidMonths ?? 0);
    const duration = Number(this.installmentData.durationMonths ?? this.installmentData.DurationMonths ?? 0);
    if (duration > 0 && paid >= duration) {
      return false;
    }

    return true;
  }

  get pendingScheduleRows(): InstallmentSchedule[] {
    return (this.scheduleData || [])
      .filter((r) => (r.ScheduleStatus || '').toLowerCase() !== 'done')
      .sort((a, b) => (Number(a.InstallmentNo) || 0) - (Number(b.InstallmentNo) || 0));
  }

  get maxMultiCount(): number {
    return Math.max(2, this.pendingScheduleRows.length);
  }

  isOverdue(dueDate: any, status?: string): boolean {
    if ((status || '').toLowerCase() === 'done') return false;
    if (!dueDate) return false;

    let dueStr = '';
    if (typeof dueDate === 'string') {
      const trimmed = dueDate.trim();
      // If already ISO format like '2026-10-18' or '2026-10-18T00:00:00'
      if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        dueStr = trimmed.substring(0, 10);
      } else {
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) {
          dueStr = this.commonService.formatDate(parsed);
        }
      }
    } else if (dueDate instanceof Date && !isNaN(dueDate.getTime())) {
      dueStr = this.commonService.formatDate(dueDate);
    }

    if (!dueStr) return false;

    const todayStr = this.commonService.formatDate(new Date());
    return dueStr < todayStr;
  }

  // ======================================================
  // Auto-Generate Schedule Dialog
  // ======================================================
  openGenerateDialog(): void {
    if (!this.isLoanActive) {
      this.notification.showToast('warn', 'This loan is closed / completed and is in view-only mode.');
      return;
    }
    if (!this.installmentData) return;

    let startDate = new Date();
    if (this.installmentData.startDate) {
      startDate = new Date(this.installmentData.startDate);
    }

    this.generateForm.patchValue({
      CalculationMethod: 'ReducingBalance',
      BillingType: this.installmentData.billingType || 'FixedDate',
      InterestRate: 10.5,
      ExtraCharges: 0,
      ChargesDescription: 'GST / Charges',
      StartDate: startDate,
      BillingDay: this.installmentData.billingDay || 5,
      DueDay: this.installmentData.dueDay || 20,
      MarkInitialAsPaid: (this.installmentData.initialPaidMonths || 0) > 0
    });

    this.previewSchedule();
    this.generateDialog = true;
  }

  previewSchedule(): void {
    const P = Number(this.installmentData.totalAmount || 0);
    const n = Number(this.installmentData.durationMonths || 12);
    const method = this.generateForm.get('CalculationMethod')?.value;
    const isDateRange = this.generateForm.get('BillingType')?.value === 'DateRange';
    const annualRate = Number(this.generateForm.get('InterestRate')?.value || 0);
    const extraCharges = Number(this.generateForm.get('ExtraCharges')?.value || 0);
    const chargesDesc = this.generateForm.get('ChargesDescription')?.value || '';
    const baseDate = new Date(this.generateForm.get('StartDate')?.value || new Date());
    const billingDay = Number(this.generateForm.get('BillingDay')?.value || 5);
    const dueDayVal = Number(this.generateForm.get('DueDay')?.value || billingDay);
    const markInitial = this.generateForm.get('MarkInitialAsPaid')?.value;
    const initialPaid = Number(this.installmentData.initialPaidMonths || 0);

    const getDatePair = (i: number) => {
      if (isDateRange) {
        const startWindow = new Date(baseDate.getFullYear(), baseDate.getMonth() + (i - 1), billingDay);
        const endMonthOffset = dueDayVal < billingDay ? i : (i - 1);
        const endWindow = new Date(baseDate.getFullYear(), baseDate.getMonth() + endMonthOffset, dueDayVal);
        return {
          dueDateStr: this.commonService.formatDate(endWindow),
          paymentStartStr: this.commonService.formatDate(startWindow)
        };
      } else {
        const dueDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + (i - 1), billingDay);
        return {
          dueDateStr: this.commonService.formatDate(dueDate),
          paymentStartStr: undefined
        };
      }
    };

    const generated: InstallmentSchedule[] = [];
    let currentBalance = P;

    if (method === 'ReducingBalance') {
      const monthlyRate = annualRate > 0 ? (annualRate / 100) / 12 : 0;
      let emi = 0;

      if (monthlyRate > 0) {
        emi = (P * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
      } else {
        emi = P / n;
      }

      for (let i = 1; i <= n; i++) {
        const { dueDateStr, paymentStartStr } = getDatePair(i);
        const opening = currentBalance;
        let interest = Number((opening * monthlyRate).toFixed(2));
        let principal = Number((emi - interest).toFixed(2));

        if (i === n || opening - principal < 0) {
          principal = opening;
          emi = principal + interest;
        }

        const closing = Math.max(0, Number((opening - principal).toFixed(2)));
        currentBalance = closing;

        const isPaid = markInitial && i <= initialPaid;

        generated.push({
          InstallmentId: this.installmentId,
          InstallmentNo: i,
          PaymentStartDate: paymentStartStr,
          DueDate: dueDateStr,
          OpeningBalance: opening,
          Principal: principal,
          Interest: interest,
          InterestRate: annualRate,
          ExtraCharges: extraCharges,
          ChargesDescription: extraCharges > 0 ? chargesDesc : undefined,
          ScheduledAmount: Number((principal + interest + extraCharges).toFixed(2)),
          ClosingBalance: closing,
          ScheduleStatus: isPaid ? 'Done' : 'Pending',
          PaidDate: isPaid ? dueDateStr : undefined,
          PaidAmount: isPaid ? Number((principal + interest + extraCharges).toFixed(2)) : undefined,
          Notes: isPaid ? 'Pre-existing payment before app onboard' : undefined
        });
      }
    } else if (method === 'FlatRate') {
      const totalInterest = (P * (annualRate / 100) * (n / 12));
      const monthlyPrincipal = Number((P / n).toFixed(2));
      const monthlyInterest = Number((totalInterest / n).toFixed(2));

      for (let i = 1; i <= n; i++) {
        const { dueDateStr, paymentStartStr } = getDatePair(i);
        const opening = currentBalance;
        const principal = i === n ? currentBalance : monthlyPrincipal;
        const closing = Math.max(0, Number((opening - principal).toFixed(2)));
        currentBalance = closing;

        const isPaid = markInitial && i <= initialPaid;

        generated.push({
          InstallmentId: this.installmentId,
          InstallmentNo: i,
          PaymentStartDate: paymentStartStr,
          DueDate: dueDateStr,
          OpeningBalance: opening,
          Principal: principal,
          Interest: monthlyInterest,
          InterestRate: annualRate,
          ExtraCharges: extraCharges,
          ChargesDescription: extraCharges > 0 ? chargesDesc : undefined,
          ScheduledAmount: Number((principal + monthlyInterest + extraCharges).toFixed(2)),
          ClosingBalance: closing,
          ScheduleStatus: isPaid ? 'Done' : 'Pending',
          PaidDate: isPaid ? dueDateStr : undefined,
          PaidAmount: isPaid ? Number((principal + monthlyInterest + extraCharges).toFixed(2)) : undefined,
          Notes: isPaid ? 'Pre-existing payment before app onboard' : undefined
        });
      }
    } else {
      // Zero Interest / Equal Principal
      const monthlyPrincipal = Number((P / n).toFixed(2));

      for (let i = 1; i <= n; i++) {
        const { dueDateStr, paymentStartStr } = getDatePair(i);
        const opening = currentBalance;
        const principal = i === n ? currentBalance : monthlyPrincipal;
        const closing = Math.max(0, Number((opening - principal).toFixed(2)));
        currentBalance = closing;

        const isPaid = markInitial && i <= initialPaid;

        generated.push({
          InstallmentId: this.installmentId,
          InstallmentNo: i,
          PaymentStartDate: paymentStartStr,
          DueDate: dueDateStr,
          OpeningBalance: opening,
          Principal: principal,
          Interest: 0,
          InterestRate: 0,
          ExtraCharges: extraCharges,
          ChargesDescription: extraCharges > 0 ? chargesDesc : undefined,
          ScheduledAmount: Number((principal + extraCharges).toFixed(2)),
          ClosingBalance: closing,
          ScheduleStatus: isPaid ? 'Done' : 'Pending',
          PaidDate: isPaid ? dueDateStr : undefined,
          PaidAmount: isPaid ? Number((principal + extraCharges).toFixed(2)) : undefined,
          Notes: isPaid ? 'Pre-existing payment before app onboard' : undefined
        });
      }
    }

    this.previewRows = generated;
  }

  saveGeneratedSchedule(): void {
    if (!this.previewRows || this.previewRows.length === 0) {
      this.notification.showToast('warn', 'No schedule rows generated');
      return;
    }

    const payload = {
      InstallmentId: this.installmentId,
      UserId: this.userId,
      ScheduleJson: JSON.stringify(this.previewRows)
    };

    this.commonService.postData(this.COMMON_API + 'ScheduleBulkInsert', payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.notification.showToast('success', res.message || 'Schedule generated successfully');
          this.generateDialog = false;
          this.loadSchedule(this.installmentId);
          this.getLoanDetail(this.installmentId);
        } else {
          this.notification.showToast('warn', res.message || 'Failed to save schedule');
        }
      },
      error: (err) => {
        this.notification.showToast('error', err.message || 'Error saving schedule');
      }
    });
  }

  // ======================================================
  // Record Payment Dialog
  // ======================================================
  openPayDialog(row: InstallmentSchedule): void {
    if (!this.isLoanActive) {
      this.notification.showToast('warn', 'This loan is closed / completed and is in view-only mode.');
      return;
    }
    this.selectedScheduleRow = row;
    this.paySubmitted = false;

    const scheduled = Number(row.ScheduledAmount) || 0;

    this.payForm.patchValue({
      InstallmentScheduleId: row.InstallmentScheduleId,
      InstallmentNo: `Installment #${row.InstallmentNo}`,
      DueDate: row.DueDate,
      AccountId: this.accountList.length > 0 ? this.accountList[0].accountId : null,
      TransactionDate: new Date(),
      ScheduledAmount: scheduled,
      ExtraCharges: 0,
      ChargesDescription: 'Late Fee / Penalty',
      Amount: scheduled,
      Description: `EMI #${row.InstallmentNo} - ${this.installmentData?.installmentName || 'Loan'}`
    });

    this.payDialog = true;
  }

  onSingleExtraChargesChange(): void {
    const scheduled = Number(this.payForm.get('ScheduledAmount')?.value || 0);
    const extraCharges = Number(this.payForm.get('ExtraCharges')?.value || 0);
    this.payForm.patchValue({
      Amount: Number((scheduled + extraCharges).toFixed(2))
    });
  }

  savePayment(): void {
    if (!this.isLoanActive) {
      this.notification.showToast('warn', 'This loan is closed / completed and is in view-only mode.');
      return;
    }
    this.paySubmitted = true;
    if (this.payForm.invalid) {
      return;
    }

    const formVal = this.payForm.getRawValue();
    const transDateStr = this.commonService.formatDate(new Date(formVal.TransactionDate));

    const payload = {
      UserId: this.userId,
      InstallmentId: this.installmentId,
      ScheduleIds: this.selectedScheduleRow?.InstallmentScheduleId.toString(),
      AccountId: formVal.AccountId,
      TransactionDate: transDateStr,
      Amount: formVal.Amount,
      ExtraCharges: formVal.ExtraCharges || 0,
      ChargesDescription: formVal.ExtraCharges > 0 ? formVal.ChargesDescription : null,
      Description: formVal.Description
    };

    this.commonService.postData(this.COMMON_API + 'SchedulePayMultiple', payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.notification.showToast('success', 'EMI Payment recorded successfully!');
          this.payDialog = false;
          this.getLoanDetail(this.installmentId);
          this.loadTransactions(this.installmentId);
          this.loadSchedule(this.installmentId);
        } else {
          this.notification.showToast('warn', res.message || 'Payment recording failed');
        }
      },
      error: (err) => {
        this.notification.showToast('error', err.message || 'Error recording payment');
      }
    });
  }

  // ======================================================
  // Batch / Multi-EMI Payment Handlers (Case 1)
  // ======================================================
  openPayMultipleDialog(): void {
    if (!this.isLoanActive) {
      this.notification.showToast('warn', 'This loan is closed / completed and is in view-only mode.');
      return;
    }
    const pending = this.pendingScheduleRows;
    if (pending.length < 2) {
      this.notification.showToast('warn', 'At least 2 pending installments are required for batch payment.');
      return;
    }

    this.payMultipleSubmitted = false;
    const count = 2;
    this.selectedMultiRows = pending.slice(0, count);

    const scheduledSum = this.selectedMultiRows.reduce((acc, r) => acc + (Number(r.ScheduledAmount) || 0), 0);
    const nos = this.selectedMultiRows.map((r) => r.InstallmentNo).join(', ');

    this.payMultipleForm.patchValue({
      AccountId: this.accountList.length > 0 ? this.accountList[0].accountId : null,
      TransactionDate: new Date(),
      Count: count,
      ScheduledAmount: scheduledSum,
      ExtraCharges: 0,
      ChargesDescription: 'Late Fee / Penalty',
      Amount: scheduledSum,
      Description: `EMI #${nos} - ${this.installmentData?.installmentName || 'Loan'}`
    });

    this.payMultipleDialog = true;
  }

  onMultiCountChange(count: any): void {
    const totalPending = this.pendingScheduleRows.length;
    const parsed = Number(count);
    let validCount = isNaN(parsed) || count == null ? 2 : parsed;
    if (validCount < 2) validCount = 2;
    if (validCount > totalPending) validCount = totalPending;

    this.selectedMultiRows = this.pendingScheduleRows.slice(0, validCount);

    const scheduledSum = this.selectedMultiRows.reduce((acc, r) => acc + (Number(r.ScheduledAmount) || 0), 0);
    const extraCharges = Number(this.payMultipleForm.get('ExtraCharges')?.value || 0);
    const nos = this.selectedMultiRows.map((r) => r.InstallmentNo).join(', ');

    this.payMultipleForm.patchValue({
      Count: validCount,
      ScheduledAmount: scheduledSum,
      Amount: Number((scheduledSum + extraCharges).toFixed(2)),
      Description: `EMI #${nos} - ${this.installmentData?.installmentName || 'Loan'}`
    });
  }

  onMultiExtraChargesChange(): void {
    const scheduledSum = Number(this.payMultipleForm.get('ScheduledAmount')?.value || 0);
    const extraCharges = Number(this.payMultipleForm.get('ExtraCharges')?.value || 0);
    this.payMultipleForm.patchValue({
      Amount: Number((scheduledSum + extraCharges).toFixed(2))
    });
  }

  savePayMultiple(): void {
    if (!this.isLoanActive) {
      this.notification.showToast('warn', 'This loan is closed / completed and is in view-only mode.');
      return;
    }
    this.payMultipleSubmitted = true;
    if (this.payMultipleForm.invalid || this.selectedMultiRows.length < 2) {
      return;
    }

    const formVal = this.payMultipleForm.getRawValue();
    const transDateStr = this.commonService.formatDate(new Date(formVal.TransactionDate));
    const scheduleIds = this.selectedMultiRows.map((r) => r.InstallmentScheduleId).join(',');

    const payload = {
      UserId: this.userId,
      InstallmentId: this.installmentId,
      ScheduleIds: scheduleIds,
      AccountId: formVal.AccountId,
      TransactionDate: transDateStr,
      Amount: formVal.Amount,
      ExtraCharges: formVal.ExtraCharges || 0,
      ChargesDescription: formVal.ExtraCharges > 0 ? formVal.ChargesDescription : null,
      Description: formVal.Description
    };

    this.commonService.postData(this.COMMON_API + 'SchedulePayMultiple', payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.notification.showToast('success', res.message || 'Batch EMI payment recorded successfully!');
          this.payMultipleDialog = false;
          this.getLoanDetail(this.installmentId);
          this.loadTransactions(this.installmentId);
          this.loadSchedule(this.installmentId);
        } else {
          this.notification.showToast('warn', res.message || 'Batch payment failed');
        }
      },
      error: (err) => {
        this.notification.showToast('error', err.message || 'Error recording batch payment');
      }
    });
  }

  // ======================================================
  // Single Row Add/Edit Dialog
  // ======================================================
  openAddRowDialog(): void {
    if (!this.isLoanActive) {
      this.notification.showToast('warn', 'This loan is closed / completed and is in view-only mode.');
      return;
    }
    this.isEditingRow = false;
    this.rowSubmitted = false;

    const nextNo = this.scheduleData.length > 0 ? Math.max(...this.scheduleData.map(s => s.InstallmentNo)) + 1 : 1;
    const lastRow = this.scheduleData.length > 0 ? this.scheduleData[this.scheduleData.length - 1] : null;

    let nextDue = new Date();
    let opening = Number(this.installmentData.totalAmount || 0);

    if (lastRow) {
      opening = lastRow.ClosingBalance != null ? lastRow.ClosingBalance : 0;
      if (lastRow.DueDate) {
        const d = new Date(lastRow.DueDate);
        nextDue = new Date(d.getFullYear(), d.getMonth() + 1, d.getDate());
      }
    }

    this.rowForm.patchValue({
      InstallmentScheduleId: null,
      InstallmentId: this.installmentId,
      InstallmentNo: nextNo,
      PaymentStartDate: null,
      DueDate: nextDue,
      OpeningBalance: opening,
      ScheduledAmount: Number(this.installmentData.monthlyAmount || 0),
      Principal: Number(this.installmentData.monthlyAmount || 0),
      Interest: 0,
      InterestRate: 0,
      ExtraCharges: 0,
      ChargesDescription: '',
      ClosingBalance: Math.max(0, opening - Number(this.installmentData.monthlyAmount || 0)),
      ScheduleStatus: 'Pending',
      Notes: ''
    });

    this.rowDialog = true;
  }

  openEditRowDialog(row: InstallmentSchedule): void {
    if (!this.isLoanActive) {
      this.notification.showToast('warn', 'This loan is closed / completed and is in view-only mode.');
      return;
    }
    this.isEditingRow = true;
    this.rowSubmitted = false;

    let dueDate = new Date();
    if (row.DueDate) dueDate = new Date(row.DueDate);

    let paymentStartDate: Date | null = null;
    const startVal = row.PaymentStartDate || (row as any).paymentStartDate;
    if (startVal) paymentStartDate = new Date(startVal);

    this.rowForm.patchValue({
      InstallmentScheduleId: row.InstallmentScheduleId,
      InstallmentId: this.installmentId,
      InstallmentNo: row.InstallmentNo,
      PaymentStartDate: paymentStartDate,
      DueDate: dueDate,
      OpeningBalance: row.OpeningBalance,
      ScheduledAmount: row.ScheduledAmount,
      Principal: row.Principal,
      Interest: row.Interest,
      InterestRate: row.InterestRate,
      ExtraCharges: row.ExtraCharges,
      ChargesDescription: row.ChargesDescription,
      ClosingBalance: row.ClosingBalance,
      ScheduleStatus: row.ScheduleStatus,
      Notes: row.Notes
    });

    this.rowDialog = true;
  }

  saveRow(): void {
    if (!this.isLoanActive) {
      this.notification.showToast('warn', 'This loan is closed / completed and is in view-only mode.');
      return;
    }
    this.rowSubmitted = true;
    if (this.rowForm.invalid) {
      return;
    }

    const formVal = this.rowForm.value;
    const dueStr = this.commonService.formatDate(new Date(formVal.DueDate));
    const startStr = formVal.PaymentStartDate ? this.commonService.formatDate(new Date(formVal.PaymentStartDate)) : null;

    const payload = {
      ...formVal,
      UserId: this.userId,
      InstallmentId: this.installmentId,
      DueDate: dueStr,
      PaymentStartDate: startStr
    };

    this.commonService.postData(this.COMMON_API + 'ScheduleInsert', payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.notification.showToast('success', res.message || 'Schedule row saved');
          this.rowDialog = false;
          this.loadSchedule(this.installmentId);
        } else {
          this.notification.showToast('warn', res.message || 'Failed to save row');
        }
      },
      error: (err) => {
        this.notification.showToast('error', err.message || 'Error saving row');
      }
    });
  }

  confirmDeleteRow(row: InstallmentSchedule): void {
    if (!this.isLoanActive) {
      this.notification.showToast('warn', 'This loan is closed / completed and is in view-only mode.');
      return;
    }
    this.confirmationService.confirm({
      message: `Delete Installment #${row.InstallmentNo} from schedule?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        const payload = {
          InstallmentScheduleId: row.InstallmentScheduleId,
          UserId: this.userId
        };

        this.commonService.postData(this.COMMON_API + 'ScheduleDelete', payload).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.notification.showToast('success', 'Schedule row deleted');
              this.loadSchedule(this.installmentId);
            } else {
              this.notification.showToast('warn', res.message || 'Delete failed');
            }
          },
          error: (err) => {
            this.notification.showToast('error', err.message || 'Error deleting row');
          }
        });
      }
    });
  }

  // ======================================================
  // Back Navigation
  // ======================================================
  backNav(): void {
    if (this.pageFrom === 'Dashboard') {
      this.commonService.router.navigate(['/']);
    } else {
      this.commonService.router.navigate(['/loans']);
    }
  }
}
