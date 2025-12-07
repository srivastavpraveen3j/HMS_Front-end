import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-symptomsgroup',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './symptomsgroup.component.html',
  styleUrls: ['./symptomsgroup.component.css']
})
export class SymptomsgroupComponent {
  symptomsgroup: FormGroup;
  symptoms: any[] = [];
  symptomsgroupList: any[] = [];
  selectedsymptoms: any[] = [];
  symptomsgroupId: string | null = null;
  editMode: boolean = false;
  dropdownOpenType = false;

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.symptomsgroup = this.fb.group({
      symptomGroups: ['', Validators.required],
      symptoms: [[], Validators.required]
    });
  }

 userPermissions: any = {};

// symptoms


symptomsSearchControl = new FormControl('');
filteredSymtpoms: any[] = [];

symptomsPage = 1;
symptomsLimit = 10;
// symptoms



  ngOnInit(): void {
// load permissions

         const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'symptomGroup');
  this.userPermissions = uhidModule?.permissions || {};

// load permissions
    // Fetch symptoms first
    this.masterService.getAllSymptoms().subscribe(res => {
      this.symptoms = res.data;

      // Then check for edit mode
      this.route.queryParams.subscribe(params => {
        const id = params['_id'];
        if (id) {
          this.editMode = true;
          this.symptomsgroupId = id;
          this.loadsymptomsgroup(id); // Only call this AFTER symptoms are fetched
        }
      });
    });

    // Optionally fetch the group list (not related to edit)
    this.masterService.getAllSymptomsGroup().subscribe(res => {
      this.symptomsgroupList = res.data;
      console.log("🚀 ~ SymptomsgroupComponent ~ this.masterService.getAllSymptomsGroup ~      this.symptomsgroupList:",      this.symptomsgroupList)
    });

    // select symtposm
 this.symptomsSearchControl.valueChanges
    .pipe(debounceTime(300), distinctUntilChanged())
    .subscribe((query: string | null) => {
      if (query !== null) {
        this.searchSymptoms(query);
      } else {
        this.filteredSymtpoms = [];
      }
    });

    // select symtposm
  }

  searchSymptoms(query: string) {
  const trimmedQuery = query.trim();
  this.masterService.getSymptom(this.symptomsPage, this.symptomsLimit, trimmedQuery)
    .subscribe((res: any) => {
      this.filteredSymtpoms = res.data || [];
    });
}


  loadsymptomsgroup(id: string) {
    this.masterService.getAllSymptomsGroup().subscribe((res: any) => {
      const group = res.data.find((g: any) => g._id === id);
      if (group) {
        const symptomIds = group.symptoms.map((s: any) => s._id); // extract IDs from objects

        this.selectedsymptoms = group.symptoms; // if you want to show full details somewhere

        this.symptomsgroup.patchValue({
          symptomGroups: group.symptomGroups,
          symptoms: symptomIds // PATCH THE ARRAY OF SYMPTOM IDS HERE
        });
      } else {
        console.error('Symptom group not found.');
      }
    });
  }


  toggleTypeDropdown() {
    this.dropdownOpenType = !this.dropdownOpenType;
  }

  selectService(service: any) {
    if (!this.selectedsymptoms.find(s => s._id === service._id)) {
      this.selectedsymptoms.push(service);
      this.updateServiceIdsInForm();
    }
  }

  removeService(service: any) {
    this.selectedsymptoms = this.selectedsymptoms.filter(s => s._id !== service._id);
    this.updateServiceIdsInForm();
  }

  isServiceSelected(service: any) {
    return this.selectedsymptoms.some(s => s._id === service._id);
  }

  updateServiceIdsInForm() {
    const ids = this.selectedsymptoms.map(s => s._id);
    this.symptomsgroup.patchValue({ symptoms: ids });
  }

async onSubmit() {
  const Swal = (await import('sweetalert2')).default;

  if (this.symptomsgroup.valid) {
    if (this.editMode && this.symptomsgroupId) {
      // Update existing Symptoms Group
      this.masterService.updateSymptomsGroup(this.symptomsgroupId, this.symptomsgroup.value).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Symptoms Group Updated',
            text: 'Symptoms Group has been updated successfully.',
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
          this.symptomsgroup.reset();
          this.router.navigateByUrl('/master/symptomsgrouplist');
        },
        error: (err) => {
          console.error("Error updating Symptoms Group:", err);
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text:err.errror.message || 'Something went wrong while updating the Symptoms Group.',
            customClass: {
              popup: 'hospital-swal-popup',
              title: 'hospital-swal-title',
              htmlContainer: 'hospital-swal-text',
              confirmButton: 'hospital-swal-button'
            }
          });
        }
      });
    } else {
      // Create new Symptoms Group
      this.masterService.postSymptomsGroup(this.symptomsgroup.value).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Symptoms Group Created',
            text: 'New Symptoms Group has been added successfully.',
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
          this.symptomsgroup.reset();
          this.router.navigateByUrl('/master/symptomsgrouplist');
        },
        error: (err) => {
          console.error("Error creating Symptoms Group:", err);
          Swal.fire({
            icon: 'error',
            title: 'Creation Failed',
            text:err.errror.message || 'Something went wrong while creating the Symptoms Group.',
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
  } else {
    this.symptomsgroup.markAllAsTouched();
    Swal.fire({
      icon: 'warning',
      title: 'Incomplete Form',
      text: 'Please fill in all required fields before submitting.',
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button'
      }
    });
  }
}

  handleError(error: any, context: string) {
    console.error(`Error on ${context}:`, error);
    let errorMessage = `Failed to ${context} symptom group.`;
    if (error.error?.message) {
      errorMessage = error.error.message;
    }
    alert(errorMessage);
  }
}
