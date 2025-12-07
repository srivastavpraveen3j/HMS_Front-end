import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IpdService } from '../ipdservice/ipd.service';
import { DateToISTPipe } from "../../../pipe/dateformatter/date-to-ist.pipe";

@Component({
  selector: 'app-roomchargecalculation',
  imports: [CommonModule, FormsModule, DateToISTPipe],
  templateUrl: './roomchargecalculation.component.html',
  styleUrl: './roomchargecalculation.component.css',
})
export class RoomchargecalculationComponent {
  @Input() roomData: any;
  roomLogs: any;
  dailyLogs: any;
  roomDataId: string = '';

  constructor(private ipdservice: IpdService) {}

  ngOnInit(): void {
    this.roomLogs = this.roomData;
    this.dailyLogs = this.roomData.dailyRoomChargeLogs;
    this.roomDataId = this.roomData?._id;
  }

  editIndex: number | null = null;
  backupLog: any = {};

  editBed(index: number): void {
    this.editIndex = index;
    console.log('selecetd log to edit', this.dailyLogs[index]);
    this.backupLog = { ...this.dailyLogs[index] };
  }

  // ONLY local calculation & UI update
  onHalfDayToggle(log: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    log.isHalfDay = input.checked;

    if (log.isHalfDay) {
      log.roomCharge = (this.backupLog?.roomCharge ?? log.roomCharge) / 2;
      log.bedCharge = (this.backupLog?.bedCharge ?? log.bedCharge) / 2;
    } else {
      log.roomCharge = this.backupLog?.roomCharge ?? log.roomCharge * 2;
      log.bedCharge = this.backupLog?.bedCharge ?? log.bedCharge * 2;
    }
  }

  onFullDayToggle(log: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    log.isFullDay = input.checked;

    if (log.isFullDay) {
      // ✅ Full day → zero charges
      log.roomCharge = 0;
      log.bedCharge = 0;
    } else {
      // ✅ Restore original values
      log.roomCharge = this.backupLog?.roomCharge ?? log.roomCharge;
      log.bedCharge = this.backupLog?.bedCharge ?? log.bedCharge;
    }
  }

  // ONLY save to server when explicitly requested
  saveEdit(index: number): void {
    this.editIndex = null;
    const log = this.dailyLogs[index];
    console.log('Saving log:', {
      roomCharge: log.roomCharge,
      bedCharge: log.bedCharge,
      isHalfDay: log.isHalfDay, // check this
      isFullDay: log.isFullDay, // check this
    });
    this.ipdservice
      .updateipdroomlog(this.roomDataId, log._id, {
        roomCharge: log.roomCharge,
        bedCharge: log.bedCharge,
        isHalfDay: log.isHalfDay,
        isFullDay: log.isFullDay,
      })
      .subscribe(
        (res) => console.log('Update successful', res),
        (err) => console.error('Update failed', err)
      );
  }

  cancelEdit(): void {
    if (this.editIndex !== null) {
      this.roomLogs.dailyRoomChargeLogs[this.editIndex] = { ...this.backupLog };
      this.editIndex = null;
    }
  }

  // computed total for transfer charges, used from template
  get transferTotal(): number {
    if (!Array.isArray(this.dailyLogs) || this.dailyLogs.length === 0) {
      return 0;
    }
    return this.dailyLogs.reduce((sum, item) => {
      const room = Number(item?.roomCharge) || 0;
      const bed = Number(item?.bedCharge) || 0;
      return sum + room + bed;
    }, 0);
  }

  getTotalDaysFromLogs(logs: any[]): number {
    if (!logs || logs.length === 0) return 0;

    const dates = logs.map((log) => new Date(log.date));
    const firstDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const lastDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Difference in time in milliseconds
    const diffTime = lastDate.getTime() - firstDate.getTime();

    // Convert time difference to days and add 1 to include both days
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
  }
}
