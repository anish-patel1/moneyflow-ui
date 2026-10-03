import { Component, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMenu } from './app.menu';
import { CommonService } from '../../pages/money-flow/common/service/common.service';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';
import { Auth_API } from '../../pages/auth/auth-api';
import { AuthService } from '../../pages/auth/services/auth.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, AppMenu, ButtonModule, TooltipModule],
    template: ` 
        <div class="layout-sidebar flex flex-col h-full">
            <div class="flex-1 overflow-y-auto">
                <app-menu></app-menu>
            </div>
            <div class="pt-3 pb-1">
                <div class="p-3 bg-surface-100 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60 rounded-xl flex items-center justify-between">
                    <div class="flex items-center space-x-3 min-w-0">
                        <div
                            class="w-9 h-9 rounded-full bg-primary text-primary-contrast flex items-center justify-center font-semibold text-sm shadow-sm shrink-0">
                            {{ userDisplayName?.charAt(0)?.toUpperCase() }}
                        </div>
                        <div class="flex flex-col min-w-0">
                            <span class="text-sm font-semibold text-color truncate max-w-[120px]" [title]="userDisplayName">
                                {{ userDisplayName }}
                            </span>
                            <span class="text-xs text-color-secondary">Logged in</span>
                        </div>
                    </div>
                    <p-button
                        icon="pi pi-sign-out"
                        [rounded]="true"
                        [text]="true"
                        severity="secondary"
                        (onClick)="onLogOut()"
                        pTooltip="Log out"
                        tooltipPosition="top"
                        aria-label="Log out"
                    />
                </div>
            </div>
        </div>
    `
})
export class AppSidebar {
    // API
    Auth_API = Auth_API.Auth_API;

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
        const userData = this.commonService.GetUserData();
        this.userId = userData?.userId;
        this.userDisplayName = userData?.userDisplayName;
        this.userType = userData?.userType;
    }

    onLogOut() {
        if (this.userId) {
            this.commonService.getData(this.Auth_API + "Log_Out?id=" + this.userId).subscribe({
                next: (data: any) => {
                    if (data) this.authService.logout();
                },
                error: () => {
                    this.authService.logout();
                }
            });
        } else {
            this.authService.logout();
        }
    }
}
