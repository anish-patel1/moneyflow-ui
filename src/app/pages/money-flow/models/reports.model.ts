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
  externalInflow?: number;
  externalOutflow?: number;
  transferIn?: number;
  transferOut?: number;
  closingBalance?: number;
  netChange?: number;
  transactionCount?: number;
}

export type AccountReconciliation = Reports;

export interface ReconciliationSummary {
  year: number;
  month: number;
  totalOpeningBalance: number;
  totalInflow: number;
  totalOutflow: number;
  totalTransfers: number;
  totalAccountInflow: number;
  totalAccountOutflow: number;
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
  isExcludeFromIncome?: boolean;
}

export interface YearAtAGlanceItem {
  categoryId: number;
  categoryName: string;
  frequency: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
  totalAmount: number;
  monthlyAverage: number;
}

export interface SavingsSummaryItem {
  month: number;
  monthName: string;
  income: number;
  expense: number;
  transfers: number;
  netSavings: number;
  savingsRate: number;
  cumulativeSavings: number;
}

export interface YearAtAGlanceSummary {
  totalAnnualExpense: number;
  topCategoryName: string;
  topCategoryAmount: number;
  monthlyAverageExpense: number;
  monthTotals: { [key: string]: number };
}

export interface AnnualSavingsKPISummary {
  totalAnnualIncome: number;
  totalAnnualExpense: number;
  totalAnnualTransfers: number;
  netAnnualSavings: number;
  annualSavingsRate: number;
  peakMonthName: string;
  peakMonthSavings: number;
}
