import { CommonModule,  } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThreadNoteComponent } from '../../component/thread-note/thread-note.component';
import { BranchService } from '../hms/service/branch.service';


@Component({
  selector: 'app-hspadmindashboard',
  imports: [RouterModule, CommonModule],
  templateUrl: './hspadmindashboard.component.html',
  styleUrl: './hspadmindashboard.component.css'
})
export class HspadmindashboardComponent  {

  branch : any[]= [];

  branches = [
    {
      name: 'Piplod',
      details: {
        beds: 25, doctors: 6, nurses: 8, opd: 30, ipd: 10, staff: 14,
        radiology: true, pathology: true, cancerTreatment: false,
        dailyIncome: 50000, dailyExpense: 32000
      }
    },
    {
      name: 'Adajan',
      details: {
        beds: 20, doctors: 5, nurses: 7, opd: 22, ipd: 8, staff: 11,
        radiology: false, pathology: true, cancerTreatment: true,
        dailyIncome: 45000, dailyExpense: 29000
      }
    },
    {
      name: 'Varcha',
      details: {
        beds: 30, doctors: 8, nurses: 10, opd: 40, ipd: 18, staff: 16,
        radiology: true, pathology: false, cancerTreatment: true,
        dailyIncome: 62000, dailyExpense: 37000
      }
    }
  ];
  toggleExpand(hospital: any) {
    hospital.expanded = !hospital.expanded;
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


}
