import { BaseClass } from "../common/model/base-class.model";

export interface Transactions extends BaseClass {
    TransactionId: any;
    AccountId: any;
    AccountName: any;
    CategoryId: any;
    CategoryName: any;
    InstallmentId: any;
    TransactionDate: any;
    Amount: any;
    TransactionType: any;
    Description: any;
    PageSize: any;
}