import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-support',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css'
})
export class SupportComponent {

  tickets = [
    {
      id: 1001,
      subject: 'Login issue for branch admin',
      hospital: 'PP Maniya Hospital',
      branch: 'Rajkot Branch',
      priority: 'High',
      status: 'Open',
      lastUpdated: '2025-04-24',
      description: 'Branch admin unable to login since morning. Error 401 appearing.'
    },
    {
      id: 1002,
      subject: 'Billing error in IPD module',
      hospital: 'PP Maniya Hospital',
      branch: 'Rajkot Branch',
      priority: 'Medium',
      status: 'In Progress',
      lastUpdated: '2025-04-23',
      description: 'Incorrect amount shown when generating final bill for IPD discharge.'
    },
    {
      id: 1003,
      subject: 'New feature request for lab reports',
      hospital: 'PP Maniya Hospital',
      branch: 'Surat Branch',
      priority: 'Low',
      status: 'Closed',
      lastUpdated: '2025-04-20',
      description: 'Add print preview and export to PDF for lab reports.'
    }
  ];

  selectedTicket: any = null;
  chattingWith: any = null;
  chatMessages: string[] = [];
  newMessage: string = '';

  openTicket(ticket: any) {
    this.selectedTicket = ticket;
  }

  closeTicketModal() {
    this.selectedTicket = null;
  }

  openChat(ticket: any) {
    this.chattingWith = ticket;
    this.chatMessages = ['Hi, how can I assist you with this issue?'];
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.chatMessages.push(this.newMessage);
      this.newMessage = '';
    }
  }

  endChat() {
    this.chattingWith = null;
    this.chatMessages = [];
  }

}
