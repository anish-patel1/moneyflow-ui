import { BaseClass } from "../common/model/base-class.model";

export interface Installments extends BaseClass {
    InstallmentId: any;
    InstallmentName: any;
    TotalAmount: any;
    DurationMonths: any;
    MonthlyAmount: any;
    StartDate: any;
    BillingDay: any;
    Description: any;
    PaidMonths: any;
    RemainingMonths: any;
}