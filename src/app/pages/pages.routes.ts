import { Routes } from '@angular/router';

export default [
    { path: '', loadChildren: () => import('./money-flow/money-flow.routes') }
] as Routes;
