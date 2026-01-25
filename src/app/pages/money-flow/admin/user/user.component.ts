import { Component } from '@angular/core';
import { Admin_API } from '../admin-api';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { CommonService } from '../../common/service/common.service';
import { NotificationService } from '../../common/service/notification.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { User } from '../model/user.model';
import { CommonModule } from '@angular/common';
import { CommonRefModule } from '../../common/module/common-ref.module';

@Component({
  selector: 'app-user',
  imports: [CommonModule, CommonRefModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {
  // API
  COMMON_API = Admin_API.User_API;

  // Select All Data
  userData: any = [];

  // Loadeer
  isgridloading: boolean = false;

  // For Add
  addDialog: boolean = false;
  addForm!: UntypedFormGroup;
  submitted: boolean = false;

  // For View
  viewDialog: boolean = false;
  viewData: any = null

  // Current User
  userId: any = null;

  // Menu Data
  items: MenuItem[] = [];
  selectedRowId: number | null = null;
  userName: any = null;
  userStatus: any = null;

  constructor(
    public commonService: CommonService,
    private notification: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.userId = this.commonService.GetUserData().userId;

    // For Group
    this.addForm = this.commonService.formBuilder.group({
      UserName: ['', Validators.required],
      UserDisplayName: ['', Validators.required],
      Password: ['', Validators.required]
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
    this.userData = [];
    this.isgridloading = true;

    let obj = <User>{};
    obj.UserId = this.userId;

    this.commonService.postData(this.COMMON_API + "SelectAll", obj).subscribe({
      next: (data: any) => {
        this.isgridloading = false;
        this.userData = data;
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
      let obj = <User>{};
      obj = this.addForm.value;
      obj.CreatedBy = this.userId;

      this.commonService.postData(this.COMMON_API + "Insert", obj).subscribe({
      next: (data: any) => {
          this.notification.showToast("success", data.message);
          this.closeDialog();
          this.selectAll();
        },
        error: (err) => {
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
  // View
  // ======================================================
  btnView(id: any) {
    this.viewDialog = true;
    this.fillControl(id, 'view');
  }

  // ======================================================
  // Update
  // ======================================================
  editId: any = null;
  openEditDialog(id: any) {
    this.editId = id;
    this.resetForm();
    this.addDialog = true;
    this.fillControl(id, 'edit');
  }

  // Get Select Data
  fillControl(id: any, action: any) {
    this.commonService.getData(this.COMMON_API + "Select?id=" + id).subscribe({
      next: (data: any) => {
        if (action === 'view') this.viewData = data[0];
        else {
          this.addForm.controls['UserName'].setValue(data[0].userName);
          this.addForm.controls['UserDisplayName'].setValue(data[0].userDisplayName);
          this.addForm.controls['Password'].setValue(data[0].password);
        }
      },
      error: (err) => {
        this.notification.showToast("error", err.message);
      },
    });
  }

  // Update
  btnUpdate() {
    if (this.addForm.valid) {
      let obj = <User>{};
      obj = this.addForm.value;
      obj.UserId = this.editId;
      obj.UpdatedBy = this.userId;

      this.commonService.postData(this.COMMON_API + "Update", obj).subscribe({
      next: (data: any) => {
          this.notification.showToast("success", data.message);
          this.closeDialog();
          this.selectAll();
        },
        error: (err) => {
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
    let obj = <User>{};
    obj.UserId = id;

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
  // Update Status
  // ======================================================

  updateStatus(id: any, status: any) {
    let obj = <User>{};
    obj.UserId = id;
    obj.Status = status;

    this.commonService.postData(this.COMMON_API + "UpdateStatus", obj).subscribe({
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
  // Reset Form
  // ======================================================

  resetForm() {
    this.addForm.reset();
    this.submitted = false;
  }

  // ======================================================
  // For Menu
  // ======================================================
  openMenu(menu: any, event: Event, id: number, name: any, status: any) {
    this.selectedRowId = id;
    this.userName = name;
    this.userStatus = status;

    this.setMenuItems();

    menu.toggle(event);
  }

  setMenuItems() {
    this.items = [
      {
        label: 'View',
        icon: 'pi pi-eye',
        command: () => this.btnView(this.selectedRowId!)
      },
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        visible: this.userStatus === 'A',
        command: () => this.openEditDialog(this.selectedRowId!)
      },
      {
        label: 'Active',
        icon: 'pi pi-user-plus',
        visible: this.userStatus === 'I',
        command: () => this.updateStatus(this.selectedRowId!, 'A')
      },
      {
        label: 'Inactive',
        icon: 'pi pi-user-minus',
        visible: this.userStatus === 'A',
        command: () => this.updateStatus(this.selectedRowId!, 'I')
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        visible: this.userStatus !== 'D',
        command: () => this.btnDelete(this.selectedRowId!)
      },
      {
        label: 'Activity Log',
        icon: 'pi pi-history',
        routerLink: ['./user-log'],
        queryParams: { userId: this.selectedRowId! }
      }
    ];
  }
}
