# MoneyFlow UI

MoneyFlow UI is the Angular frontend for the **MoneyFlow Personal Finance Management System**.

It provides a clean, responsive, and intuitive interface to manage **accounts, categories, transactions, transfers, budgets, and financial summaries** with modern dashboard visualizations.

The UI communicates with the MoneyFlow API to deliver real-time insights into personal cash flow, spending limits, and category budgets.

---

# 🚀 Tech Stack

### Frontend
- **Angular 19** (Standalone Components, Signals, Reactive Forms)
- **TypeScript** (Strict Typing & clean PascalCase models)
- **RxJS**
- **PrimeNG** (Dialogs, Tables, Inputs, Progress Bars, Steppers, Menus)
- **TailwindCSS** (Utility-first styling, responsive layouts)

### Planned
- **Chart.js** (Analytics dashboard & visualizations)
- **Financial Reports & Exports**

---

# 📌 Features

### Dashboard
- Total Balance overview across all active accounts
- Monthly Income & Expense summaries
- Net Cash Flow indicator with directional trend
- Recent Transactions widget with quick navigation

### Accounts
- Create, edit, and manage Cash, Bank, and Fixed Deposit accounts
- Real-time balance updates reflecting all deposits, expenses, and transfers

### Categories
- Create and organize income and expense categories
- Frequency configuration (`Monthly`, `Bimonthly`, `Quarterly`, `SixMonthly`, `Yearly`, `OneTime`) for automated budgeting
- System categories used for internal operations (e.g., transfers)

### Transactions
- Add, edit, and delete transactions
- Full-text search and category/account filters
- Custom date range filtering
- Automatic account balance synchronization

### Transfers
- Transfer funds between accounts with atomic double-entry transaction logic
- Visual presentation as `Account A → Account B`
- Integrated transfer dialog with real-time balance checks

### Budgets
- **Frequency Grouping**: Category budgets grouped in sequence (`Monthly`, `Bimonthly`, `Quarterly`, `SixMonthly`, `Yearly`, `OneTime`) matching category creation
- **Period Stepper Navigation**: Month/Year stepper pill (`[ ◀ ] [ Month/Year Picker ] [ ▶ ] [ ↺ ]`) aligned to the header matching Dashboard and Reports
- **Expand / Collapse Controls**: Segmented pill button with open/closed group counter badges
- **Spending Progress Tracking**: Visual progress bars with dynamic status indicators (On Track, Warning, Exceeded)
- **Live Search**: Instant client-side filtering across category names and frequency groups
- **Auto-Generation**: One-click generation of budgets copied forward from the previous month/year
- **Refined UX**: Unified confirmation modals, responsive cards, and clean empty state

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── core/                  # Core services, interceptors, guards
│   ├── pages/
│   │   └── money-flow/        # Feature modules
│   │       ├── dashboard/     # Executive financial dashboard
│   │       ├── accounts/      # Account management
│   │       ├── categories/    # Category management & frequencies
│   │       ├── transactions/  # Transaction log & filters
│   │       ├── budgets/       # Frequency-grouped budget planning & stepper
│   │       ├── installments/  # Installment & EMI tracking (Upcoming)
│   │       ├── reports/       # Reports & analytics (Upcoming)
│   │       ├── models/        # Strongly typed TypeScript interfaces
│   │       ├── apis/          # Feature API service integrations
│   │       └── money-flow.routes.ts
│   ├── services/              # Shared application services
│   └── shared/                # Reusable UI components & pipes
├── assets/                    # Static assets & icons
└── styles.css                 # Global styles & Tailwind layers
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- Angular CLI 19+

---

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
ng serve

# Build for production
ng build --configuration=production
```

Navigate to `http://localhost:4200/` in your browser.

---

## 📈 Project Status

### Phase 1 – Core Financial System

| Module | Status | Description |
|------|------|-------------|
| Dashboard | ✅ Completed | Financial summary cards and recent transactions feed |
| Accounts | ✅ Completed | Manage financial accounts, account types, and balances |
| Categories | ✅ Completed | Income and expense categories with frequency settings |
| Transactions | ✅ Completed | Add, edit, delete, search, and filter transactions |
| Transfers | ✅ Completed | Inter-account fund transfers via double-entry logic |
| Budgets | ✅ Completed | Frequency-grouped budget cards, period stepper navigation, auto-generation, progress tracking |
| Installments (EMI) | 📌 Planned (Next Phase) | Track installment loans, EMIs, and recurring obligations |
| Reports | 📌 Planned | Comprehensive financial reports and data exports |
| Charts & Analytics | 📌 Planned | Visual spending charts and monthly category trends |

---

## 📷 Screenshots

### Dashboard
<img width="1920" height="1020" alt="Dashboard" src="https://github.com/user-attachments/assets/5aaced22-c918-45d9-a07b-14c1ae0e6e55" />

### Transactions
<img width="1920" height="1020" alt="Transactions" src="https://github.com/user-attachments/assets/ebf509c6-9569-4979-85b5-7bcf341c6793" />

### Transfer Dialog
<img width="1920" height="1020" alt="Transfer Dialog" src="https://github.com/user-attachments/assets/a9108b2c-465c-4a7d-9ab4-2e3a53c66971" />

---

👨‍💻 Author : Anish Patel
