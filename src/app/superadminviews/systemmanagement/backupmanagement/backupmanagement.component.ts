import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-backupmanagement',
  imports: [CommonModule, RouterModule],
  templateUrl: './backupmanagement.component.html',
  styleUrl: './backupmanagement.component.css'
})
export class BackupmanagementComponent {

  hospitals = [
    {
      name: 'PP Maniya Hospital',
      branches: [
        { name: 'Varcha Branch', lastBackup: new Date(), status: 'Success', downloadLink: '/backups/pp-a.zip' },
        { name: 'Piplod Branch', lastBackup: new Date(), status: 'Pending', downloadLink: '/backups/pp-b.zip' }
      ]
    },
    {
      name: 'LifeCare Hospital',
      branches: [
        { name: 'Udhana Branch', lastBackup: new Date(), status: 'Failed', downloadLink: '/backups/life-1.zip' },
        { name: 'Citylight Branch', lastBackup: new Date(), status: 'Success', downloadLink: '/backups/life-2.zip' }
      ]
    }
  ];

  getTotalBackups(): number {
    return this.hospitals.reduce((total, h) => total + h.branches.length, 0);
  }

  initiateGlobalBackup() {
    alert('Initiating full system backup...');
  }

  backupHospital(hospital: any) {
    alert(`Initiating backup for ${hospital.name}`);
  }

  restoreBranch(branch: any) {
    alert(`Restoring backup for ${branch.name}`);
  }
}
