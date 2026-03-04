import { BaseClass } from "../common/model/base-class.model";

export interface DashboardSummary extends BaseClass {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    netFlow: number;
}