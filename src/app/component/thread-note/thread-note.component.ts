// thread-note.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxGraphModule } from '@swimlane/ngx-graph';

interface BranchDetails {
  beds: number;
  doctors: number;
  nurses: number;
  opd: number;
  ipd: number;
  staff: number;
  radiology: boolean;
  pathology: boolean;
  cancerTreatment: boolean;
}

interface Branch {
  name: string;
  expanded: boolean;
  details: BranchDetails;
}

interface Hospital {
  name: string;
  expanded: boolean;
  subscriptionStatus?: string; // ✅ Add this line
  children: Branch[];
}

@Component({
  selector: 'app-thread-note',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, NgxGraphModule],
  templateUrl: './thread-note.component.html',
  styleUrls: ['./thread-note.component.css'],
})
export class ThreadNoteComponent {
  @Input() hospital!: Hospital;

  toggleExpand(branch: Branch) {
    branch.expanded = !branch.expanded;
  }

  getSubscriptionClass(subscription?: string): string {
    switch ((subscription || '').toLowerCase()) {
      case 'active': return 'sub-active';
      case 'expired': return 'sub-expired';
      case 'pending': return 'sub-pending';
      default: return 'sub-default';
    }
  }

  getHospitalTotal(hospital: Hospital) {
    let total = {
      beds: 0,
      doctors: 0,
      nurses: 0,
      opd: 0,
      ipd: 0,
      staff: 0
    };
    hospital.children?.forEach((branch: Branch) => {
      total.beds += branch.details.beds;
      total.doctors += branch.details.doctors;
      total.nurses += branch.details.nurses;
      total.opd += branch.details.opd;
      total.ipd += branch.details.ipd;
      total.staff += branch.details.staff;
    });
    return total;
  }
}
