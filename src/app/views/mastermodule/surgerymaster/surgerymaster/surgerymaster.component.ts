import { Component } from '@angular/core';
import { CustomtimepickerComponent } from '../../../../component/customtimepicker/customtimepicker.component';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';
// import Swal from 'sweetalert2';

@Component({
  selector: 'app-surgerymaster',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './surgerymaster.component.html',
  styleUrl: './surgerymaster.component.css',
})
export class SurgerymasterComponent {
  surgerymaster: FormGroup;
  editMode = false;
  isSubmitting = false;
  surgeryid: string | null = null;
  surgery: any[] = [];
  categoryOptions: string[] = [];
  allCategories: string[] = [];
  categorySearchControl = new FormControl('');
  selectedCategories: string[] = [];
  filteredCategories: string[] = [];
  dropdownOpenCategory = false;

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.surgerymaster = fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      risk: [false], // ✅ No need for Validators.required for checkbox
      emergency: [false],
      grade: ['', Validators.required],
      amount: [0, Validators.required],
    });
  }

  userPermissions: any = {};
  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'surgeryService'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions
    // Fetch all symptoms and medicines

    this.masterService.getsurgerymaster().subscribe((res) => {
      this.surgery = res.services;
      console.log(
        '🚀 ~ SymtopmsGrouplistComponent ~ this.masterSymtopmsGroup.getSymptoms ~ symptoms:',
        this.surgery
      );

      // Extract unique categories
      // 🟢 Dynamically extract unique categories
      const categoriesSet = new Set<string>();
      this.surgery.forEach((surgery: any) => {
        if (Array.isArray(surgery.category)) {
          surgery.category.forEach((cat: string) => categoriesSet.add(cat));
        } else if (typeof surgery.category === 'string') {
          categoriesSet.add(surgery.category);
        }
      });

      this.allCategories = Array.from(categoriesSet);
      this.filteredCategories = [...this.allCategories];
    });

    this.categorySearchControl.valueChanges.subscribe((search) => {
      this.filteredCategories = this.allCategories.filter(
        (c) =>
          c.toLowerCase().includes((search ?? '').toLowerCase()) &&
          !this.selectedCategories.includes(c)
      );
    });

    // Check for package ID in route params for edit mode
    this.route.queryParams.subscribe((params) => {
      this.surgeryid = params['_id'] || null;
      this.editMode = !!this.surgeryid;

      // If editing, load the package data
      if (this.editMode && this.surgeryid) {
        this.loadSurgery(this.surgeryid);
      }
    });
  }

  selectCategory(category: string) {
    if (!this.selectedCategories.includes(category)) {
      this.selectedCategories.push(category);
      this.surgerymaster.get('category')?.setValue(this.selectedCategories);
    }
    this.categorySearchControl.setValue('');
    this.dropdownOpenCategory = false;
  }

  removeCategory(category: string) {
    this.selectedCategories = this.selectedCategories.filter(
      (c) => c !== category
    );
    this.surgerymaster.get('category')?.setValue(this.selectedCategories);
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  loadSurgery(packageId: string) {
    this.masterService.getsurgerymasterById(packageId).subscribe((res: any) => {
      // const pack = res.services.find((p: any) => p._id === packageId);
      // console.log("🚀 ~ SurgerymasterComponent ~ Found surgery:", pack);
      const pack = res.services[0];
      console.log(
        '🚀 ~ SurgerymasterComponent ~ this.masterService.getsurgerymasterById ~ pack:',
        pack
      );
      console.log(pack.category);
      this.selectedCategories = pack.category || [];

      if (pack) {
        this.surgerymaster.patchValue({
          name: pack.name,
          category: this.selectedCategories,
          risk: pack.risk,
          emergency: pack.emergency,
          grade: pack.grade,
          amount: pack.amount,
        });
      } else {
        console.warn('Package not found for ID:', packageId);
      }
    });
  }

  async onSubmit() {
    const Swal = (await import('sweetalert2')).default;

    if (this.surgerymaster.invalid || this.isSubmitting) {
      this.surgerymaster.markAllAsTouched();

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

    this.isSubmitting = true;
    const formValue = this.surgerymaster.value;

    const request$ =
      this.editMode && this.surgeryid
        ? this.masterService.updatesurgerymaster(this.surgeryid, formValue)
        : this.masterService.postsurgerymaster(formValue);

    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.editMode ? 'Surgery Updated' : 'Surgery Created',
          text: `Surgery package has been ${
            this.editMode ? 'updated' : 'created'
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

        this.surgerymaster.reset();
        this.router.navigate(['/master/surgerymasterlist']);
      },
      error: (err) => {
        console.error(
          `Error while ${this.editMode ? 'updating' : 'creating'} surgery:`,
          err
        );
        this.isSubmitting = false;

        Swal.fire({
          icon: 'error',
          title: this.editMode ? 'Update Failed' : 'Creation Failed',
          text:
            err?.error?.message ||
            `    Something went wrong while ${
              this.editMode ? 'updating' : 'creating'
            } the surgery.`,
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

  handleError(error: any, context: string) {
    console.error(`Error on ${context}:`, error);
    const errorMessage =
      error?.error?.message || `Failed to ${context} package.`;
    alert(errorMessage);
  }

  // buljk upload

  uploadMode: 'single' | 'bulk' = 'single';
  selectedFile: File | null = null;
async  onFileSelected(event: any) {
    const Swal = (await import('sweetalert2')).default;

    const file: File = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.selectedFile = file;
    } else {
      Swal.fire('Invalid File', 'Please upload a valid CSV file.', 'error');
    }
  }

  async uploadCSV(){
    const Swal = (await import('sweetalert2')).default;

    if (!this.selectedFile) {
      Swal.fire('No File', 'Please select a CSV file to upload.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.masterService.uploadSurgeryCSV(formData).subscribe({
      next: (response: any) => {
        Swal.fire({
          icon: 'success',
          title: this.editMode ? 'Surgery Updated' : 'Surgery Created',
          text: `Bulk Surgery package has been Uploaded successfully.`,
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

        this.router.navigate(['/master/surgerymasterlist']);
        this.selectedFile = null;
      },
      error: (error) => {
        console.error('Upload error:', error);
        Swal.fire({
          icon: 'error',
          title: this.editMode ? 'Update Failed' : 'Creation Failed',
          text:
            error?.error?.message ||
            `    Something went wrong while Bulk Upload of the Surgery.`,
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
}
