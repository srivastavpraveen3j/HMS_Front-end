import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IpdService } from '../../ipdservice/ipd.service';
import { BedwardroomService } from '../../../mastermodule/bedmanagement/bedservice/bedwardroom.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-roomtransferlist',
  imports: [RouterModule, CommonModule],
  templateUrl: './roomtransferlist.component.html',
  styleUrl: './roomtransferlist.component.css',
})
export class RoomtransferlistComponent {
  recordsPerPage: number = 25;
  searchText: string = '';
  patients: any[] = [];
  transferData: any;
  showTransferEndColumn: any;
  userPermissions: any = {};

  constructor(
    private ipdservice: IpdService,
    private router: Router,
    private bedwardroomservice: BedwardroomService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'inpatientRoomTransfer'
    );
    this.userPermissions = uhidModule?.permissions || {};

    this.route.queryParams.subscribe((params) => {
      const id = params['Id'];
      if (id) {
        this.loadPatientTransferData(id);
      }else{
        this.loadRoomTransferData();
      }
    });
  }

  loadPatientTransferData(id: string) {
    this.ipdservice.getipdroomtransfer().subscribe({
      next: (res) => {
        const transfers = res.transfers || [];
        this.transferData = transfers.filter((data: any) => data.inpatientCaseId?._id === id)
        console.log('Room transfer data by patient', this.transferData);
        this.showTransferEndColumn = this.transferData.some((patient: any) =>
          patient.transfers?.some((transfer: any) => transfer.transferEndTime)
        );
      },
      error: (error) => {
        console.error('Error loading', error);
      },
    });
  }

  loadRoomTransferData() {
    this.ipdservice.getipdroomtransfer().subscribe({
      next: (res) => {
        this.transferData = res.transfers || [];
        console.log('Room transfer data', this.transferData);
        this.showTransferEndColumn = this.transferData.some((patient: any) =>
          patient.transfers?.some((transfer: any) => transfer.transferEndTime)
        );
      },
      error: (error) => {
        console.error('Error loading', error);
      },
    });
  }

  editTransfer(id: string) {
    this.router.navigate(['/ipd/ipdroomtransfer'], {
      queryParams: { _Id: id },
    });
  }

  async endTransfer(id: string, transfer: any, ipdid: string, bed:any) {
    const Swal = (await import('sweetalert2')).default;

    Swal.fire({
      title: 'End Room Transfer?',
      text: 'Do you want to end this transfer only, or end & add new transfer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'End Transfer Only',
      cancelButtonText: 'End & Add New Transfer',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        // ✅ call end API
        this.endCurrentTransfer(id, transfer, bed);
        this.router.navigate(['/ipdpatientsummary'], {
          queryParams: { id: ipdid },
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // ✅ end + add new → redirect to transfer form
        this.endCurrentTransfer(id, transfer);
        this.router.navigate(['/ipd/ipdroomtransfer'], {
          queryParams: { Id: ipdid },
        });
      }
    });
  }

  async endCurrentTransfer(id: string, transfer: any, bed?:any) {
    console.log('transfer', transfer);
    const startTime = new Date(transfer.transferStartTime);

    // Generate end time first
    const endTime = new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    );

    const oneDay = 1000 * 60 * 60 * 24;
    const daysStay =
      Math.floor((endTime.getTime() - startTime.getTime()) / oneDay) + 1;

    const roomBedCharge = transfer.roomCharge + transfer.bedCharge;
    const total = daysStay * roomBedCharge;

    const transferId = transfer._id;

    // Free the transferred bed
    const bedId = transfer.to?.bedId;
    await firstValueFrom(
      this.bedwardroomservice.updatebed(bedId, { is_occupied: false })
    );

    // Update transferEndTime
    await firstValueFrom(
      this.ipdservice.updateipdroomtransfer(id, transferId, {
        primaryBed: bed,
        transferEndTime: endTime.toISOString().slice(0, 16),
        totalCharge: total,
      })
    );
  }
}
