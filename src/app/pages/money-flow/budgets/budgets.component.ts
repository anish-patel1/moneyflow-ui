import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { CommonRefModule } from '../common/module/common-ref.module';
import { API } from '../apis/api-endpoints';
import { CommonService } from '../common/service/common.service';
import { NotificationService } from '../common/service/notification.service';
import { Budgets } from '../models/budgets.model';

@Component({
  selector: 'app-budgets',
  imports: [CommonModule, CommonRefModule],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.scss'
})
export class BudgetsComponent {
  BUDGETS_API = API.Budgets;
  CATEGORIES_API = API.Categories;

  // Grid Data
  budgetData: Budgets[] = [];
  categoriesList: any[] = [];
  isgridloading: boolean = false;

  // Period Navigation (similar to Dashboard and Reports)
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  selectedPeriodDate: Date = new Date();

  monthOptions = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 }
  ];

  // Dialog & Form
  addDialog: boolean = false;
  addForm!: UntypedFormGroup;
  submitted: boolean = false;
  editId: number | null = null;

  // Current User
  userId: any = null;

  // Menu
  items: MenuItem[] = [];
  selectedRowId: number | null = null;

  constructor(
    public commonService: CommonService,
    private notification: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.userId = this.commonService.GetUserData().userId;
    this.selectedPeriodDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);

    this.addForm = this.commonService.formBuilder.group({
      CategoryId: [null, Validators.required],
      BudgetAmount: [null, [Validators.required, Validators.min(0.01)]]
    });

    this.loadCategories();
    this.selectAll();
  }

  loadCategories() {
    let obj = { UserId: this.userId };
    this.commonService.postData(this.CATEGORIES_API + 'SelectAll', obj).subscribe({
      next: (data: any) => {
        this.categoriesList = (data || [])
          .filter((c: any) => c.categoryType === 'Expense' && (c.status === 'A' || c.status === 'Active' || !c.status))
          .map((c: any) => ({
            label: `${c.categoryName} (${c.frequency || 'Monthly'})`,
            value: c.categoryId,
            type: c.categoryType,
            frequency: c.frequency || 'Monthly'
          }));
      }
    });
  }

  get isCurrentMonth(): boolean {
    const now = new Date();
    return this.selectedYear === now.getFullYear() && this.selectedMonth === (now.getMonth() + 1);
  }

  prevMonth(): void {
    if (this.selectedMonth === 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.selectedPeriodDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    this.selectAll();
  }

  nextMonth(): void {
    if (this.selectedMonth === 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.selectedPeriodDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    this.selectAll();
  }

  onPeriodDateSelect(date: Date): void {
    if (!date) return;
    this.selectedYear = date.getFullYear();
    this.selectedMonth = date.getMonth() + 1;
    this.selectedPeriodDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    this.selectAll();
  }

  resetToCurrentMonth(): void {
    const now = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth() + 1;
    this.selectedPeriodDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    this.selectAll();
  }

  onFilterChange() {
    this.selectAll();
  }

  selectAll() {
    this.budgetData = [];
    this.isgridloading = true;

    let obj = <Budgets>{};
    obj.UserId = this.userId;
    obj.BudgetYear = this.selectedYear;
    obj.BudgetMonth = this.selectedMonth;
    obj.Year = this.selectedYear;
    obj.Month = this.selectedMonth;

    this.commonService.postData(this.BUDGETS_API + 'SelectAll', obj).subscribe({
      next: (data: any[]) => {
        this.isgridloading = false;
        this.budgetData = (data || []).map(b => (<Budgets>{
          BudgetId: b.budgetId ?? b.BudgetId,
          CategoryId: b.categoryId ?? b.CategoryId,
          CategoryName: b.categoryName ?? b.CategoryName,
          CategoryType: b.categoryType ?? b.CategoryType,
          Frequency: b.frequency ?? b.Frequency ?? 'Monthly',
          BudgetYear: b.budgetYear ?? b.BudgetYear,
          BudgetMonth: b.budgetMonth ?? b.BudgetMonth,
          Year: b.year ?? b.Year,
          Month: b.month ?? b.Month,
          BudgetAmount: b.budgetAmount ?? b.BudgetAmount,
          ActualSpent: b.actualSpent ?? b.ActualSpent,
          Variance: b.variance ?? b.Variance,
          Status: b.status ?? b.Status,
          UserId: b.userId ?? b.UserId
        }));
      },
      error: () => {
        this.isgridloading = false;
      }
    });
  }

  // Search & Frequency Grouping
  searchQuery: string = '';
  collapsedGroups = new Set<string>();

  frequencySequence = [
    { value: 'Monthly', label: 'Monthly (12x/yr)', icon: 'pi pi-calendar', color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10' },
    { value: 'Bimonthly', label: 'Bimonthly (Every 2 mo)', icon: 'pi pi-sync', color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10' },
    { value: 'Quarterly', label: 'Quarterly (Every 3 mo)', icon: 'pi pi-chart-pie', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' },
    { value: 'SixMonthly', label: 'Six-Monthly (Every 6 mo)', icon: 'pi pi-hourglass', color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10' },
    { value: 'Yearly', label: 'Yearly (Once/yr)', icon: 'pi pi-calendar-times', color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
    { value: 'OneTime', label: 'One-Time / Ad-hoc', icon: 'pi pi-tag', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' }
  ];

  toggleGroup(key: string) {
    if (this.collapsedGroups.has(key)) {
      this.collapsedGroups.delete(key);
    } else {
      this.collapsedGroups.add(key);
    }
  }

  isGroupCollapsed(key: string): boolean {
    return this.collapsedGroups.has(key);
  }

  expandAllGroups() {
    this.collapsedGroups.clear();
  }

  collapseAllGroups() {
    for (const f of this.frequencySequence) {
      this.collapsedGroups.add(f.value);
    }
    this.collapsedGroups.add('Other');
  }

  get groupedBudgets(): Array<{
    key: string;
    label: string;
    icon: string;
    color: string;
    items: Budgets[];
    totalBudget: number;
    totalActual: number;
    totalVariance: number;
    percent: number;
  }> {
    const q = (this.searchQuery || '').trim().toLowerCase();
    const result: any[] = [];

    for (const freq of this.frequencySequence) {
      const items = (this.budgetData || []).filter(b => {
        const bFreq = (b.Frequency || 'Monthly').toString().trim().toLowerCase();
        const matchesFreq = bFreq === freq.value.toLowerCase();
        if (!matchesFreq) return false;
        if (!q) return true;
        const name = (b.CategoryName || '').toLowerCase();
        return name.includes(q);
      });

      if (items.length > 0) {
        const totalBudget = items.reduce((sum, b) => sum + (Number(b.BudgetAmount) || 0), 0);
        const totalActual = items.reduce((sum, b) => sum + (Number(b.ActualSpent) || 0), 0);
        const totalVariance = items.reduce((sum, b) => sum + (Number(b.Variance) || 0), 0);
        const percent = totalBudget > 0 ? Math.min(100, Math.round((totalActual / totalBudget) * 100)) : (totalActual > 0 ? 100 : 0);

        result.push({
          key: freq.value,
          label: freq.label,
          icon: freq.icon,
          color: freq.color,
          items,
          totalBudget,
          totalActual,
          totalVariance,
          percent
        });
      }
    }

    // Capture any items with an unexpected frequency
    const knownKeys = this.frequencySequence.map(f => f.value.toLowerCase());
    const otherItems = (this.budgetData || []).filter(b => {
      const bFreq = (b.Frequency || 'Monthly').toString().trim().toLowerCase();
      if (knownKeys.includes(bFreq)) return false;
      if (!q) return true;
      const name = (b.CategoryName || '').toLowerCase();
      return name.includes(q);
    });

    if (otherItems.length > 0) {
      const totalBudget = otherItems.reduce((sum, b) => sum + (Number(b.BudgetAmount) || 0), 0);
      const totalActual = otherItems.reduce((sum, b) => sum + (Number(b.ActualSpent) || 0), 0);
      const totalVariance = otherItems.reduce((sum, b) => sum + (Number(b.Variance) || 0), 0);
      const percent = totalBudget > 0 ? Math.min(100, Math.round((totalActual / totalBudget) * 100)) : (totalActual > 0 ? 100 : 0);

      result.push({
        key: 'Other',
        label: 'Other / Custom Frequency',
        icon: 'pi pi-ellipsis-h',
        color: 'text-slate-600 dark:text-slate-400 bg-slate-500/10',
        items: otherItems,
        totalBudget,
        totalActual,
        totalVariance,
        percent
      });
    }

    return result;
  }

  // Summary Cards
  get selectedMonthLabel(): string {
    return this.monthOptions.find(m => m.value === this.selectedMonth)?.label ?? '';
  }

  get totalBudgeted(): number {
    return this.budgetData.reduce((sum, b) => sum + (Number(b.BudgetAmount) || 0), 0);
  }

  get totalActual(): number {
    return this.budgetData.reduce((sum, b) => sum + (Number(b.ActualSpent) || 0), 0);
  }

  get totalVariance(): number {
    return this.budgetData.reduce((sum, b) => sum + (Number(b.Variance) || 0), 0);
  }

  get overallPercent(): number {
    if (!this.totalBudgeted || this.totalBudgeted <= 0) return 0;
    return Math.min(100, Math.round((this.totalActual / this.totalBudgeted) * 100));
  }

  getProgressPercent(item: Budgets): number {
    const budget = Number(item.BudgetAmount) || 0;
    const actual = Number(item.ActualSpent) || 0;
    if (budget <= 0) return actual > 0 ? 100 : 0;
    return Math.min(100, Math.round((actual / budget) * 100));
  }

  getProgressColor(item: Budgets): string {
    const pct = this.getProgressPercent(item);
    if (pct > 90) return '#ef4444'; // Red (near/over limit)
    if (pct >= 75) return '#f59e0b'; // Amber warning
    return '#10b981'; // Green safe
  }

  openDialog() {
    this.editId = null;
    this.resetForm();
    this.addDialog = true;
  }

  openEditDialog(data: Budgets) {
    this.editId = data.BudgetId ?? null;
    this.resetForm();
    this.addForm.controls['CategoryId'].setValue(data.CategoryId);
    this.addForm.controls['BudgetAmount'].setValue(data.BudgetAmount);
    this.addDialog = true;
  }

  closeDialog() {
    this.editId = null;
    this.resetForm();
    this.addDialog = false;
  }

  resetForm() {
    this.addForm.reset();
    this.submitted = false;
  }

  btnSave() {
    if (this.addForm.valid) {
      let obj = <Budgets>{};
      obj = this.addForm.value;
      obj.BudgetId = this.editId;
      obj.UserId = this.userId;
      obj.BudgetYear = this.selectedYear;
      obj.BudgetMonth = this.selectedMonth;
      obj.Year = this.selectedYear;
      obj.Month = this.selectedMonth;
      obj.CreatedBy = this.userId;
      obj.UpdatedBy = this.userId;

      this.commonService.postData(this.BUDGETS_API + 'Insert', obj).subscribe({
        next: (res: any) => {
          this.notification.showToast('success', res.message || 'Budget saved');
          this.closeDialog();
          this.selectAll();
        },
        error: (err: any) => {
          this.notification.showToast('error', err.message || 'Failed to save budget');
        }
      });
    } else {
      this.submitted = true;
    }
  }

  btnAutoGenerate() {
    this.confirmationService.confirm({
      message: `Auto-generate budget rows for ${this.selectedMonthLabel} ${this.selectedYear} from all active categories based on their frequencies?`,
      header: 'Auto-Generate Budgets',
      icon: 'pi pi-bolt',
      acceptLabel: 'Generate',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        let obj = <Budgets>{};
        obj.UserId = this.userId;
        obj.BudgetYear = this.selectedYear;
        obj.BudgetMonth = this.selectedMonth;
        obj.Year = this.selectedYear;
        obj.Month = this.selectedMonth;
        obj.CreatedBy = this.userId;

        this.commonService.postData(this.BUDGETS_API + 'AutoGenerate', obj).subscribe({
          next: (res: any) => {
            this.notification.showToast('success', res.message || 'Budgets auto-generated');
            this.selectAll();
          },
          error: (err: any) => {
            this.notification.showToast('error', err.message || 'Failed to auto-generate budgets');
          }
        });
      }
    });
  }

  btnDelete(id: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this budget entry?',
      header: 'Confirm Delete',
      acceptLabel: 'Yes',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        let obj = <Budgets>{};
        obj.BudgetId = id;
        this.commonService.postData(this.BUDGETS_API + 'Delete', obj).subscribe({
          next: (res: any) => {
            this.notification.showToast('success', res.message || 'Budget deleted');
            this.selectAll();
          },
          error: (err: any) => {
            this.notification.showToast('error', err.message || 'Failed to delete');
          }
        });
      }
    });
  }

  openMenu(menu: any, event: Event, data: Budgets) {
    const id = data.BudgetId;
    this.selectedRowId = id ?? null;
    this.items = [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.openEditDialog(data)
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.btnDelete(id!)
      }
    ];
    menu.toggle(event);
  }
}
