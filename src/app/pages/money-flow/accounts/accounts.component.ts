import { Component } from '@angular/core';
import { API } from '../apis/api-endpoints';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { CommonService } from '../common/service/common.service';
import { NotificationService } from '../common/service/notification.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { Accounts } from '../models/accounts.model';
import { CommonModule } from '@angular/common';
import { CommonRefModule } from '../common/module/common-ref.module';

@Component({
  selector: 'app-accounts',
  imports: [CommonModule, CommonRefModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss'
})
export class AccountsComponent {
  // API
  COMMON_API = API.Accounts;

  // Select All Data
  accountData: any = [];

  // Loadeer
  isgridloading: boolean = false;

  // For Add
  addDialog: boolean = false;
  addForm!: UntypedFormGroup;
  submitted: boolean = false;

  // Dropdown Data
  accountTypeData = [
    { name: 'Cash', value: 'Cash' },
    { name: 'Bank', value: 'Bank' },
    { name: 'FD', value: 'FD' }
  ];

  // Current User
  userId: any = null;

  // Menu Data
  items: MenuItem[] = [];
  selectedRowId: number | null = null;
  accountStatus: any = null;

  constructor(
    public commonService: CommonService,
    private notification: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.userId = this.commonService.GetUserData().userId;

    // For Group
    this.addForm = this.commonService.formBuilder.group({
      AccountName: ['', Validators.required],
      AccountType: [null, Validators.required]
    });

    this.selectAll();
  }

  // ======================================================
  // Search
  // ======================================================
  search(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // ======================================================
  // Select All
  // ======================================================
  selectAll() {
    this.accountData = [];
    this.isgridloading = true;
    
    let obj = <Accounts>{};
    obj.UserId = this.userId;

    this.commonService.postData(this.COMMON_API + "SelectAll", obj).subscribe({
      next: (data: any) => {
        this.isgridloading = false;
        this.accountData = data;
      }
    });
  }

  // ======================================================
  // Insert
  // ======================================================

  // Open Add Dialog
  openDialog() {
    this.editId = null;
    this.resetForm();
    this.addDialog = true;
  }

  // Insert
  btnSave() {
    if (this.addForm.valid) {
      let obj = <Accounts>{};
      obj = this.addForm.value;
      obj.UserId = this.userId;
      obj.CreatedBy = this.userId;

      this.commonService.postData(this.COMMON_API + "Insert", obj).subscribe({
      next: (data: any) => {
          // this.loader = false;
          this.notification.showToast("success", data.message);
          this.closeDialog();
          this.selectAll();
        },
        error: (err) => {
          // this.loader = false;
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
    this.addDialog = true;
    this.fillControl(id);
  }

  // Get Select Data
  fillControl(id: any) {
    // this.loader = true;
    this.commonService.getData(this.COMMON_API + "Select?id=" + id).subscribe({
      next: (data: any) => {
        // this.loader = false;
        this.addForm.controls['AccountName'].setValue(data[0].accountName);
        this.addForm.controls['AccountType'].setValue(data[0].accountType);
      },
      error: (err) => {
        // this.loader = false;
        this.notification.showToast("error", err.message);
      },
    });
  }

  // Update
  btnUpdate() {
    if (this.addForm.valid) {
      let obj = <Accounts>{};
      obj = this.addForm.value;
      obj.AccountId = this.editId;
      obj.UpdatedBy = this.userId;

      this.commonService.postData(this.COMMON_API + "Update", obj).subscribe({
      next: (data: any) => {
          // this.loader = false;
          this.notification.showToast("success", data.message);
          this.closeDialog();
          this.selectAll();
        },
        error: (err) => {
          // this.loader = false;
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
    let obj = <Accounts>{};
    obj.AccountId = id;

    // this.loader = true;
    this.commonService.postData(this.COMMON_API + "Delete", obj).subscribe({
      next: (data: any) => {
        // this.loader = false;
        this.notification.showToast("success", data.message);
        this.selectAll();
      },
      error: (err) => {
        // this.loader = false;
        this.notification.showToast("error", err.message);
      },
    });
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
  openMenu(menu: any, event: Event, id: number, status: any) {
    this.selectedRowId = id;
    this.accountStatus = status;

    this.setMenuItems();

    menu.toggle(event);
  }

  setMenuItems() {
    this.items = [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        visible: this.accountStatus === 'A',
        command: () => this.openEditDialog(this.selectedRowId!)
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        visible: this.accountStatus !== 'D',
        command: () => this.btnDelete(this.selectedRowId!)
      }
    ];
  }
}
