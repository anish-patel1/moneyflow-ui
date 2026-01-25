import { Routes } from "@angular/router";
import { UserComponent } from "./user.component";
import { UserLogsComponent } from "./user-logs/user-logs.component";


export default [
    { path: '', component: UserComponent },
    { path: 'user-log', component: UserLogsComponent }
] as Routes;