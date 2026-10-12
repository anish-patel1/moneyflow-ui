import { BaseClass } from "../common/model/base-class.model";

export interface Reports extends BaseClass {
  Year?: number;
  Month?: number;
  accountId?: number;
  accountName?: string;
  accountType?: string;
  openingBalance?: number;
  inflow?: number;
  outflow?: number;
  closingBalance?: number;
  netChange?: number;
}

export type AccountReconciliation = Reports;

export interface ReconciliationSummary {
  year: number;
  month: number;
  totalOpeningBalance: number;
  totalInflow: number;
  totalOutflow: number;
  netFlow: number;
  totalClosingBalance: number;
  savingsRate: number;
}

export interface CategoryReconciliation {
  categoryId: number;
  categoryName: string;
  transactionType: 'Income' | 'Expense';
  totalAmount: number;
  transactionCount: number;
}
