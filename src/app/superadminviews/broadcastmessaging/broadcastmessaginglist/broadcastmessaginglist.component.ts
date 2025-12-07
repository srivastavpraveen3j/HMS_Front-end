import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BroadcastService } from '../service/broadcast.service';

@Component({
  selector: 'app-broadcastmessaginglist',
  imports: [RouterModule, CommonModule],
  templateUrl: './broadcastmessaginglist.component.html',
  styleUrl: './broadcastmessaginglist.component.css'
})
export class BroadcastmessaginglistComponent {

  broadcastMessages: any[] = [];

  constructor(private broadcastService: BroadcastService) {
    // Retrieve the stored messages
    this.broadcastMessages = this.broadcastService.getBroadcastMessages();
  }

}
