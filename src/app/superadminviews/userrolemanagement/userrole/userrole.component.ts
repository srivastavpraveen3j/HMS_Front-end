import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SuperadminService } from '../../superadminservice/superadmin.service';

@Component({
  selector: 'app-userrole',
  imports: [RouterModule, CommonModule],
  templateUrl: './userrole.component.html',
  styleUrl: './userrole.component.css',
})
export class UserroleComponent {
  hospitals: any[] = [];
  selectedHospital: any = {};
  expandedHospitalId: number | null = 1; // PP Maniya expanded by default

  // hospitals = [
  //   {
  //     id: 1,
  //     name: 'PP MANIYA Hospital',
  //     address: 'Ring Road',
  //     city: 'Surat',
  //     country: 'India',
  //     adminId: '0000001',
  //     plan: 'Pro',
  //     startDate: '02-03-2025',
  //     endDate: '01-03-2026',
  //     role: 'Admin',
  //     status: 'Active',
  //     himsKey: '12321654',
  //     himsGroupId: 'GRP001',
  //     groupName: 'Primary Care',
  //     branches: [
  //       {
  //         id: 101,
  //         name: 'PP Branch A',
  //         city: 'Varachha',
  //         beds: 50,
  //         doctors: 25,
  //       },
  //       {
  //         id: 102,
  //         name: 'PP Branch B',
  //         city: 'Adajan',
  //         beds: 30,
  //         doctors: 15,
  //       },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     name: 'Sunshine Hospital',
  //     address: 'Udhna Road',
  //     city: 'Surat',
  //     country: 'India',
  //     adminId: '0000002',
  //     plan: 'Standard',
  //     startDate: '01-01-2025',
  //     endDate: '31-12-2025',
  //     role: 'Admin',
  //     status: 'Active',
  //     himsKey: '22334455',
  //     himsGroupId: 'GRP002',
  //     groupName: 'Wellness Group',
  //     branches: [
  //       {
  //         id: 201,
  //         name: 'Sunshine Kids Care',
  //         city: 'Katargam',
  //         beds: 20,
  //         doctors: 12,
  //       },
  //       {
  //         id: 202,
  //         name: 'Sunshine Women’s Wing',
  //         city: 'Piplod',
  //         beds: 40,
  //         doctors: 22,
  //       },
  //     ],
  //   },
  //   {
  //     id: 3,
  //     name: 'Healing Touch Hospital',
  //     address: 'City Light Road',
  //     city: 'Surat',
  //     country: 'India',
  //     adminId: '0000003',
  //     plan: 'Enterprise',
  //     startDate: '15-02-2025',
  //     endDate: '14-02-2026',
  //     role: 'Admin',
  //     status: 'Inactive',
  //     himsKey: '99887766',
  //     himsGroupId: 'GRP003',
  //     groupName: 'Advanced Health',
  //     branches: [
  //       {
  //         id: 301,
  //         name: 'Healing Touch ICU',
  //         city: 'Parle Point',
  //         beds: 60,
  //         doctors: 30,
  //       },
  //       {
  //         id: 302,
  //         name: 'Healing Touch Surgery Wing',
  //         city: 'Athwa',
  //         beds: 35,
  //         doctors: 18,
  //       },
  //     ],
  //   },
  // ];

  constructor(private superadminservice: SuperadminService){}

  ngOnInit(): void {
    this.loadHospitalData();
  }

  loadHospitalData() {
    this.superadminservice.getNamespaces().subscribe((res: any) => {
      this.hospitals = Array.isArray(res) ? res : (res && res.data ? res.data : []);
      console.log("hospitals", this.hospitals);
      this.selectedHospital = this.hospitals[0];
      console.log('selectedHospital', this.selectedHospital);
    });
  }

  toggleHospital(id: number) {
    const index = this.hospitals.findIndex((h) => h._id === id);
    if (index !== -1) {
      const selected = this.hospitals.splice(index, 1)[0];
      this.hospitals.unshift(this.selectedHospital);
      this.selectedHospital = selected;
    }
  }
}

