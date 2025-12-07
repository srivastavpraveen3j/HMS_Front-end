import { Component } from '@angular/core';
import { OpdService } from '../../opdmodule/opdservice/opd.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quemanagement',
  imports: [CommonModule],
  templateUrl: './quemanagement.component.html',
  styleUrl: './quemanagement.component.css',
})
export class QuemanagementComponent {
  Today: string = '';
  queue: any[] = [];
  userId: string = '';
  upcomingPatient: any = null;
  queueStatus: any[] = [];
  docName: string = '';

  constructor(private opdService: OpdService) {}

  ngOnInit(): void {
    const user = localStorage.getItem('authUser');
    const userStr = user ? JSON.parse(user) : null;
    console.log(userStr);
    const userid = userStr ? userStr._id : null;
    const docname = userStr ? userStr.name : null;
    this.docName = docname;
    this.userId = userid;
    // console.log(this.userId);
    const name = userStr ? userStr.role?.name : null;
    if (name === 'doctor') {
      this.loadQueue(this.userId);
      // ==> Refresh every 10 seconds
      setInterval(() => this.loadQueue(this.userId), 10000);
    }

    this.updateTime();
    setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  updateTime() {
    const now = new Date();
    const nowStr = now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    this.Today = nowStr;
  }

  loadQueue(doctorId: string) {
    this.opdService.getQueues(doctorId).subscribe((res: any) => {
      const allQueue = res.queue || [];

      // ==> 1. Filter today's queue
      const today = new Date().toISOString().split('T')[0];
      let todayQueue = allQueue.filter((patient: any) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        return (
          createdAt && new Date(createdAt).toISOString().split('T')[0] === today
        );
      });

      // ==> 2. Split waiting vs skipped
      let waitingPatients = todayQueue.filter(
        (p: any) => p.status?.toLowerCase() === 'waiting' || p.status?.toLowerCase() === 'onHold'
      );
      let skippedPatients = todayQueue.filter(
        (p: any) => p.status?.toLowerCase() === 'skipped'
      );

      // ==> 3. Sort each group by creation time
      waitingPatients.sort((a: any, b: any) => {
        return (
          new Date(a.createdAt || a.created_at).getTime() -
          new Date(b.createdAt || b.created_at).getTime()
        );
      });

      skippedPatients.sort((a: any, b: any) => {
        return (
          new Date(a.createdAt || a.created_at).getTime() -
          new Date(b.createdAt || b.created_at).getTime()
        );
      });

      // ==> 4. Merge them: waiting first, skipped later
      todayQueue = [...waitingPatients, ...skippedPatients];

      // ==> 5. First patient = upcoming, rest = queue
      this.upcomingPatient = todayQueue.length > 0 ? todayQueue[0] : null;
      this.queueStatus = todayQueue.length > 1 ? todayQueue.slice(1) : [];

      console.log('Upcoming patient:', this.upcomingPatient);
      console.log('Queue Status:', this.queueStatus);
    });
  }
}
