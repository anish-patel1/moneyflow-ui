import { Component } from '@angular/core';
import { API } from '../apis/api-endpoints';
import { CommonModule } from '@angular/common';
import { CommonRefModule } from '../common/module/common-ref.module';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { CommonService } from '../common/service/common.service';
import { NotificationService } from '../common/service/notification.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { Transactions } from '../models/transactions.model';
import { Dropdown } from '../common/model/dropdown.model';
import { lastValueFrom } from 'rxjs';
import { Categories } from '../models/categories.model';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, CommonRefModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent {
  // API
  COMMON_API = API.Transactions;
  Account_API = API.Accounts;
  Category_API = API.Categories;
  
  // Select All Data
  selectAllData: any = [];
  transactionData: any = [];

  // Date Filter
  selectedDateRange: Date[] = [];

  // Loadeer
  isgridloading: boolean = false;
  isSaving: boolean = false;

  // For Add
  addDialog: boolean = false;
  addForm!: UntypedFormGroup;
  submitted: boolean = false;
  transactionDate: any = null;

  // For View
  viewDialog: boolean = false;
  viewData: any = null

  // Current User
  userId: any = null;

  // Dropdown Data
  accountData: any[] = [];
  categoryData: any[] = [];
  transactionTypeData = [
    { name: 'Income', value: 'Income' },
    { name: 'Expense', value: 'Expense' }
  ];

  // Menu Data
  items: MenuItem[] = [];
  selectedRowId: number | null = null;

  constructor(
    public commonService: CommonService,
    private notification: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.userId = this.commonService.GetUserData().userId;

    // Form Group
    this.addForm = this.commonService.formBuilder.group({
      AccountId: [null, Validators.required],
      TransactionDate: [null, Validators.required],
      TransactionType: [null, Validators.required],
      CategoryId: [null, Validators.required],
      Amount: [null, Validators.required],
      Description: [null]
    });

    this.setDefaultDateRange();
    this.selectAll();
  }

  // ======================================================
  // Search
  // ======================================================
  search(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
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
  // For Filter
  // ======================================================
  showFilterPanel = false;

  filter = {
    accountId: null,
    categoryId: null,
    transactionType: null
  };

  // Toggle Filter
  toggleFilterPanel() {
    this.showFilterPanel = !this.showFilterPanel;
    if (this.showFilterPanel) this.accountDrpdown();
  }

  // Clear Filter
  clearFilter() {
    this.filter = { accountId: null, categoryId: null, transactionType: null };
    this.applyFilter();
  }

  // Apply Filter
  applyFilter() {
    this.showFilterPanel = false;
    this.filterData();
  }

  // Filter Data
  filterData() {
    debugger;
    this.transactionData = this.selectAllData.filter((row: any) =>
      (!this.filter.accountId || row.accountId === this.filter.accountId) &&
      (!this.filter.transactionType || row.transactionType === this.filter.transactionType) &&
      (!this.filter.categoryId || row.categoryId === this.filter.categoryId)
    );
  }

  // ======================================================
  // Select All
  // ======================================================
  selectAll(fromDate?: any, toDate?: any) {
    this.selectAllData = [];
    this.transactionData = [];
    this.isgridloading = true;
    
    let obj = <Transactions>{};
    obj.UserId = this.userId;
    obj.FromDate = fromDate;
    obj.ToDate = toDate;

    this.commonService.postData(this.COMMON_API + "SelectAll", obj).subscribe({
      next: (data: any) => {
        this.isgridloading = false;
        this.selectAllData = data;
        this.transactionData = data.map((item: any) => ({
          ...item,
          amount: Number(item.amount).toFixed(2)
        }));
      }
    });
  }

  // ======================================================
  // Insert
  // ======================================================

  // Open Add Drawer
  openDialog() {
    this.editId = null;
    this.resetForm();
    this.accountDrpdown();
    this.addDialog = true;
  }

  // Insert
  btnSave() {
    if (this.addForm.valid) {
      let obj = <Transactions>{};
      obj = this.addForm.value;
      obj.TransactionDate = this.transactionDate;
      obj.UserId = this.userId;
      obj.CreatedBy = this.userId;

      this.isSaving = true;

      this.commonService.postData(this.COMMON_API + "Insert", obj).subscribe({
        next: (data: any) => {
            this.isSaving = false;
            this.notification.showToast("success", data.message);
            this.closeDialog();
            this.selectAll();
          },
          error: (err) => {
            this.isSaving = false;
            this.notification.showToast("error", err.message);
          }
        });
    } else this.submitted = true;
  }

  // Close Add Dialog
  closeDialog() {
    this.editId = null;
    this.resetForm();
    this.addDialog = false;
  }

  // ======================================================
  // Update
  // ======================================================
  editId: any = null;
  openEditDialog(id: any) {
    this.editId = id;
    this.resetForm();
    this.accountDrpdown();
    this.addDialog = true;
    this.fillControl(id);
  }

  // Get Select Data
  fillControl(id: any) {
    this.commonService.getData(this.COMMON_API + "Select?id=" + id).subscribe({
      next: (response: any) => {
        if (!response || response.length === 0) {
          this.notification.showToast('warning', 'Transaction not found');
          return;
        }

        const data = response[0];

        this.transactionDate = data.transactionDate;
        const dateObject = new Date(this.transactionDate);

        this.categoryDrpdown(data.transactionType);

        this.addForm.patchValue({
          TransactionDate: dateObject,
          AccountId: data.accountId,
          TransactionType: data.transactionType,
          CategoryId: data.categoryId,
          Amount: data.amount,
          Description: data.description
        });
      },
      error: (err) => {
        this.notification.showToast("error", err.message);
      },
    });
  }

  // Update
  btnUpdate() {
    if (this.addForm.valid) {
      let obj = <Transactions>{};
      obj = this.addForm.value;
      obj.TransactionDate = this.transactionDate;
      obj.TransactionId = this.editId;
      obj.UserId = this.userId;

      this.isSaving = true;

      this.commonService.postData(this.COMMON_API + "Update", obj).subscribe({
      next: (data: any) => {
          this.isSaving = false;
          this.notification.showToast("success", data.message);
          this.closeDialog();
          this.selectAll();
        },
        error: (err) => {
          this.isSaving = false;
          this.notification.showToast("error", err.message);
        }
      });
    } else this.submitted = true;
  }

  // ======================================================
  // Delete
  // ======================================================

  // Open Delete Confirmation
  btnDelete(id: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this item?',
      header: 'Confirm Delete',
      acceptLabel: 'Yes',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.btnDeleteClick(id);
      }
    });
  }

  btnDeleteClick(id: any) {
    let obj = <Transactions>{};
    obj.TransactionId = id;
    obj.UserId = this.userId;

    // this.loader = true;
    this.commonService.postData(this.COMMON_API + "Delete", obj).subscribe({
      next: (data: any) => {
        this.notification.showToast("success", data.message);
        this.selectAll();
      },
      error: (err) => {
        this.notification.showToast("error", err.message);
      },
    });
  }

  // ======================================================
  // Dropdown
  // ======================================================

  // Account Dropdown
  async accountDrpdown() {
    this.accountData = [];
    if (this.userId) {
      let obj = <Dropdown>{};
      obj.UserId = this.userId;
      const response = await lastValueFrom(
        this.commonService.postData(this.Account_API + "DropDown", obj)
      );

      this.accountData = response;
    }
  }

  // Change : Transaction Type
  async changeTransactionType(event: any) {
    const selectedValue = event.value;

    if (selectedValue) this.categoryDrpdown(selectedValue);
    else this.addForm.controls['CategoryId'].setValue(null);
  }

  // Category Dropdown
  async categoryDrpdown(type: any) {
    this.categoryData = [];
    if (this.userId) {
      let obj = <Categories>{};
      obj.UserId = this.userId;
      obj.CategoryType = type;
      const response = await lastValueFrom(
        this.commonService.postData(this.Category_API + "DropDown", obj)
      );

      this.categoryData = response;
    }
  }

  // ======================================================
  // Get Formatted Date 
  // ======================================================
  onDateSelect(date: Date): void {
    const fDate = this.commonService.formatDate(date);
    this.transactionDate = fDate;
  }

  // ======================================================
  // Reset Form
  // ======================================================

  resetForm() {
    this.addForm.reset();
    this.submitted = false;
  }

  // ======================================================
  // For Menu
  // ======================================================
  openMenu(menu: any, event: Event, id: number) {
    this.selectedRowId = id;

    this.setMenuItems();
    menu.toggle(event);
  }

  setMenuItems() {
    this.items = [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.openEditDialog(this.selectedRowId!)
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.btnDelete(this.selectedRowId!)
      }
    ];
  }
}
