import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `
        <div class="layout-footer">
            Version
            <p class="text-primary font-bold">{{ version }}</p>
        </div>
    `
})
export class AppFooter {

    version = localStorage.getItem("version");
}
