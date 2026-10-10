function baseUrl(): string {
  return localStorage.getItem('baseUrl') ?? '';
}

export const API = {
  get Dashboard()    { return baseUrl() + 'Dashboard/';    },
  get Accounts()     { return baseUrl() + 'Accounts/';     },
  get Categories()   { return baseUrl() + 'Categories/';   },
  get Transactions() { return baseUrl() + 'Transactions/'; },
  get Transfer()     { return baseUrl() + 'Transfer/';     },
  get Installments() { return baseUrl() + 'Installments/'; },
};