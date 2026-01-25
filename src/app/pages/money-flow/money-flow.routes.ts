import { Routes } from "@angular/router";

export default [
    { path: 'admin', loadChildren: () => import('./admin/admin.routes') },
] as Routes;