import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-medicinetimeslot',
  imports: [CommonModule, FormsModule],
  templateUrl: './medicinetimeslot.component.html',
  styleUrl: './medicinetimeslot.component.css'
})
export class MedicinetimeslotComponent {

  timeSlots = [
    { label: 'First Slot', times: ['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'] },
    { label: 'Second Slot', times: ['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'] },
    { label: 'Third Slot', times: ['06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM'] },
    { label: 'Fourth Slot', times: ['12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM'] }
  ];

  selectedSlots: { [key: string]: boolean } = {};

  toggleSlot(time: string) {
    this.selectedSlots[time] = !this.selectedSlots[time];
  }

  saveSelection() {
    const selectedTimes = Object.keys(this.selectedSlots).filter(time => this.selectedSlots[time]);
    console.log('Selected Time Slots:', selectedTimes);
  }

}
