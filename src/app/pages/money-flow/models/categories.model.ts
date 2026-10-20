import { BaseClass } from "../common/model/base-class.model";

export interface Categories extends BaseClass {
    CategoryId: any;
    CategoryName: any;
    CategoryType: any;
    Frequency?: string | null;
    IsExcludeFromIncome?: boolean;
    isExcludeFromIncome?: boolean;
}
