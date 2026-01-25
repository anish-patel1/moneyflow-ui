import { Routes } from "@angular/router"
import { VersionComponent } from "./version/version.component";
import { UserComponent } from "./user/user.component";

export default [
    { path: 'version', component: VersionComponent },
    { path: 'user', loadChildren: () => import('./user/user.routes') },
] as Routes;