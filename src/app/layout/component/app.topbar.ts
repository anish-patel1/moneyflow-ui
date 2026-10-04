import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { TooltipModule } from 'primeng/tooltip';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { CommonService } from '../../pages/money-flow/common/service/common.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, TooltipModule, AppConfigurator],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()" aria-label="Toggle Menu">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" [routerLink]="userType === 'S' ? '/admin/version' : '/'">
                <img [src]="'assets/layout/images/logo-' + (layoutService.isDarkTheme() ? 'white' : 'dark') + '.svg'" alt="Money Flow" class="h-9 w-auto" />
                <span>MONEY FLOW</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button
                    type="button"
                    class="layout-topbar-action"
                    (click)="toggleDarkMode()"
                    [pTooltip]="layoutService.isDarkTheme() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
                    tooltipPosition="bottom"
                    aria-label="Toggle Theme"
                >
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                <div class="relative">
                    <button
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                        pTooltip="Theme Settings"
                        tooltipPosition="bottom"
                        aria-label="Theme Settings"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    // Current User
    userType: any = null;

    constructor(
        public layoutService: LayoutService,
        public commonService: CommonService
    ) { }

    ngOnInit() {
        const userData = this.commonService.GetUserData();
        this.userType = userData?.userType;
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}
