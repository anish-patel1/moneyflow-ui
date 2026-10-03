import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-notfound',
    standalone: true,
    imports: [RouterModule, AppFloatingConfigurator, ButtonModule],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] p-4 overflow-hidden">
            <div class="flex flex-col items-center justify-center w-full max-w-[32rem]">
                <div class="w-full rounded-[48px] sm:rounded-[56px] p-[0.3rem] bg-[linear-gradient(180deg,var(--primary-color)_10%,transparent_30%)]">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-10 sm:py-14 px-6 sm:px-12 rounded-[45px] sm:rounded-[53px] flex flex-col items-center text-center">
                        <div class="w-16 h-16 rounded-full border-2 border-primary/40 bg-primary/10 flex items-center justify-center mb-4">
                            <i class="pi pi-compass text-primary !text-3xl"></i>
                        </div>
                        <span class="text-primary font-bold text-4xl mb-1 tracking-tight">404</span>
                        <h1 class="text-color font-bold text-2xl sm:text-3xl mb-2">Page Not Found</h1>
                        <p class="text-muted-color text-sm sm:text-base mb-6 max-w-xs">
                            The page you are looking for doesn't exist or has been moved.
                        </p>
                        <div class="mt-2 text-center">
                            <p-button label="Back to Dashboard" icon="pi pi-home" routerLink="/" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Notfound {}
