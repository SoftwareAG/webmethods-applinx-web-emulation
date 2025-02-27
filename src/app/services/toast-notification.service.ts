import { Injectable, Injector } from '@angular/core';
// import { NotificationService, ToastContent } from 'carbon-components-angular';

@Injectable({
  providedIn: 'root'
})
export class ToastNotificationService {

  constructor( private injector: Injector) { }

  showToast(message: string, title: string, caption: string) {
    // const notificationService = this.injector.get(NotificationService);
    // const toastContent: ToastContent = {
    //   caption: caption,
    //   title: title,
    //   subtitle: message,
    //   type: 'success', // You can also use 'error', 'info', or 'warning'
    //   duration: 3000 // Duration in milliseconds
    // };
    // notificationService.showToast(toastContent);
    // //this.vcRef.
  }
}
