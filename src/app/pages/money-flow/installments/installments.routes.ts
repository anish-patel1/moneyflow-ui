import { Routes } from "@angular/router";
import { InstallmentsComponent } from "./installments.component";
import { InstallmentDetailComponent } from "./installment-detail/installment-detail.component";

export default [
    { path: '', component: InstallmentsComponent },
    { path: 'loan-detail', component: InstallmentDetailComponent }
] as Routes;