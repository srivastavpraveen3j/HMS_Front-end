import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BroadcastService {

  private broadcastMessages: any[] = [];


  // addBroadcastMessage(message: any) {
  //   this.broadcastMessages.push(message);
  // }

  getBroadcastMessages() {
    return this.broadcastMessages;
  }

  getUnreadCount() {
    return this.broadcastMessages.length;
  }

  constructor() {
    const stored = localStorage.getItem('broadcastMessages');
    if (stored) {
      this.broadcastMessages = JSON.parse(stored);
    }
  }

  addBroadcastMessage(message: any) {
    this.broadcastMessages.push(message);
    localStorage.setItem('broadcastMessages', JSON.stringify(this.broadcastMessages));
  }


}
