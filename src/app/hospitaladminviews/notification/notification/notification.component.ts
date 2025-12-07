import { Component } from '@angular/core';
import { BroadcastService } from '../../../superadminviews/broadcastmessaging/service/broadcast.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-notification',
  imports: [CommonModule, RouterModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {


  broadcastMessages: any[] = [];

  constructor(private broadcastService: BroadcastService) {
    // Retrieve the stored messages
    this.broadcastMessages = this.broadcastService.getBroadcastMessages();
  }

  activeIndex: number | null = null;


  toggleAccordion(index: number) {
    this.activeIndex = this.activeIndex === index ? null : index;
  }
}
