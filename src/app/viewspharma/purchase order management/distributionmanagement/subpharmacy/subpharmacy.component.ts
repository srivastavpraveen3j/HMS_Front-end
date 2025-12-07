  // subpharmacy.component.ts
  import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { MasterService } from '../../../../views/mastermodule/masterservice/master.service';
  import { Router } from '@angular/router';

  interface Pharmacy {
    _id?: string;
    name: string;
    type: 'General Ward' | 'Emergency' | 'Specialty Unit';
    status: 'active' | 'inactive';
    location: string;
    pharmacist: string;
    patient_volume: 'High' | 'Medium' | 'Low';
    operating_hours: string;
    contact_info?: {
      phone?: string;
      email?: string;
    };
    storage_capacity?: number;
    special_categories?: string[];
  }

  interface NewPharmacyForm {
    name: string;
    location: string;
    type: string;
    managerName: string;
    expectedPatientVolume: string;
    operatingHours: string;
    specialCategories: string[];
    storageCapacity: number;
    additionalNotes: string;
    phone: string;
    email: string;
  }

  interface StockAllocationItem {
    name: string;
    medicine_name?: string;
    medicine_id?: string;
    units: number;
    cost: number;
    critical: boolean;
    available_stock?: number;
    supplier?: string;
  }

  @Component({
    selector: 'app-subpharmacy',
    imports: [CommonModule, FormsModule],
    templateUrl: './subpharmacy.component.html',
    styleUrl: './subpharmacy.component.css'
  })
  export class SubpharmacyComponent implements OnInit {
    confirmationChecked = false;
    totalPharmacies = 0;
    emergencyUnits = 0;
    specialtyUnits = 0;

    // Modal state
    showAddPharmacyModal = false;
    currentStep = 1;
    totalSteps = 4;

    // Form data
    newPharmacyForm: NewPharmacyForm = {
      name: '',
      location: '',
      type: '',
      managerName: '',
      expectedPatientVolume: 'Low',
      operatingHours: '8AM-5PM',
      specialCategories: [],
      storageCapacity: 0,
      additionalNotes: '',
      phone: '',
      email: ''
    };

    // Updated stock allocation with proper typing
    stockAllocation: StockAllocationItem[] = [
      {
        name: 'Paracetamol 500mg',
        medicine_name: 'Paracetamol 500mg',
        units: 10,
        cost: 10.50,
        critical: false,
        available_stock: 0
      },
      {
        name: 'Amoxicillin 250mg',
        medicine_name: 'Amoxicillin 250mg',
        units: 105,
        cost: 15.75,
        critical: false,
        available_stock: 0
      },
      {
        name: 'Insulin Regular',
        medicine_name: 'Insulin Regular',
        units: 27,
        cost: 337.50,
        critical: true,
        available_stock: 0
      },
      {
        name: 'Morphine 10mg',
        medicine_name: 'Morphine 10mg',
        units: 16,
        cost: 40.00,
        critical: true,
        available_stock: 0
      },
      {
        name: 'Adrenaline 1mg',
        medicine_name: 'Adrenaline 1mg',
        units: 11,
        cost: 165.00,
        critical: true,
        available_stock: 0
      }
    ];

    pharmacyTypes = ['General Ward', 'Emergency', 'Specialty Unit'];
    volumeOptions = ['Low', 'Medium', 'High'];
    operatingHoursOptions = ['8AM-5PM', '6AM-10PM', '8AM-8PM', '24/7'];
    specialCategoryOptions = [
      'Controlled Substances',
      'Refrigerated Medications',
      'Chemotherapy Drugs',
      'Emergency Medications'
    ];

    // This will now load from database
    pharmacies: Pharmacy[] = [];
    availableMedicines: any[] = [];

    constructor(private masterService: MasterService, private router : Router) {}

    ngOnInit() {
      this.loadPharmacies();
      this.loadAvailableMedicines();
    }

    loadAvailableMedicines() {
      this.masterService.getMedicine(1, 100, '').subscribe({
        next: (res: any) => {
          this.availableMedicines = res.data || [];
          console.log('Available medicines:', this.availableMedicines);
          this.updateStockAllocationWithMedicineIds();
        },
        error: (err) => {
          console.error('Error loading medicines:', err);
        }
      });
    }

    updateStockAllocationWithMedicineIds() {
      this.stockAllocation = this.stockAllocation.map(stockItem => {
        const medicine = this.availableMedicines.find(med =>
          med.medicine_name.toLowerCase().includes(stockItem.name.toLowerCase())
        );

        return {
          ...stockItem,
          medicine_id: medicine?._id || null,
          medicine_name: medicine?.medicine_name || stockItem.name,
          supplier: medicine?.supplier || 'Unknown',
          available_stock: medicine?.stock || 0
        };
      }).filter(item => item.medicine_id !== null);

      console.log('Updated stock allocation:', this.stockAllocation);
    }

    loadPharmacies() {
      this.masterService.getSubPharmacies().subscribe({
        next: (res: any) => {
          console.log('Loaded pharmacies from API:', res);
          this.pharmacies = res.data || [];
          this.calculateStats();
        },
        error: (err) => {
          console.error('Error loading pharmacies:', err);
          alert('Failed to load pharmacies. Please check your backend connection.');
        }
      });
    }

    calculateStats() {
      this.totalPharmacies = this.pharmacies.length;
      this.emergencyUnits = this.pharmacies.filter(p => p.type === 'Emergency').length;
      this.specialtyUnits = this.pharmacies.filter(p => p.type === 'Specialty Unit').length;
    }

    resetForm() {
      this.newPharmacyForm = {
        name: '',
        location: '',
        type: '',
        managerName: '',
        expectedPatientVolume: 'Low',
        operatingHours: '8AM-5PM',
        specialCategories: [],
        storageCapacity: 0,
        additionalNotes: '',
        phone: '',
        email: ''
      };
      this.confirmationChecked = false;
    }

    nextStep() {
      if (this.currentStep < this.totalSteps && this.canProceedToNext()) {
        this.currentStep++;
      }
    }

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    }

    onSpecialCategoryChange(category: string, checked: boolean) {
      if (checked) {
        this.newPharmacyForm.specialCategories.push(category);
      } else {
        const index = this.newPharmacyForm.specialCategories.indexOf(category);
        if (index > -1) {
          this.newPharmacyForm.specialCategories.splice(index, 1);
        }
      }
    }

    isSpecialCategorySelected(category: string): boolean {
      return this.newPharmacyForm.specialCategories.includes(category);
    }

    getTotalStockValue(): number {
      return this.stockAllocation.reduce((total, item) => total + item.cost, 0);
    }

    getTotalStockItems(): number {
      return this.stockAllocation.reduce((total, item) => total + item.units, 0);
    }

    getCriticalMedications(): number {
      return this.stockAllocation.filter(item => item.critical).length;
    }

 createPharmacy() {
  if (!this.confirmationChecked) {
    alert('Please confirm the pharmacy details');
    return;
  }

  const validStockItems = this.stockAllocation.filter(item => item.medicine_id);

  if (validStockItems.length === 0) {
    alert('No valid medicines found for allocation. Please ensure medicines exist in the system.');
    return;
  }

  // ✅ NEW: Check for insufficient stock BEFORE creating pharmacy
  const insufficientStockItems = validStockItems.filter(item =>
    (item.available_stock || 0) < item.units
  );

  if (insufficientStockItems.length > 0) {
    const insufficientList = insufficientStockItems.map(item =>
      `• ${item.medicine_name}: Available ${item.available_stock || 0}, Requested ${item.units}`
    ).join('\n');

    alert(`❌ Cannot create pharmacy due to insufficient stock:\n\n${insufficientList}\n\nPlease reduce the requested quantities or restock medicines first.`);
    return;
  }

  // ✅ Only proceed if ALL medicines have sufficient stock
  const pharmacyData = {
    name: this.newPharmacyForm.name,
    type: this.newPharmacyForm.type,
    location: this.newPharmacyForm.location,
    pharmacist: this.newPharmacyForm.managerName,
    operating_hours: this.newPharmacyForm.operatingHours,
    patient_volume: this.newPharmacyForm.expectedPatientVolume,
    contact_info: {
      phone: this.newPharmacyForm.phone,
      email: this.newPharmacyForm.email
    },
    storage_capacity: this.newPharmacyForm.storageCapacity,
    special_categories: this.newPharmacyForm.specialCategories,
    initial_stock_allocation: validStockItems.map(item => ({
      medicine_id: item.medicine_id!,
      units: item.units,
      cost: item.cost,
      critical: item.critical
    }))
  };

  console.log('Creating pharmacy with sufficient stock:', pharmacyData);

  this.masterService.createSubPharmacyWithStock(pharmacyData).subscribe({
    next: (response) => {
      console.log('Pharmacy created successfully:', response);
      alert(`✅ Pharmacy created successfully!\n📦 ${response.data.initial_stock_count} medicines distributed`);
      this.loadPharmacies();
      this.closeModal();
    },
    error: (error) => {
      console.error('Full error object:', error);
      let errorMessage = 'Failed to create pharmacy.';

      if (error?.error?.message) {
        errorMessage += `\n\nError: ${error.error.message}`;
      }

      alert(errorMessage);
    }
  });
}

// ✅ Updated: Stricter validation for step 3
canProceedToNext(): boolean {
  switch (this.currentStep) {
    case 1:
      return !!(this.newPharmacyForm.name &&
              this.newPharmacyForm.location &&
              this.newPharmacyForm.type &&
              this.newPharmacyForm.managerName);
    case 2:
      return true;
    case 3:
      // ✅ All medicines must have sufficient stock to proceed
      return this.stockAllocation.every(item =>
        (item.available_stock || 0) >= item.units
      );
    default:
      return false;
  }
}

// ✅ Add method to check if there are any stock issues
hasStockIssues(): boolean {
  return this.stockAllocation.some(item =>
    (item.available_stock || 0) < item.units
  );
}

// ✅ Get list of insufficient stock items
getInsufficientStockItems(): StockAllocationItem[] {
  return this.stockAllocation.filter(item =>
    (item.available_stock || 0) < item.units
  );
}


    getAvailableMedicinesCount(): number {
      return this.stockAllocation.filter(item =>
        (item.available_stock || 0) >= item.units
      ).length;
    }



  //   viewStock(pharmacyId: any) {
  //     console.log('Loading stock for pharmacy:', pharmacyId);

  // this.router.navigate(['/inventorylayout/pharmamanagementlist', pharmacyId]);


  // //     this.masterService.getSubPharmacyStock(pharmacyId).subscribe({
  // //       next: (res: any) => {
  // //         console.log('Pharmacy stock loaded:', res);
  // //         const summary = res.summary;
  // //         const medicines = res.data;

  // //         alert(`📊 Stock Summary:
  // // 🏥 Pharmacy: ${medicines[0]?.sub_pharmacy?.name || 'Unknown'}
  // // 💊 Total Medicines: ${summary.total_medicines}
  // // 💰 Total Value: ₹${summary.total_value.toFixed(2)}
  // // ⚠️ Low Stock Items: ${summary.low_stock_items}
  // // ❌ Out of Stock: ${summary.out_of_stock_items}`);

  // //         if (medicines.length > 0) {
  // //           console.table(medicines.map((med: any) => ({
  // //             'Medicine': med.medicine.medicine_name,
  // //             'Stock': med.current_stock,
  // //             'Value': `₹${(med.current_stock * (med.batch_details[0]?.unit_price || 0)).toFixed(2)}`
  // //           })));
  // //         }
  // //       },
  // //       error: (err) => {
  // //         console.error('Error loading stock:', err);
  // //         alert('Failed to load pharmacy stock');
  // //       }
  // //     });
  // // pharmamanagementlist

  //   }


  viewStock(pharmacyId: any) {
    console.log('Navigating to pharmacy:', pharmacyId);
    this.router.navigate(['/inventorylayout/pharmamanagementlist', pharmacyId])
      .then(success => console.log('Navigation success?', success));
  }

    bulkTransfer() {
      console.log('Bulk Transfer clicked');
    }

    createRequest(pharmacyId: any) {
      console.log('Create Request for:', pharmacyId);
    }

    getPharmacyIcon(type: string): string {
      switch (type) {
        case 'General Ward': return '🏥';
        case 'Emergency': return '🚨';
        case 'Specialty Unit': return '💊';
        default: return '🏥';
      }
    }

    getStatusClass(status: string): string {
      return status === 'active' ? 'status-active' : 'status-inactive';
    }

    getVolumeClass(volume: string): string {
      switch (volume) {
        case 'High': return 'volume-high';
        case 'Medium': return 'volume-medium';
        case 'Low': return 'volume-low';
        default: return '';
      }
    }

    addPharmacy() {
      this.showAddPharmacyModal = true;
      this.currentStep = 1;
      this.resetForm();
      document.body.classList.add('modal-open');
    }

    closeModal() {
      this.showAddPharmacyModal = false;
      this.currentStep = 1;
      this.resetForm();
      document.body.classList.remove('modal-open');
    }
  }
