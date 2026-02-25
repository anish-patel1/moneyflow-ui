import { BaseClass } from "../common/model/base-class.model";

export interface Transfer extends BaseClass {
    TransferGroupId: any;
    FromAccountId: any;
    ToAccountId: any;
    Amount: any;
    TransferDate: any;
    Description: any;
}