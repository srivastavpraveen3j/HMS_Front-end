import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BranchService } from '../service/branch.service';

@Component({
  selector: 'app-hospitalmanagement',
  imports: [CommonModule, RouterModule],
  templateUrl: './hospitalmanagement.component.html',
  styleUrl: './hospitalmanagement.component.css'
})
export class HospitalmanagementComponent {

  branch : any[] = [];

  hospitals = [
    {
      id: 1,
      name: 'PP MANIYA Hospital',
      address: 'Ring Road',
      city: 'Surat',
      country: 'India',
      adminId: '0000001',
      plan: 'Pro',
      startDate: '02-03-2025',
      endDate: '01-03-2026',
      role: 'Admin',
      status: 'Active',
      himsKey: '12321654',
      himsGroupId: 'GRP001',
      groupName: 'Primary Care',
      branches: [
        {
          id: 101,
          name: 'PP Branch A',
          city: 'Varachha',
          beds: 50,
          doctors: 25
        },
        {
          id: 102,
          name: 'PP Branch B',
          city: 'Adajan',
          beds: 30,
          doctors: 15
        }
      ]
    },
    {
      id: 2,
      name: 'Sunshine Hospital',
      address: 'Udhna Road',
      city: 'Surat',
      country: 'India',
      adminId: '0000002',
      plan: 'Standard',
      startDate: '01-01-2025',
      endDate: '31-12-2025',
      role: 'Admin',
      status: 'Active',
      himsKey: '22334455',
      himsGroupId: 'GRP002',
      groupName: 'Wellness Group',
      branches: [
        {
          id: 201,
          name: 'Sunshine Kids Care',
          city: 'Katargam',
          beds: 20,
          doctors: 12
        },
        {
          id: 202,
          name: 'Sunshine Women’s Wing',
          city: 'Piplod',
          beds: 40,
          doctors: 22
        }
      ]
    },
    {
      id: 3,
      name: 'Healing Touch Hospital',
      address: 'City Light Road',
      city: 'Surat',
      country: 'India',
      adminId: '0000003',
      plan: 'Enterprise',
      startDate: '15-02-2025',
      endDate: '14-02-2026',
      role: 'Admin',
      status: 'Inactive',
      himsKey: '99887766',
      himsGroupId: 'GRP003',
      groupName: 'Advanced Health',
      branches: [
        {
          id: 301,
          name: 'Healing Touch ICU',
          city: 'Parle Point',
          beds: 60,
          doctors: 30
        },
        {
          id: 302,
          name: 'Healing Touch Surgery Wing',
          city: 'Athwa',
          beds: 35,
          doctors: 18
        }
      ]
    }
  ];

  // Initially show PP MANIYA as selected
  selectedHospital = this.hospitals[0];


    expandedHospitalId: number | null = 1; // PP Maniya expanded by default

  // component.ts



  toggleHospital(id: number) {
    const index = this.hospitals.findIndex(h => h.id === id);
    if (index !== -1) {
      const selected = this.hospitals.splice(index, 1)[0];
      this.hospitals.unshift(this.selectedHospital);
      this.selectedHospital = selected;
    }
  }

  constructor(private branchservice : BranchService){}

  ngOnInit(){


    this.branchservice.getBranch().subscribe({

      next : (res) => {
      // console.log("🚀 ~ HospitalmanagementComponent ~ this.branchservice.getBranch ~ res:", res)
      this.branch = res;
      console.log("🚀 ~ HospitalmanagementComponent ~ this.branchservice.getBranch ~ this.branch:", this.branch)

      }, error: (err)=>{
        console.log("🚀 ~ HospitalmanagementComponent ~ this.branchservice.getBranch ~ err:", err)

      }
    }

    )

  }


  // deleteBranch(branchId : string){
  //   this.branchservice.deleteBranch(branchId).subscribe({
  //     next : (res) => {
  //       console.log("🚀 ~ HospitalmanagementComponent ~ this.branchservice.deleteBranch ~ res:", res)
  //       alert("Deleted Successfully");
  //       this.branch = this.branch.filter(symp => symp._id !== branchId);
  //     },
  //     error: (err) => {
  //       console.log("🚀 ~ HospitalmanagementComponent ~ this.branchservice.deleteBranch ~ err:", err)

  //     }
  //   })
  // }
}
