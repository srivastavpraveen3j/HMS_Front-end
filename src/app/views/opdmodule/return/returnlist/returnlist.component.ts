import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OpdService } from '../../opdservice/opd.service';

@Component({
  selector: 'app-returnlist',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './returnlist.component.html',
  styleUrl: './returnlist.component.css'
})
export class ReturnlistComponent {



  recordsPerPage: number = 25;
  searchText: string = '';
  opdreturn : any [] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;


  constructor(private opdService: OpdService , private router: Router, private fb : FormBuilder){}


  ngOnInit(){
    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: ['']
    });

    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';

    this.loadOpdreturn();

    // this.opdService.getOPDbill(this.currentPage, limit, search).subscribe(res => {
    //   this.opdbill = res.data;
    //   console.log("🚀 ~ UhidComponent ~ this.uhidservice.getUhid ~ this.uhidRecords:", this.opdbill)
    //   this.totalPages = res.totalPages;
    // });

    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
    });

    this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
    });

  }



  loadOpdreturn() {
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';
    const page = this.currentPage;

    this.opdService.getopdreturnapis( this.currentPage, limit, search ).subscribe(res => {
      this.opdreturn = res.outpatientReturns;
      console.log("🚀 ~ ReturnlistComponent ~ this.opdService.getopdreturnapis ~      this.opdreturn:",      this.opdreturn)
      this.totalPages = res.totalPages;

    });
  }


  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadOpdreturn(); // Fetch new page data
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOpdreturn(); // Fetch new page data
    }
  }


  editPatientreturn(returnid : string){
//  alert(`editing details of ${returnid}`);

 this.router.navigate(['/opd/return'], {
  queryParams: { _id: returnid }
});

  }


  deletPatientreturn(returnid : string){

//  alert(`Deleting details of ${returnid}`);

if (!returnid) {
  console.error("Opd bill id required for deletion");
  return;
}

this.opdService.deleteopdreturnapis(returnid).subscribe({
  next: (res: any) => {
    // console.log("Medical test deleted:", res);
    alert("OPD Return deleted successfully")
    // Refresh list after deletion
    this.opdreturn = this.opdreturn.filter(symp => symp._id !== returnid);
  },
  error: (err) => {
    console.error("Error deleting OPD Return  :", err);
  }
});

  }

}
