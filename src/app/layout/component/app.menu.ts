import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { CommonService } from '../../pages/money-flow/common/service/common.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of menuItem; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    menuItem: MenuItem[] = [];

    constructor(
        public commonService: CommonService
    ) {}

    ngOnInit() {
        const userType = this.commonService.GetUserData().userType;
        if (userType === 'U') {
            this.menuItem = [
                {
                    items: [
                        {
                            label: 'Dashboard',
                            icon: 'pi pi-fw pi-home',
                            routerLink: ['/']
                        },
                        {
                            label: 'Accounts',
                            icon: 'pi pi-credit-card',
                            routerLink: ['/accounts']
                        },
                        {
                            label: 'Categories',
                            icon: 'pi pi-folder',
                            routerLink: ['/categories']
                        },
                        {
                            label: 'Transactions',
                            icon: 'pi pi-sync',
                            routerLink: ['/transactions']
                        },
                        {
                            label: 'Loans & EMIs',
                            icon: 'pi pi-calculator',
                            routerLink: ['/installments']
                        },
                        {
                            label: 'Budgets',
                            icon: 'pi pi-calendar-plus',
                            routerLink: ['/budgets']
                        },
                        {
                            label: 'Reports',
                            icon: 'pi pi-chart-bar',
                            routerLink: ['/reports']
                        }
                    ]
                }
            ]
        } else if (userType === 'S') {
            this.menuItem = [
                {
                    label: 'Admin',
                    items: [
                        {
                            label: 'Version',
                            icon: 'pi pi-clone',
                            routerLink: ['/admin/version']
                        },
                        {
                            label: 'User',
                            icon: 'pi pi-fw pi-user',
                            routerLink: ['/admin/user']
                        }
                    ]
                },
            ]
        }
    }
}
