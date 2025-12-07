import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MasterService } from '../../../mastermodule/masterservice/master.service';

@Component({
  selector: 'app-medpackagelist',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './medpackagelist.component.html',
  styleUrl: './medpackagelist.component.css'
})
export class MedpackagelistComponent {



  recordsPerPage: number = 25;
  searchText: string = '';
  filterForm!: FormGroup;
  medstock : any[] = [];
  currentPage = 1;
  totalPages = 1;


    constructor(private masterService : MasterService, private router : Router, private fb: FormBuilder){

    }


    ngOnInit() {
      this.filterForm = this.fb.group({
        recordsPerPage: [10],
        searchText: ['']
      });

      this.loadSymtpomsgroup();

      this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
        this.currentPage = 1;
        this.loadSymtpomsgroup();
      });

      this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
        this.currentPage = 1;
        this.loadSymtpomsgroup();
      });
    }

    loadSymtpomsgroup() {
      const limit = this.filterForm.get('recordsPerPage')?.value || 10;
      const search = this.filterForm.get('searchText')?.value || '';

      this.masterService.getMedicinestock(this.currentPage, limit, search).subscribe(res => {
        this.medstock = res.stocks;
        this.totalPages = res.totalPages || 1;
      });
    }


  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadSymtpomsgroup();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSymtpomsgroup();
    }
  }



  editPackage(packageid : string) {
    // alert(packageid)

      this.router.navigate(['/doctor/medpackage'], {
        queryParams: { _id: packageid }
      });
  }


  deletePackage(packageid : string){

    // alert(packageid)
    this.masterService.deleteMedicinestock(packageid).subscribe({
      next: (res) => {
        alert("Deleted Successfully");
        this.medstock = this.medstock.filter(symp => symp._id !== packageid);
      },
      error: (err) => {
        console.log(err, "error response");
      }
    });
  }



}
