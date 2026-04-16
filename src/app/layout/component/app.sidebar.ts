import { Component, ElementRef } from '@angular/core';
import { AppMenu } from './app.menu';
import { CommonService } from '../../pages/money-flow/common/service/common.service';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { Auth_API } from '../../pages/auth/auth-api';
import { AuthService } from '../../pages/auth/services/auth.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu, MenuModule],
    template: ` 
        <div class="layout-sidebar flex flex-col h-full">
            <div class="flex-1 overflow-y-auto">
                <app-menu></app-menu>
            </div>
            <div class="p-4 border-t surface-border flex items-center justify-between cursor-pointer relative"
                (click)="menu.toggle($event)">
                <div class="flex items-center space-x-3">
                    <div
                        class="w-8 h-8 rounded-full bg-primary text-primary-contrast flex items-center justify-center font-semibold shadow-md">
                        {{ userDisplayName?.charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex flex-col">
                        <span class="text-sm font-semibold text-color truncate max-w-[140px]">
                            {{ userDisplayName }}
                        </span>
                        <span class="text-xs text-color-secondary">Logged in</span>
                    </div>
                </div>
                <p-menu #menu
                    [popup]="true" [model]="userMenuItems"
                    appendTo="body" [style]="{'min-width': '150px'}">
                </p-menu>
            </div>
        </div>
    `
})
export class AppSidebar {
    // API
    Auth_API = Auth_API.Auth_API;
    
    // Menu Items
    userMenuItems: MenuItem[] = [];

    // Current User
    userId: any = null;
    userDisplayName: any = null;
    userType: any = null;
    
    constructor(
        public el: ElementRef,
        public commonService: CommonService,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit() {
        const userDate = this.commonService.GetUserData();
        this.userId = userDate.userId;
        this.userDisplayName = userDate.userDisplayName;
        this.userType = userDate.userType;

        this.userMenuItems = [
            // { label: 'Profile', icon: 'pi pi-user', command: () => this.onProfile() },
            ...(this.userType === 'U'
                ? [{ label: 'Settings', icon: 'pi pi-cog', command: () => this.onSettings() }]
                : []),
            { label: 'Log out', icon: 'pi pi-sign-out', command: () => this.onLogOut() }
        ];
    }

    onProfile() {
        // Navigate to profile page or handle logic
        console.log('Profile clicked');
    }

    onSettings() {
        this.router.navigate(['/setting']);
    }

    onLogOut() {
        this.commonService.getData(this.Auth_API + "Log_Out?id=" + this.userId).subscribe({
            next: (data: any) => {
                if (data) this.authService.logout();
            }
        });
    }
}
