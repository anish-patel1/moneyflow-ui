import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AccountsComponent } from "./accounts/accounts.component";
import { CategoriesComponent } from "./categories/categories.component";
import { TransactionsComponent } from "./transactions/transactions.component";
import { BudgetsComponent } from "./budgets/budgets.component";
import { InstallmentsComponent } from "./installments/installments.component";
import { ReportsComponent } from "./reports/reports.component";

export default [
    { path: '', component: DashboardComponent },
    { path: 'admin', loadChildren: () => import('./admin/admin.routes') },
    { path: 'accounts', component: AccountsComponent },
    { path: 'categories', component: CategoriesComponent },
    { path: 'transactions', component: TransactionsComponent },
    { path: 'budgets', component: BudgetsComponent },
    { path: 'installments', component: InstallmentsComponent },
    { path: 'reports', component: ReportsComponent },
] as Routes;