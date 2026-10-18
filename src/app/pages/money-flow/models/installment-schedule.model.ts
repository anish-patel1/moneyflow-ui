import { BaseClass } from "../common/model/base-class.model";

export interface InstallmentSchedule extends Partial<BaseClass> {
    InstallmentScheduleId?: any;
    InstallmentId?: any;
    InstallmentNo?: any;
    DueDate?: any;
    DueDateFormatted?: any;
    OpeningBalance?: any;
    ScheduledAmount?: any;
    Principal?: any;
    Interest?: any;
    InterestRate?: any;
    ExtraCharges?: any;
    ChargesDescription?: any;
    ClosingBalance?: any;
    ScheduleStatus?: any; // 'Pending' | 'Done' | 'Partially Paid' | 'Skipped'
    PaidDate?: any;
    PaidDateFormatted?: any;
    PaidAmount?: any;
    TransactionId?: any;
    Notes?: any;

    // Related Properties
    AccountId?: any;
    AccountName?: any;

    // For bulk generation payload
    ScheduleJson?: any;
}
