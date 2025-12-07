import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MasterService } from '../../../mastermodule/masterservice/master.service';

@Component({
  selector: 'app-medpackagee',
  imports: [CommonModule, RouterModule,ReactiveFormsModule],
  templateUrl: './medpackagee.component.html',
  styleUrl: './medpackagee.component.css'
})
export class MedpackageeComponent {

  stock: FormGroup;
  medicines: any[] = [];
  selectedMedicines: any[] = [];
  dropdownOpenMedicines = false;
  isSubmitting = false;
  editMode = false;
  stockId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private masterServie: MasterService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.stock = this.fb.group({
      medicineGroupName: ['', Validators.required],
      medicines: [[], Validators.required],
      pharmacyName: ['', Validators.required],
      batch_no: [''],
      price: [0, Validators.required],
      stock: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    // Fetch all medicines
    this.masterServie.getMedicine().subscribe(res => {
      this.medicines = res.data;
    });

    // Check for edit mode from the query parameter
    this.route.queryParams.subscribe(params => {
      this.stockId = params['_id'] || null;
      this.editMode = !!this.stockId;
      if (this.editMode && this.stockId) {
        this.loadStock(this.stockId);
      }
    });
  }

  loadStock(id: string): void {
    this.masterServie.getMedicinestock().subscribe((res: any) => {
      const pack = res.stocks.find((p: any) => p._id === id);
      console.log("🚀 ~ MedpackageeComponent ~ this.masterServie.getMedicinestock ~ pack:", pack)
      if (pack) {
        // Filter medicines from the list based on stock's medicines array (by ID)
        const selected = this.medicines.filter((m: any) => pack.medicines.includes(m._id));

        // Patch form values
        this.selectedMedicines = selected;
        this.stock.patchValue({
          medicineGroupName: pack.medicineGroupName,
          pharmacyName: pack.pharmacyName,
          batch_no: pack.batch_no,
          price: pack.price,
          stock: pack.stock,
          medicines: pack.medicines  // Patch with selected medicine IDs
        });
      }
    });
  }

  toggleMedicineDropdown() {
    this.dropdownOpenMedicines = !this.dropdownOpenMedicines;
  }

  isMedicineSelected(medicine: any): boolean {
    return this.selectedMedicines.some(m => m._id === medicine._id);
  }

  selectMedicine(medicine: any): void {
    if (!this.isMedicineSelected(medicine)) {
      this.selectedMedicines.push(medicine);
      this.stock.get('medicines')?.setValue(this.selectedMedicines.map(m => m._id));  // Set the IDs of selected medicines
    }
  }

  removeMedicine(medicine: any): void {
    this.selectedMedicines = this.selectedMedicines.filter(m => m._id !== medicine._id);
    this.stock.get('medicines')?.setValue(this.selectedMedicines.map(m => m._id));  // Update form value with remaining IDs
  }

  OnSubmit(): void {
    if (this.stock.invalid) {
      this.stock.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const payload = this.stock.value;

    // Either create a new stock or update an existing one based on editMode
    const request$ = this.editMode && this.stockId
      ? this.masterServie.updateMedicinestock(this.stockId, payload)
      : this.masterServie.postMedicinestock(payload);

    request$.subscribe({
      next: () => {
        alert(`Stock ${this.editMode ? 'updated' : 'created'} successfully.`);
        this.router.navigate(['/doctor/medpackagelist']);
      },
      error: err => {
        const errorMessage = err?.error?.message || 'Submission failed.';
        alert(errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/doctor/medpackagelist']);
  }
}
