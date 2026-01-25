import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { lastValueFrom } from 'rxjs';
import { CommonService } from './app/pages/money-flow/common/service/common.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, ToastModule, ConfirmDialogModule],
    template: `
        <router-outlet></router-outlet>
        <p-toast position="top-center"></p-toast>
        <p-confirmDialog></p-confirmDialog>
    `
})
export class AppComponent {
    constructor(
        public http: HttpClient,
        public commonService: CommonService
    ) {}

    ngOnInit(): void {
        this.getApiPath();
    }

    // Get Data From JSON File
    async getApiPath(): Promise<void> {
        const response = await lastValueFrom(
            this.http.get<any>('/assets/configuration/appsetting.json')
        );

        if (response) {
            localStorage.setItem("baseUrl", response.baseUrl);
            this.getVersion(response.baseUrl);
        }
    }

    getVersion(baseUrl: any) {
        this.commonService.getData(baseUrl + "Version/GetLatestVersion").subscribe({
            next: (data: any) => {
                const version = data[0]?.version;
                localStorage.setItem("version", version);
            }
        });
    }
}
