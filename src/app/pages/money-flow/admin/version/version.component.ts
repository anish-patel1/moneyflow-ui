import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CommonRefModule } from '../../common/module/common-ref.module';
import { Admin_API } from '../admin-api';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { CommonService } from '../../common/service/common.service';
import { NotificationService } from '../../common/service/notification.service';
import { ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Version } from '../model/version.model';

@Component({
  selector: 'app-version',
  imports: [CommonModule, CommonRefModule],
  templateUrl: './version.component.html',
  styleUrl: './version.component.scss'
})
export class VersionComponent {
  // API
  COMMON_API = Admin_API.Version_API;

  // Select All Data
  versionData: any = [];

  // Loadeer
  isgridloading: boolean = false;

  // For Add
  addDialog: boolean = false;
  addForm!: UntypedFormGroup;
  submitted: boolean = false;
  releaseDate: any = null;

  // Current User
  userId: any = null;

  constructor(
    public commonService: CommonService,
    private notification: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.userId = this.commonService.GetUserData().userId;

    // For Group
    this.addForm = this.commonService.formBuilder.group({
      ReleaseDate: ['', Validators.required],
      Version: ['', Validators.required],
      Details: ['', Validators.required]
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
    this.versionData = [];
    this.isgridloading = true;

    let obj = <Version>{};
    obj.UserId = this.userId;

    this.commonService.postData(this.COMMON_API + "SelectAll", obj).subscribe({
      next: (data: any) => {
        this.isgridloading = false;
        this.versionData = data;
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
      let obj = <Version>{};
      obj = this.addForm.value;
      obj.ReleaseDate = this.releaseDate;
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
    this.commonService.getData(this.COMMON_API + "Select?id=" + id).subscribe({
      next: (data: any) => {
        this.releaseDate = data[0].releaseDate;
        const dateObject = new Date(this.releaseDate);

        this.addForm.patchValue({
          ReleaseDate: dateObject
        });
        this.addForm.controls['Version'].setValue(data[0].version);
        this.addForm.controls['Details'].setValue(data[0].details);
      },
      error: (err) => {
        this.notification.showToast("error", err.message);
      },
    });
  }

  // Update
  btnUpdate() {
    if (this.addForm.valid) {
      let obj = <Version>{};
      obj = this.addForm.value;
      obj.ReleaseDate = this.releaseDate;
      obj.VersionId = this.editId;
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
    let obj = <Version>{};
    obj.VersionId = id;

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
  // Get Formatted Date 
  // ======================================================
  onDateSelect(date: Date): void {
    const fDate = this.commonService.formatDate(date);
    this.releaseDate = fDate;
  }

  // ======================================================
  // Reset Form
  // ======================================================

  resetForm() {
    this.addForm.reset();
    this.submitted = false;
  }
}
