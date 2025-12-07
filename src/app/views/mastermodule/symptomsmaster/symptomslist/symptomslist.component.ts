import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-symptomslist',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './symptomslist.component.html',
  styleUrl: './symptomslist.component.css'
})
export class SymptomslistComponent {

  recordsPerPage: number = 25;
  searchText: string = '';
  filterForm!: FormGroup;
  symptoms : any[] = [];
  currentPage = 1;
  totalPages = 1;

  constructor( private masterService : MasterService, private router : Router, private fb: FormBuilder){}

 userPermissions: any = {};
  ngOnInit(): void {
// load permissions

         const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'symptoms');
  this.userPermissions = uhidModule?.permissions || {};

// load permissions
    this.masterService.getAllSymptoms().subscribe( res =>{
      this.symptoms = res.data ;
      // console.log("🚀 ~ MedicinemasterlistComponent ~ this.masterService.getMedicine ~ medicines:", this.medicines)

    })

    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: ['']
    });


    this.loadSymtpoms();

    // Watch for changes in dropdown
    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadSymtpoms();
    });

    // Optionally watch for searchText
  this.filterForm.get('searchText')?.valueChanges
    .pipe(
      debounceTime(300), // Wait 300ms after typing
      distinctUntilChanged()
    )
    .subscribe((searchText: string) => {
      this.currentPage = 1;
      this.loadSymtpoms();
    });


  }



  loadSymtpoms(){

    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';

    this.masterService.getSymptom(this.currentPage, limit, search).subscribe(res => {
      this.symptoms = res.data;
      this.totalPages = res.totalPages;
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadSymtpoms();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSymtpoms();
    }
  }





  editsymptoms(symptomsid: string) {
    // alert(symptomsid)

    this.router.navigate(['/master/symptoms'], {
      queryParams: { _id: symptomsid }
    });
  }


  deletesymptoms(symptomsid: string): void {
  if (!symptomsid) {
    console.error("Symptoms ID is required for deletion");
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: 'This symptom will be permanently deleted.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    customClass: {
      popup: 'hospital-swal-popup',
      title: 'hospital-swal-title',
      htmlContainer: 'hospital-swal-text',
      confirmButton: 'hospital-swal-button',
      cancelButton: 'hospital-swal-button'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      this.masterService.deleteSymptoms(symptomsid).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Symptom has been deleted successfully.',
            position: 'top-end',
            toast: true,
            timer: 3000,
            showConfirmButton: false,
            customClass: {
              popup: 'hospital-toast-popup',
              title: 'hospital-toast-title',
              htmlContainer: 'hospital-toast-text',
            }
          });

          // Refresh the symptoms list after deletion
          this.symptoms = this.symptoms.filter(symp => symp._id !== symptomsid);
        },
        error: (err) => {
          console.error("Error deleting symptom:", err);
          Swal.fire({
            icon: 'error',
            title: 'Deletion Failed',
            text:err.error.message || 'There was an error deleting the symptom.',
            customClass: {
              popup: 'hospital-swal-popup',
              title: 'hospital-swal-title',
              htmlContainer: 'hospital-swal-text',
              confirmButton: 'hospital-swal-button'
            }
          });
        }
      });
    }
  });
}



}
