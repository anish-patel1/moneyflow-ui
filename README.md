```md
# MoneyFlow UI

MoneyFlow UI is the Angular frontend for the **MoneyFlow Personal Finance Management System**.

It provides a clean and responsive interface to manage **accounts, transactions, transfers, and financial summaries** with a modern dashboard.

The UI communicates with the MoneyFlow API to manage financial data and provide insights into personal cash flow.
```
---

# 🚀 Tech Stack

Frontend

- Angular 19
- TypeScript
- RxJS
- PrimeNG
- TailwindCSS

Planned

- Chart.js (analytics dashboard)
- Financial reports & visualizations

---

# 📌 Features

### Dashboard
- Total Balance overview
- Monthly Income summary
- Monthly Expense summary
- Net Cash Flow indicator
- Recent Transactions widget

### Accounts
- Create and manage financial accounts
- Track real-time account balances

### Categories
- Create income and expense categories
- System categories used for internal operations (e.g. transfers)

### Transactions
- Add, edit, and delete transactions
- Search transactions
- Date range filtering
- Category and account filters

### Transfers
- Transfer money between accounts
- Implemented using **double-entry transaction logic**
- Transfers displayed as `Account A → Account B`

---

## 📂 Project Structure

```
src/
├── app/
│ ├── core/
│ ├── pages/
│ │ └── money-flow/
│ │ ├── dashboard/
│ │ ├── accounts/
│ │ ├── categories/
│ │ └── transactions/
│ ├── services/
│ ├── models/
│ └── shared/
└── assets/
```

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js 18+
- Angular CLI

---

### Install & Run

```bash
npm install
ng build
ng serve
```

---

## 📈 Project Status

### Phase 1 – Core Financial System (In Progress)

| Module | Status | Description |
|------|------|-------------|
| Dashboard | ✅ Completed | Financial summary cards and recent transactions view |
| Accounts | ✅ Completed | Manage financial accounts and balances |
| Categories | ✅ Completed | Income and expense category management |
| Transactions | ✅ Completed | Add, edit, delete, search and filter transactions |
| Transfers | ✅ Completed | Transfer funds between accounts using double-entry logic |
| Budgets | 🚧 In Progress | Monthly budget tracking and alerts |
| Reports | 📌 Planned | Financial reports and analytics |
| Charts & Analytics | 📌 Planned | Visual insights using charts |

---

## 📷 Screenshots

### Dashboard
<img width="1920" height="1020" alt="Screenshot 2026-03-05 005303" src="https://github.com/user-attachments/assets/5aaced22-c918-45d9-a07b-14c1ae0e6e55" />

### Transactions
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/ebf509c6-9569-4979-85b5-7bcf341c6793" />


### Transfer Dialog
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/a9108b2c-465c-4a7d-9ab4-2e3a53c66971" />

---

👨‍💻 Author : Anish Patel
