// dietchart.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  FormArray,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DietchartService } from '../../bedwisedietchart/service/dietchart.service';
import { IpdService } from '../../ipdservice/ipd.service';

@Component({
  selector: 'app-dietchart',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dietchart.component.html',
  styleUrls: ['./dietchart.component.css'],
})
export class DietchartComponent implements OnInit {
  dietForm!: FormGroup;
  patientData: any = null;
  bedData: any = null;
  isLoading = false;
  isSubmitting = false;
  minDate: string = '';
  existingDietChart: any = null;
  showExistingChartWarning = false;
  user: string = '';

  dietTypes = [
    { value: 'normal', label: 'Normal Diet' },
    { value: 'diabetic', label: 'Diabetic Diet' },
    { value: 'cardiac', label: 'Cardiac Diet' },
    { value: 'renal', label: 'Renal Diet' },
    { value: 'liquid', label: 'Liquid Diet' },
    { value: 'soft', label: 'Soft Diet' },
    { value: 'npom', label: 'NPO Modified' },
  ];

  mealTimes = [
    { value: 'breakfast', label: 'Breakfast', icon: 'fas fa-sun' },
    { value: 'lunch', label: 'Lunch', icon: 'fas fa-sun' },
    { value: 'evening_snack', label: 'Evening Snack', icon: 'fas fa-coffee' },
    { value: 'dinner', label: 'Dinner', icon: 'fas fa-moon' },
    { value: 'night_snack', label: 'Night Snack', icon: 'fas fa-moon' },
  ];

  commonFoodItems = {
    breakfast: [
      'Oats',
      'Milk',
      'Bread',
      'Butter',
      'Jam',
      'Fruits',
      'Tea',
      'Coffee',
    ],
    lunch: ['Rice', 'Roti', 'Dal', 'Vegetables', 'Curd', 'Pickle', 'Salad'],
    evening_snack: ['Biscuits', 'Tea', 'Coffee', 'Fruits', 'Juice'],
    dinner: ['Rice', 'Roti', 'Dal', 'Vegetables', 'Soup', 'Milk'],
    night_snack: ['Milk', 'Biscuits', 'Fruits'],
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dietService: DietchartService,
    private ipdService: IpdService
  ) {
    this.minDate = new Date().toISOString().split('T')[0];
    this.initializeForm();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['id']) {
        this.loadPatientData(params['id']);
      }
    });
  }

  initializeForm(): void {
    this.dietForm = this.fb.group({
      dietType: ['normal'],
      meals: this.fb.array([]),
      totalCalories: [''],
      waterIntake: ['2-3 liters/day'],
      restrictions: [''],
      allergies: [''],
      remarks: [''],
      createdBy: ['', Validators.required],
      dietDate: [new Date().toISOString().split('T')[0], Validators.required],
    });

    this.setUserFromStorage();
    this.initializeMeals();

    // ✅ Watch for date changes to check existing charts
    this.dietForm.get('dietDate')?.valueChanges.subscribe((date) => {
      if (date && this.patientData) {
        this.checkExistingDietChart(date);
      }
    });
  }

  private setUserFromStorage(): void {
    const userStr = localStorage.getItem('authUser');
    console.log('Raw user data from localStorage:', userStr);

    if (userStr && userStr !== '[]' && userStr !== 'null') {
      try {
        const parsedUser = JSON.parse(userStr);
        console.log('Parsed user:', parsedUser);

        const userId = parsedUser._id || parsedUser.id || parsedUser.userId;

        if (userId) {
          this.user = userId;
          this.dietForm.patchValue({ createdBy: userId });
          console.log('✅ User ID set:', userId);
        } else {
          this.handleAuthError();
        }
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        this.handleAuthError();
      }
    } else {
      console.warn('⚠️ No authenticated user found in localStorage');
      this.handleAuthError();
    }
  }

  private async handleAuthError(): Promise<void> {
    const Swal = (await import('sweetalert2')).default;
    Swal.fire({
      icon: 'error',
      title: 'Authentication Required',
      text: 'Please login again to continue.',
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button',
      },
    });
  }

  get mealsArray(): FormArray {
    return this.dietForm.get('meals') as FormArray;
  }

  loadPatientData(patientId: string): void {
    this.isLoading = true;

    this.ipdService.getIPDcaseById(patientId).subscribe({
      next: (response) => {
        this.patientData = response.data || response;
        this.bedData = {
          bedNumber: this.patientData.bed_id?.bed_number,
          roomNumber: this.patientData.room_id?.roomNumber,
        };
        this.isLoading = false;

        // ✅ Check existing chart for today's date
        const today = new Date().toISOString().split('T')[0];
        this.checkExistingDietChart(today);
      },
      error: (error) => {
        console.error('Error loading patient data:', error);
        this.isLoading = false;
      },
    });
  }

  // ✅ Fixed method
  checkExistingDietChart(date: string): void {
    if (!this.patientData) return;

    console.log('🔍 Checking existing diet chart for:', {
      inpatientCaseId: this.patientData._id,
      dietDate: date
    });

    // ✅ Use the case-specific API endpoint
    this.dietService.getDietChartsByCase(this.patientData._id, {
      dietDate: date
    }).subscribe({
      next: (response) => {
        console.log('📊 Diet chart check response:', response);

        if (response.success && response.data && response.data.length > 0) {
          this.existingDietChart = response.data[0];
          this.showExistingChartWarning = true;
          console.log('⚠️ Existing diet chart found:', this.existingDietChart);
        } else {
          this.existingDietChart = null;
          this.showExistingChartWarning = false;
          console.log('✅ No existing diet chart found');
        }
      },
      error: (error) => {
        console.error('Error checking existing diet chart:', error);
        this.existingDietChart = null;
        this.showExistingChartWarning = false;
      }
    });
  }

  // ✅ Load existing diet chart into form
  loadExistingDietChart(): void {
    if (!this.existingDietChart) return;

    this.dietForm.patchValue({
      dietType: this.existingDietChart.dietType,
      totalCalories: this.existingDietChart.totalCalories || '',
      waterIntake: this.existingDietChart.waterIntake,
      restrictions: Array.isArray(this.existingDietChart.restrictions)
        ? this.existingDietChart.restrictions.join(', ')
        : this.existingDietChart.restrictions || '',
      allergies: Array.isArray(this.existingDietChart.allergies)
        ? this.existingDietChart.allergies.join(', ')
        : this.existingDietChart.allergies || '',
      remarks: this.existingDietChart.remarks,
    });

    // Clear existing meals and load from chart
    this.mealsArray.clear();
    this.existingDietChart.meals.forEach((meal: any) => {
      const mealGroup = this.fb.group({
        time: [meal.time],
        items: this.fb.array(
          meal.items.map((item: any) =>
            this.fb.group({
              name: [item.name],
              quantity: [item.quantity || ''],
              instructions: [item.instructions || ''],
            })
          )
        ),
        specialInstructions: [meal.specialInstructions || ''],
      });
      this.mealsArray.push(mealGroup);
    });

    this.showExistingChartWarning = false;
  }

  initializeMeals(): void {
    this.mealsArray.clear();
    this.mealTimes.forEach((meal) => {
      this.mealsArray.push(
        this.fb.group({
          time: [meal.value],
          items: this.fb.array([this.createMealItem()]),
          specialInstructions: [''],
        })
      );
    });
  }

  // ✅ FIXED: Remove required validation from meal item names
  createMealItem(): FormGroup {
    return this.fb.group({
      name: [''], // ✅ Removed Validators.required - now optional
      quantity: [''],
      instructions: [''],
    });
  }

  getMealItemsArray(mealIndex: number): FormArray {
    return this.mealsArray.at(mealIndex).get('items') as FormArray;
  }

  addMealItem(mealIndex: number): void {
    this.getMealItemsArray(mealIndex).push(this.createMealItem());
  }

  removeMealItem(mealIndex: number, itemIndex: number): void {
    if (this.getMealItemsArray(mealIndex).length > 1) {
      this.getMealItemsArray(mealIndex).removeAt(itemIndex);
    }
  }

  addCommonFoodItem(mealIndex: number, foodItem: string): void {
    const itemsArray = this.getMealItemsArray(mealIndex);

    const exists = itemsArray.controls.some(
      (control) =>
        control.get('name')?.value.toLowerCase() === foodItem.toLowerCase()
    );

    if (!exists) {
      const emptyIndex = itemsArray.controls.findIndex(
        (control) => !control.get('name')?.value
      );

      if (emptyIndex >= 0) {
        itemsArray.at(emptyIndex).get('name')?.setValue(foodItem);
      } else {
        const newItem = this.createMealItem();
        newItem.get('name')?.setValue(foodItem);
        itemsArray.push(newItem);
      }
    }
  }

  getMealTimeData(mealIndex: number): any {
    const mealTime = this.mealsArray.at(mealIndex).get('time')?.value;
    return this.mealTimes.find((meal) => meal.value === mealTime);
  }

  getCommonFoodItems(mealIndex: number): string[] {
    const mealTime = this.mealsArray.at(mealIndex).get('time')?.value;
    return (
      this.commonFoodItems[mealTime as keyof typeof this.commonFoodItems] || []
    );
  }

  // ✅ FIXED: Custom form validation - check if form has essential data
  isFormValid(): boolean {
    // Check if required fields are filled
    const hasValidDietType = !!this.dietForm.get('dietType')?.value;
    const hasValidDate = !!this.dietForm.get('dietDate')?.value;
    const hasValidCreatedBy = !!this.dietForm.get('createdBy')?.value;

    // Check if at least one meal has at least one food item
    const hasAtLeastOneMealItem = this.mealsArray.controls.some((meal: any) => {
      const items = meal.get('items') as FormArray;
      return items.controls.some((item: any) => {
        const foodName = item.get('name')?.value;
        return foodName && foodName.trim() !== '';
      });
    });

    return hasValidDietType && hasValidDate && hasValidCreatedBy && hasAtLeastOneMealItem;
  }

  // ✅ ADDED: SweetAlert2 validation and submission
  async saveDietChart(): Promise<void> {
    const Swal = (await import('sweetalert2')).default;

    // ✅ Form validation with SweetAlert
    if (!this.isFormValid()) {
      this.dietForm.markAllAsTouched();

      const errors = [];
      if (!this.dietForm.get('dietType')?.value) errors.push('Diet Type');
      if (!this.dietForm.get('dietDate')?.value) errors.push('Diet Date');
      if (!this.dietForm.get('createdBy')?.value) errors.push('User Authentication');

      // Check if no meal items
      const hasAtLeastOneMealItem = this.mealsArray.controls.some((meal: any) => {
        const items = meal.get('items') as FormArray;
        return items.controls.some((item: any) => {
          const foodName = item.get('name')?.value;
          return foodName && foodName.trim() !== '';
        });
      });

      if (!hasAtLeastOneMealItem) {
        errors.push('At least one meal item');
      }

      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Diet Chart',
        html: `Please fill in the following required fields:<br><br><strong>${errors.join(', ')}</strong>`,
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
      return;
    }

    if (!this.patientData) {
      Swal.fire({
        icon: 'warning',
        title: 'No Patient Selected',
        text: 'Please select a patient before creating the diet chart.',
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
      return;
    }

    // ✅ Check if updating existing chart
    if (this.existingDietChart) {
      this.updateExistingDietChart();
      return;
    }

    this.isSubmitting = true;

    const formData = {
      ...this.dietForm.value,
      bedId: this.patientData.bed_id?._id,
      roomId: this.patientData.room_id?._id,
      patientId: this.patientData.uniqueHealthIdentificationId?._id,
      inpatientCaseId: this.patientData._id,
      dietDate: new Date(this.dietForm.value.dietDate),
    };

    // ✅ Filter out empty meal items but keep meals with at least one item
    formData.meals = formData.meals.map((meal: any) => ({
      ...meal,
      items: meal.items.filter(
        (item: any) => item.name && item.name.trim() !== ''
      ),
    })).filter((meal: any) => meal.items.length > 0); // ✅ Only keep meals that have items

    console.log('🔄 Submitting diet chart data:', formData);

    this.dietService.createDietChart(formData).subscribe({
      next: async (response) => {
        console.log('✅ Diet chart created successfully:', response);
        this.isSubmitting = false;

        // ✅ Success SweetAlert with options
        const result = await Swal.fire({
          icon: 'success',
          title: 'Diet Chart Created Successfully!',
          html: `Diet chart for <strong>${this.patientData.uniqueHealthIdentificationId?.patient_name}</strong> has been created successfully.`,
          showCancelButton: true,
          confirmButtonText: '<i class="fas fa-eye"></i> View Patient Summary',
          cancelButtonText: '<i class="fas fa-arrow-left"></i> Back to Diet Charts',
          allowOutsideClick: false,
          customClass: {
            popup: 'hospital-swal-popup',
            title: 'hospital-swal-title',
            htmlContainer: 'hospital-swal-text',
            confirmButton: 'hospital-swal-button btn-success',
            cancelButton: 'hospital-swal-button btn-primary',
          },
        });

        if (result.isConfirmed && response.data) {
          // Navigate to patient summary
          this.router.navigate(['/ipdpatientsummary'], {
            queryParams: {
              id: response.data?.inpatientCaseId?._id,
            },
          });
        } else {
          // Navigate back to diet charts
          this.router.navigate(['/ipd/bedwisedietchart']);
        }
      },
      error: async (error) => {
        console.error('❌ Error creating diet chart:', error);
        this.isSubmitting = false;

        if (error.error?.message?.includes('already exists')) {
          Swal.fire({
            icon: 'warning',
            title: 'Diet Chart Already Exists',
            text: 'A diet chart already exists for this patient on the selected date. Please choose a different date or update the existing chart.',
            customClass: {
              popup: 'hospital-swal-popup',
              title: 'hospital-swal-title',
              htmlContainer: 'hospital-swal-text',
              confirmButton: 'hospital-swal-button',
            },
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Creation Failed',
            text: error.error?.message || 'Failed to create diet chart. Please try again.',
            customClass: {
              popup: 'hospital-swal-popup',
              title: 'hospital-swal-title',
              htmlContainer: 'hospital-swal-text',
              confirmButton: 'hospital-swal-button',
            },
          });
        }
      },
    });
  }

  // ✅ New method to update existing chart with SweetAlert
  async updateExistingDietChart(): Promise<void> {
    const Swal = (await import('sweetalert2')).default;

    this.isSubmitting = true;

    const formData = {
      ...this.dietForm.value,
      dietDate: new Date(this.dietForm.value.dietDate),
    };

    // ✅ Filter out empty meal items but keep meals with at least one item
    formData.meals = formData.meals.map((meal: any) => ({
      ...meal,
      items: meal.items.filter(
        (item: any) => item.name && item.name.trim() !== ''
      ),
    })).filter((meal: any) => meal.items.length > 0); // ✅ Only keep meals that have items

    this.dietService
      .updateDietChart(this.existingDietChart._id, formData)
      .subscribe({
        next: async (response) => {
          console.log('✅ Diet chart updated successfully:', response);
          this.isSubmitting = false;

          // ✅ Success SweetAlert for update
          await Swal.fire({
            icon: 'success',
            title: 'Diet Chart Updated Successfully!',
            html: `Diet chart for <strong>${this.patientData.uniqueHealthIdentificationId?.patient_name}</strong> has been updated successfully.`,
            timer: 2000,
            timerProgressBar: true,
            customClass: {
              popup: 'hospital-swal-popup',
              title: 'hospital-swal-title',
              htmlContainer: 'hospital-swal-text',
              confirmButton: 'hospital-swal-button',
            },
          });

          this.router.navigate(['/ipd/bedwisedietchart']);
        },
        error: async (error) => {
          console.error('❌ Error updating diet chart:', error);
          this.isSubmitting = false;

          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: error.error?.message || 'Failed to update diet chart. Please try again.',
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

  goBack(): void {
    this.router.navigate(['/ipd/patientdietchart']);
  }

  getDietTypeLabel(type: string): string {
    const dietType = this.dietTypes.find((d) => d.value === type);
    return dietType ? dietType.label : type;
  }
}
