import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-access',
    standalone: true,
    imports: [ButtonModule, RouterModule, AppFloatingConfigurator],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] p-4 overflow-hidden">
            <div class="flex flex-col items-center justify-center w-full max-w-[32rem]">
                <div class="w-full rounded-[48px] sm:rounded-[56px] p-[0.3rem] bg-[linear-gradient(180deg,rgba(247,149,48,0.35)_10%,transparent_30%)]">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-10 sm:py-14 px-6 sm:px-12 rounded-[45px] sm:rounded-[53px] flex flex-col items-center text-center">
                        <div class="w-14 h-14 rounded-full border-2 border-orange-500/40 bg-orange-500/10 flex items-center justify-center mb-3">
                            <i class="text-orange-500 pi pi-lock !text-2xl"></i>
                        </div>
                        <h1 class="text-color font-bold text-2xl sm:text-3xl mb-2">Access Denied</h1>
                        <p class="text-muted-color text-sm sm:text-base mb-6 max-w-xs">
                            You do not have the necessary permissions. Please contact your administrator.
                        </p>
                        <img src="https://primefaces.org/cdn/templates/sakai/auth/asset-access.svg" alt="Access denied" class="mb-6 max-w-[14rem] w-full" />
                        <div class="mt-2 text-center">
                            <p-button label="Back to Login" icon="pi pi-arrow-left" routerLink="/auth/login" severity="warn" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Access {}
