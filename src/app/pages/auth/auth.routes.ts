import { Routes } from '@angular/router';
import { Access } from './messages/access';
import { Error } from './messages/error';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent }
] as Routes;
