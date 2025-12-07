import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';
// import Swal from 'sweetalert2';

@Component({
  selector: 'app-symptoms',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './symptoms.component.html',
  styleUrl: './symptoms.component.css',
})
export class SymptomsComponent {
  symptomsform: FormGroup;
  symptomsId: string | null = null;
  editMode: boolean = false;
  uploadMode: 'single' | 'bulk' = 'single';
  selectedFile: File | null = null;
  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.symptomsform = fb.group({
      name: ['', Validators.required],
      properties: ['', Validators.required],
      remark: [''],
      since: [''],
    });
  }

  userPermissions: any = {};
  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'symptoms'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions
    this.route.queryParams.subscribe((params) => {
      const symptomsId = params['_id'];
      if (symptomsId) {
        this.editMode = true;
        this.symptomsId = symptomsId;
        this.loadSymptoms(symptomsId);
      } else {
        console.log(
          '🚀 ~ SymptomsComponent ~ this.masterService.getSymptoms ~ Not Found'
        );
        this.editMode = false;
      }
    });
  }

  loadSymptoms(symptomsId: string) {
    this.masterService.getAllSymptoms().subscribe((res: any) => {
      const symptoms = res.data;
      const symptom = symptoms.find((symp: any) => symp._id === symptomsId);

      if (symptomsId) {
        this.symptomsform.patchValue({
          name: symptom.name,
          properties: symptom.properties,
          remark: symptom.remark,
        });
      } else {
        console.log(
          '🚀 ~ SymptomsComponent ~ this.masterService.getSymptoms ~ Not Found'
        );
      }
    });
  }

  resetForm(): void{
    this.symptomsform.reset({
      name: [''],
      properties: [''],
      remark: [''],
      since: [''],
    });

  }

  async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;

    if (this.symptomsform.invalid) {
      console.log('🚀 ~ SymptomsComponent ~ onSubmit ~ symptomsform invalid');
      this.symptomsform.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill in all required fields before submitting.',
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
      return;
    }

    const formData = { ...this.symptomsform.value };
    const isUpdate = this.editMode && this.symptomsId;

    const request$ = isUpdate
      ? this.masterService.updateSymptoms(this.symptomsId, formData)
      : this.masterService.postSymptoms(formData);

    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: isUpdate ? 'Symptoms Updated' : 'Symptoms Added',
          text: `Symptoms have been ${
            isUpdate ? 'updated' : 'added'
          } successfully.`,
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false,
          customClass: {
            popup: 'hospital-toast-popup',
            title: 'hospital-toast-title',
            htmlContainer: 'hospital-toast-text',
          },
        });

        this.symptomsform.reset();
        this.router.navigateByUrl('/master/symptomslist');
      },
      error: (error) => {
        console.error('Full error details:', error);

        let errorMessage = `Failed to ${isUpdate ? 'update' : 'add'} symptoms.`;
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        }

        Swal.fire({
          icon: 'error',
          title: isUpdate ? 'Update Failed' : 'Creation Failed',
          text: errorMessage,
          customClass: {
            popup: 'hospital-swal-popup',
            title: 'hospital-swal-title',
            htmlContainer: 'hospital-swal-text',
            confirmButton: 'hospital-swal-button',
          },
        });
      },
    });
  }

  // buljk upload

  async onFileSelected(event: any) {
    const Swal = (await import('sweetalert2')).default;

    const file: File = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.selectedFile = file;
    } else {
      Swal.fire('Invalid File', 'Please upload a valid CSV file.', 'error');
    }
  }

  async uploadCSV() {
    const Swal = (await import('sweetalert2')).default;

    if (!this.selectedFile) {
      Swal.fire('No File', 'Please select a CSV file to upload.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.masterService.uploadSymptomsCSV(formData).subscribe({
      next: (response: any) => {
        Swal.fire('Success', 'Symptoms imported successfully.', 'success');
        this.selectedFile = null;
        this.router.navigateByUrl('/master/symptomslist');
      },
      error: (error) => {
        console.error('Upload error:', error);
        Swal.fire(
          'Upload Failed',
          'Failed to import Symptoms. Check file format.',
          'error'
        );
      },
    });
  }
}
