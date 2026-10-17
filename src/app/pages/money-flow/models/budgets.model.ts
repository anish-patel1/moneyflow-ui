import { BaseClass } from "../common/model/base-class.model";

export interface Budgets extends BaseClass {
    BudgetId?: any;
    CategoryId?: any;
    CategoryName?: any;
    CategoryType?: any;
    Frequency?: any;
    BudgetYear?: any;
    BudgetMonth?: any;
    Year?: any;
    Month?: any;
    BudgetAmount?: any;
    ActualSpent?: any;
    Variance?: any;
}
