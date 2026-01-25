import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(public message: MessageService) {}

  // NOTE: Message Type = [ 'success' | 'error' | 'warn' | 'info' ]
  showToast(type: string, summary: string, detail?: string) {
    this.message.add({ severity: type, summary: summary, detail: detail });
  } 
}
