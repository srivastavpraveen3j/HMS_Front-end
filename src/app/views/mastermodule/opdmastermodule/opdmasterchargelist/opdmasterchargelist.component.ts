import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-opdmasterchargelist',
  imports: [CommonModule,RouterModule, ReactiveFormsModule],
  templateUrl: './opdmasterchargelist.component.html',
  styleUrl: './opdmasterchargelist.component.css'
})
export class OpdmasterchargelistComponent {

serviceGroup : any[] = [];
service : any[]= [];

recordsPerPage: number = 25;
searchText: string = '';
filterForm!: FormGroup;
currentPage = 1;
  totalPages = 1;

  constructor(private masterService : MasterService, private router : Router, private fb : FormBuilder){


  }

  userPermissions: any = {};

  ngOnInit(){

     // load permissions

         const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'serviceGroup');
  this.userPermissions = uhidModule?.permissions || {};

// load permissions

    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: ['']
    });

    this.loadservicegroup();

       // Watch for changes in dropdown
       this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
        this.currentPage = 1;
        this.loadservicegroup();
      });

      // Optionally watch for searchText
     this.filterForm.get('searchText')?.valueChanges
       .pipe(
         debounceTime(300), // Wait 300ms after typing
         distinctUntilChanged()
       )
       .subscribe((searchText: string) => {
         this.currentPage = 1;
         this.loadservicegroup();
       });


    // this.masterService.getServiceGroup().subscribe({
    //   next: (res)=> {
    //     // console.log("🚀 ~ OpdmasterchargelistComponent ~ this.masterService.getServiceGroup ~ res:", res)

    //     this.serviceGroup = res.groups
    //     console.log("🚀 ~ OpdmasterchargelistComponent ~ this.masterService.getServiceGroup ~ this.serviceGroup:", this.serviceGroup)
    //   }, error: (err)=> {
    //     console.log("🚀 ~ OpdmasterchargelistComponent ~ this.masterService.getServiceGroup ~ err:", err)

    //   }
    // })



  }

  loadservicegroup() {
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';

    this.masterService.getServicegroup(this.currentPage, limit, search).subscribe({
      next: (res) => {
        this.serviceGroup = res.groups ? res.groups : res.data ;
        // console.log("service group", this.serviceGroup);
        this.totalPages = res.totalPages;
      },
      error: (err) => {
        console.error("Error fetching service groups:", err);
      }
    });
  }



  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadservicegroup();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadservicegroup();
    }
  }








  editServicegroup(servicegroupid : string){
  // console.log("🚀 ~ OpdmasterchargelistComponent ~ editServicegroup ~ servicegroupid:", servicegroupid)

  this.router.navigate(['/master/masteropdcharge'], {
    queryParams: { _id: servicegroupid }
  });
  }


  deleteServicegroup(servicegroupid: string): void {
  if (!servicegroupid) {
    console.error("Service Group ID is required for deletion");
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: 'This Service Group will be permanently deleted.',
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
      this.masterService.deleteServiceGroup(servicegroupid).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Service Group has been deleted successfully.',
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

          // Update the list by removing the deleted item
          this.serviceGroup = this.serviceGroup.filter(group => group._id !== servicegroupid);
        },
        error: (err) => {
          console.error("Error deleting Service Group:", err);
          Swal.fire({
            icon: 'error',
            title: 'Deletion Failed',
            text: 'There was an error deleting the Service Group.',
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
