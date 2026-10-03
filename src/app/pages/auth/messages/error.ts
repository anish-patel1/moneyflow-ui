import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-error',
    standalone: true,
    imports: [ButtonModule, RouterModule, AppFloatingConfigurator],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] p-4 overflow-hidden">
            <div class="flex flex-col items-center justify-center w-full max-w-[32rem]">
                <div class="w-full rounded-[48px] sm:rounded-[56px] p-[0.3rem] bg-[linear-gradient(180deg,rgba(239,68,68,0.35)_10%,transparent_30%)]">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-10 sm:py-14 px-6 sm:px-12 rounded-[45px] sm:rounded-[53px] flex flex-col items-center text-center">
                        <div class="w-14 h-14 rounded-full border-2 border-red-500/40 bg-red-500/10 flex items-center justify-center mb-3">
                            <i class="pi pi-exclamation-circle !text-2xl text-red-500"></i>
                        </div>
                        <h1 class="text-color font-bold text-2xl sm:text-3xl mb-2">Error Occurred</h1>
                        <p class="text-muted-color text-sm sm:text-base mb-6 max-w-xs">
                            Requested resource is not available or an unexpected error occurred.
                        </p>
                        <img src="https://primefaces.org/cdn/templates/sakai/auth/asset-error.svg" alt="Error" class="mb-6 max-w-[14rem] w-full" />
                        <div class="mt-2 text-center">
                            <p-button label="Back to Dashboard" icon="pi pi-home" routerLink="/" severity="danger" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Error {}
