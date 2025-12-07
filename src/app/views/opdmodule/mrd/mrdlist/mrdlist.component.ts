import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OpdService } from '../../opdservice/opd.service';

@Component({
  selector: 'app-mrdlist',
  imports: [RouterModule, CommonModule,ReactiveFormsModule],
  templateUrl: './mrdlist.component.html',
  styleUrl: './mrdlist.component.css'
})
export class MrdlistComponent {

  recordsPerPage: number = 25;
  searchText: string = '';
  mrdcases : any [] = [];
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

    this.loadMrdcase();

    this.opdService.getopdmrd(this.currentPage, limit, search).subscribe(res => {
      this.mrdcases = res.medicalRecordDocument;
      this.totalPages = res.totalPages;
      console.log("🚀 ~ UhidComponent ~ this.uhidservice.getUhid ~ this.uhidRecords:", this.mrdcases)
    });

    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
    });

    this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
    });

  }

  loadMrdcase(){
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';
    const page = this.currentPage;
  }



  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadMrdcase(); // Fetch new page data
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadMrdcase(); // Fetch new page data
    }
  }


  editOpdMrdcase(mrdcseid: any) {
    alert(`Editing details of ${mrdcseid}`);

    // this.router.navigate(['/opd/mrd'], {
    //   queryParams: { _id: mrdcseid }
    // });

  }
  deleteOpdMrdcase(mrdcseid: any) {
    // alert(`Deleting details of ${mrdcseid}`);

    if (!mrdcseid) {
      console.error("Opdmrdid required for deletion");
      return;
    }

    this.opdService.deleteopdmrd(mrdcseid).subscribe({
      next: (res: any) => {
        // console.log("Medical test deleted:", res);
        alert("OPD Mrd Case deleted successfully")
        // Refresh list after deletion
        this.mrdcases = this.mrdcases.filter(symp => symp._id !== mrdcseid);
      },
      error: (err) => {
        console.error("Error deleting OPD Cases  :", err);
      }
    });
  }

}
