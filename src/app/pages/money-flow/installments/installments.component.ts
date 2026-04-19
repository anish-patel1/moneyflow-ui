import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CommonRefModule } from '../common/module/common-ref.module';
import { API } from '../apis/api-endpoints';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { CommonService } from '../common/service/common.service';
import { NotificationService } from '../common/service/notification.service';
import { Table } from 'primeng/table';
import { Installments } from '../models/installments.model';

@Component({
  selector: 'app-installments',
  imports: [CommonModule, CommonRefModule],
  templateUrl: './installments.component.html',
  styleUrl: './installments.component.scss'
})
export class InstallmentsComponent {
  // API
  COMMON_API = API.Installments;

  // Select All Data
  installmentData: any = [];

  // Loadeer
  isgridloading: boolean = false;

  // For Add
  addDialog: boolean = false;
  addForm!: UntypedFormGroup;
  submitted: boolean = false;
  startDate: any = null;

  // Current User
  userId: any = null;
  selectedStatus: string = 'A';

  // Menu Data
  items: MenuItem[] = [];
  selectedRowId: number | null = null;
  emiStatus: any = null;

  constructor(
    public commonService: CommonService,
    private notification: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.userId = this.commonService.GetUserData().userId;

    // For Group
    this.addForm = this.commonService.formBuilder.group({
      InstallmentName: [null, Validators.required],
      TotalAmount: [null, Validators.required],
      DurationMonths: [null, Validators.required],
      MonthlyAmount: [0],
      EnableInitialPaid: [false],
      InitialPaidMonths: [null],
      StartDate: [null, Validators.required],
      BillingDay: [null, Validators.required],
      Description: [null]
    });

    this.addForm.get('TotalAmount')?.valueChanges.subscribe(() => this.calculateEmi());
    this.addForm.get('DurationMonths')?.valueChanges.subscribe((duration) => {
      this.calculateEmi();

      const initialPaidControl = this.addForm.get('InitialPaidMonths');

      if (this.addForm.get('EnableInitialPaid')?.value) {
        initialPaidControl?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(duration || 999)
        ]);

        initialPaidControl?.updateValueAndValidity();
      }
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
  // Change Status
  // ======================================================
  changeStatus(status: string) {
    this.selectedStatus = status;
    this.selectAll();
  }

  // ======================================================
  // Select All
  // ======================================================
  selectAll() {
    this.installmentData = [];
    this.isgridloading = true;
    
    let obj = <Installments>{};
    obj.UserId = this.userId;
    obj.Status = this.selectedStatus;

    this.commonService.postData(this.COMMON_API + "SelectAll", obj).subscribe({
      next: (data: any) => {
        this.isgridloading = false;
        this.installmentData = data;
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
      let obj = <Installments>{};
      obj = this.addForm.value;
      obj.UserId = this.userId;
      obj.CreatedBy = this.userId;

      this.commonService.postData(this.COMMON_API + "Insert", obj).subscribe({
        next: (data: any) => {
          if (data.success) {
            this.notification.showToast("success", data.message);
            this.closeDialog();
            this.selectAll();
          } else
            this.notification.showToast("warn", data.message);
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
      next: (response: any) => {
        if (!response || response.length === 0) {
          this.notification.showToast('warning', 'Installment record not found');
          return;
        }

        const data = response[0];

        this.startDate = data.startDate;
        const dateObject = new Date(this.startDate);
        debugger;
        this.addForm.patchValue({
          InstallmentName: data.installmentName,
          TotalAmount: data.totalAmount,
          DurationMonths: data.durationMonths,
          MonthlyAmount: data.monthlyAmount,
          EnableInitialPaid: data.initialPaidMonths > 0 ? true : false,
          InitialPaidMonths: data.initialPaidMonths,
          StartDate: dateObject,
          BillingDay: data.billingDay,
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
      let obj = <Installments>{};
      obj = this.addForm.value;
      obj.InstallmentId = this.editId;
      obj.UpdatedBy = this.userId;

      this.commonService.postData(this.COMMON_API + "Update", obj).subscribe({
        next: (data: any) => {
          if (data.success) {
            this.notification.showToast("success", data.message);
            this.closeDialog();
            this.selectAll();
          } else
            this.notification.showToast("warn", data.message);
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
    let obj = <Installments>{};
    obj.InstallmentId = id;
    obj.UserId = this.userId;

    this.commonService.postData(this.COMMON_API + "Delete", obj).subscribe({
      next: (data: any) => {
        if (data.success) {
          this.notification.showToast("success", data.message);
          this.selectAll();
        } else
            this.notification.showToast("warn", data.message);
      },
      error: (err) => {
        this.notification.showToast("error", err.message);
      },
    });
  }

  // ======================================================
  // Estimate EMI calculation
  // ======================================================
  calculateEmi() {
    const total = this.addForm.get('TotalAmount')?.value || 0;
    const months = this.addForm.get('DurationMonths')?.value || 0;

    let estimatedEMI = 0;
    if (total > 0 && months > 0)
      estimatedEMI = total / months;

    this.addForm.get('MonthlyAmount')?.setValue(estimatedEMI, { emitEvent: false });
  }

  // ======================================================
  // Change Event
  // ======================================================
  changeInitialPaidToggle(event: any) {
    const isEnable = event.checked;
    const duration = this.addForm.get('DurationMonths')?.value;

    if (isEnable) {
      if (!duration) {
        this.addForm.patchValue({
          EnableInitialPaid: false,
          InitialPaidMonths: null
        });
        
        this.notification.showToast("info", "Please enter duration first");
        this.addForm.patchValue({ EnableInitialPaid: false });
        return;
      }

      this.addForm.get('InitialPaidMonths')?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(duration)
      ]);
    } else {
      this.addForm.patchValue({
        InitialPaidMonths: null
      });

      const control = this.addForm.get('InitialPaidMonths');
      control?.clearValidators();
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    }

    this.addForm.get('InitialPaidMonths')?.updateValueAndValidity();
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
    this.emiStatus = status;

    this.setMenuItems();

    menu.toggle(event);
  }

  setMenuItems() {
    this.items = [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        visible: this.emiStatus === 'A',
        command: () => this.openEditDialog(this.selectedRowId!)
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        visible: this.emiStatus === 'A',
        command: () => this.btnDelete(this.selectedRowId!)
      }
    ];
  }
}
