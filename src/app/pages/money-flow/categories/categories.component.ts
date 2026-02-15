import { Component } from '@angular/core';
import { API } from '../apis/api-endpoints';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { CommonService } from '../common/service/common.service';
import { NotificationService } from '../common/service/notification.service';
import { CommonModule } from '@angular/common';
import { CommonRefModule } from '../common/module/common-ref.module';
import { Table } from 'primeng/table';
import { Categories } from '../models/categories.model';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, CommonRefModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent {
  // API
  COMMON_API = API.Categories;

  // Select All Data
  categoryData: any = [];

  // Loadeer
  isgridloading: boolean = false;

  // For Add
  addDialog: boolean = false;
  addForm!: UntypedFormGroup;
  submitted: boolean = false;

  // Dropdown Data
  categoryTypeData = [
    { name: 'Income', value: 'Income' },
    { name: 'Expense', value: 'Expense' }
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
      CategoryName: ['', Validators.required],
      CategoryType: [null, Validators.required]
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
    this.categoryData = [];
    this.isgridloading = true;
    
    let obj = <Categories>{};
    obj.UserId = this.userId;

    this.commonService.postData(this.COMMON_API + "SelectAll", obj).subscribe({
      next: (data: any) => {
        this.isgridloading = false;
        this.categoryData = data;
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
      let obj = <Categories>{};
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
        this.addForm.controls['CategoryName'].setValue(data[0].categoryName);
        this.addForm.controls['CategoryType'].setValue(data[0].categoryType);
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
      let obj = <Categories>{};
      obj = this.addForm.value;
      obj.CategoryId = this.editId;
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
    let obj = <Categories>{};
    obj.CategoryId = id;

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
