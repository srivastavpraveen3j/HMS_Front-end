// bedwisedietchart.component.ts
import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DietchartService } from './service/dietchart.service';
import { LetterheaderComponent } from '../../settingsmodule/letterhead/letterheader/letterheader.component';

@Component({
  selector: 'app-bedwisedietchart',
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LetterheaderComponent
  ],
  templateUrl: './bedwisedietchart.component.html',
  styleUrl: './bedwisedietchart.component.css'
})
export class BedwisedietchartComponent implements OnInit {

  bedWiseData: any[] = [];
  isLoading = false;
  selectedDate = new Date().toISOString().split('T')[0];
  showCreateModal = false;
  selectedPatient: any = null;
  dietForm!: FormGroup;
  today = new Date();

  dietTypes = [
    { value: 'normal', label: 'Normal Diet' },
    { value: 'diabetic', label: 'Diabetic Diet' },
    { value: 'cardiac', label: 'Cardiac Diet' },
    { value: 'renal', label: 'Renal Diet' },
    { value: 'liquid', label: 'Liquid Diet' },
    { value: 'soft', label: 'Soft Diet' },
    { value: 'npom', label: 'NPO Modified' }
  ];

  mealTimes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'evening_snack', label: 'Evening Snack' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'night_snack', label: 'Night Snack' }
  ];

  constructor(
    private dietService: DietchartService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadBedWiseData();
  }

  initializeForm(): void {
    this.dietForm = this.fb.group({
      dietType: ['normal'],
      meals: this.fb.array([]),
      totalCalories: [''],
      waterIntake: [''],
      restrictions: [''],
      allergies: [''],
      remarks: ['']
    });
  }

  get mealsArray(): FormArray {
    return this.dietForm.get('meals') as FormArray;
  }

  loadBedWiseData(): void {
    this.isLoading = true;

    this.dietService.getBedWiseDietCharts().subscribe({
      next: (response) => {
        this.bedWiseData = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bed-wise data:', error);
        this.isLoading = false;
      }
    });
  }

  openCreateDietModal(patient: any): void {
    this.selectedPatient = patient;
    this.showCreateModal = true;
    this.initializeMeals();
  }

  initializeMeals(): void {
    this.mealsArray.clear();
    this.mealTimes.forEach(meal => {
      this.mealsArray.push(this.fb.group({
        time: [meal.value],
        items: this.fb.array([this.createMealItem()]),
        specialInstructions: ['']
      }));
    });
  }

  createMealItem(): FormGroup {
    return this.fb.group({
      name: [''],
      quantity: [''],
      instructions: ['']
    });
  }

  getMealItemsArray(mealIndex: number): FormArray {
    return this.mealsArray.at(mealIndex).get('items') as FormArray;
  }

  addMealItem(mealIndex: number): void {
    this.getMealItemsArray(mealIndex).push(this.createMealItem());
  }

  removeMealItem(mealIndex: number, itemIndex: number): void {
    this.getMealItemsArray(mealIndex).removeAt(itemIndex);
  }

  saveDietChart(): void {
    if (this.dietForm.valid && this.selectedPatient) {
      const formData = {
        ...this.dietForm.value,
        bedId: this.selectedPatient.bedInfo.bedId,
        patientId: this.selectedPatient.patientInfo.id,
        inpatientCaseId: this.selectedPatient.patientInfo.id,
        dietDate: new Date(this.selectedDate)
      };

      this.dietService.createDietChart(formData).subscribe({
        next: (response) => {
          console.log('Diet chart created successfully');
          this.closeModal();
          this.loadBedWiseData();
        },
        error: (error) => {
          console.error('Error creating diet chart:', error);
        }
      });
    }
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.selectedPatient = null;
    this.dietForm.reset();
  }

  viewDietChart(patient: any): void {
    this.router.navigate(['/ipdpatientsummary'], {
      queryParams: {
        id: patient.patientInfo.id,
      }
    });
  }

  getDietTypeLabel(type: string): string {
    const dietType = this.dietTypes.find(d => d.value === type);
    return dietType ? dietType.label : type;
  }

  getMealTimeLabel(time: string): string {
    const mealTime = this.mealTimes.find(m => m.value === time);
    return mealTime ? mealTime.label : time;
  }

  // ✅ Browser Print Function (NOT PDF) - Using window.print()
  printDietChart(): void {
    try {
      console.log('🔄 Starting browser print...');

      // Check if we have patients with diet charts
      const patientsWithDietCharts = this.getPatientsWithDietCharts();
      if (patientsWithDietCharts.length === 0) {
        alert('No patients with diet charts found to print.');
        return;
      }

      // Get the print content
      const printSection = document.getElementById('letterheader-section');
      if (!printSection) {
        alert('Print content not found. Please try again.');
        return;
      }

      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');

      if (!printWindow) {
        alert('Please allow pop-ups for this site to enable printing.');
        return;
      }

      // Write the HTML content to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Patient Diet List</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
              vertical-align: top;
            }

            th {
              background-color: #475569 !important;
              color: white !important;
              font-weight: bold;
            }

            .header {
              text-align: center;
              margin-bottom: 20px;
            }

            .header h1 {
              font-size: 18px;
              margin: 0;
              font-weight: bold;
            }

            .header p {
              margin: 5px 0;
              font-size: 12px;
            }

            .meals-cell {
              white-space: pre-line;
              font-size: 12px;
              max-width: 200px;
            }

            @media print {
              body { margin: 0; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              thead { display: table-header-group; }
              tbody { display: table-row-group; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${this.getLetterheaderHtml()}
            <h1>PATIENT DIET LIST</h1>
            <p>Diet Date: ${new Date(this.selectedDate).toLocaleDateString('en-GB')}</p>
            <p>Generated on: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Room Number/Bed No.</th>
                <th>In Patient Name</th>
                <th>U C Doctor</th>
                <th>Diet Type</th>
                <th>Meals & Food Items</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${this.getPrintTableRows()}
            </tbody>
          </table>
        </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for the content to load, then print
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };

      console.log('✅ Print window opened');

    } catch (error) {
      console.error('❌ Error generating print:', error);
      alert(`Error generating print: ${(error as Error).message}`);
    }
  }

  // ✅ Get letterheader HTML content
  private getLetterheaderHtml(): string {
    // You can customize this to match your letterheader component output
    return `
      <div style="text-align: center; margin-bottom: 10px;">
        <h2 style="margin: 0; font-size: 16px;">PP MANIYA HOSPITAL PVT. LTD.</h2>
        <p style="margin: 0; font-size: 12px;">Your hospital address and contact details</p>
      </div>
    `;
  }

  // ✅ Generate table rows for printing
  private getPrintTableRows(): string {
    const patientsWithDietCharts = this.getPatientsWithDietCharts();

    if (patientsWithDietCharts.length === 0) {
      return `
        <tr>
          <td colspan="6" style="text-align: center; padding: 20px;">
            No patients with diet charts found for the selected date.
          </td>
        </tr>
      `;
    }

    return patientsWithDietCharts.map(patient => `
      <tr>
        <td>${this.getBedNumber(patient)}</td>
        <td>${patient.patientInfo.name || ''}</td>
        <td>${patient.patientInfo.doctorName || ''}</td>
        <td>${this.getDietTypeLabel(patient.dietChart?.dietType) || ''}</td>
        <td class="meals-cell">${this.getDetailedMealsString(patient.dietChart?.meals) || 'No meals planned'}</td>
        <td>${patient.dietChart?.remarks || ''}</td>
      </tr>
    `).join('');
  }

  // ✅ Export to Excel Function
  async exportToExcel(): Promise<void> {
    try {
      const patientsWithDietCharts = this.getPatientsWithDietCharts();
      if (patientsWithDietCharts.length === 0) {
        alert('No patients with diet charts found to export.');
        return;
      }

      const XLSX = await import('xlsx');
      const excelData = this.prepareExcelData();

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();

      ws['!cols'] = [
        { width: 20 }, { width: 25 }, { width: 15 }, { width: 10 }, { width: 10 },
        { width: 25 }, { width: 15 }, { width: 30 }, { width: 30 }, { width: 30 },
        { width: 30 }, { width: 30 }, { width: 20 }, { width: 25 }, { width: 25 },
        { width: 20 }, { width: 15 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Diet Chart');
      const fileName = `Diet_Chart_${new Date(this.selectedDate).toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  }

  // ✅ PUBLIC: Get patients with diet charts (for template usage)
  getPatientsWithDietCharts(): any[] {
    return this.bedWiseData.filter(patient => patient.hasDietChart);
  }

  // ✅ PUBLIC: Get proper bed number (for template usage) - FIXED
  getBedNumber(patient: any): string {
    const room = patient.bedInfo?.roomNumber;
    const bed = patient.bedInfo?.bedNumber;

    if (room && bed) {
      return `${room}/${bed}`;
    } else if (bed) {
      return bed;
    } else if (room) {
      return room;
    } else {
      const patientRoom = patient.patientInfo?.roomNumber;
      const patientBed = patient.patientInfo?.bedNumber;

      if (patientRoom && patientBed) {
        return `${patientRoom}/${patientBed}`;
      }

      return 'TBA';
    }
  }

  // ✅ PUBLIC: Get detailed meals with food items and timing (for template usage)
  getDetailedMealsString(meals: any[]): string {
    if (!meals || meals.length === 0) return 'No meals planned';

    return meals.map(meal => {
      const mealTime = this.getMealTimeLabel(meal.time);
      const items = meal.items || [];

      if (items.length === 0) {
        return `${mealTime}: Not specified`;
      }

      const foodItems = items
        .filter((item: any) => item.name && item.name.trim() !== '')
        .map((item: any) => {
          let foodStr = item.name;
          if (item.quantity) {
            foodStr += ` (${item.quantity})`;
          }
          return foodStr;
        })
        .join(', ');

      return `${mealTime}: ${foodItems || 'Not specified'}`;
    }).join('\n');
  }

  // ✅ Prepare data for Excel export
  private prepareExcelData(): any[] {
    return this.getPatientsWithDietCharts().map(patient => ({
      'Room Number/Bed No.': this.getBedNumber(patient),
      'In Patient Name': patient.patientInfo.name || '',
      'UHID': patient.patientInfo.uhid || '',
      'Age': patient.patientInfo.age || '',
      'Gender': patient.patientInfo.gender || '',
      'U C Doctor': patient.patientInfo.doctorName || '',
      'Diet Type': this.getDietTypeLabel(patient.dietChart?.dietType) || '',
      'Morning (Breakfast)': this.getMealDetails(patient.dietChart?.meals, 'breakfast'),
      'Afternoon (Lunch)': this.getMealDetails(patient.dietChart?.meals, 'lunch'),
      'Evening (Snack)': this.getMealDetails(patient.dietChart?.meals, 'evening_snack'),
      'Night (Dinner)': this.getMealDetails(patient.dietChart?.meals, 'dinner'),
      'Night Snack': this.getMealDetails(patient.dietChart?.meals, 'night_snack'),
      'Water Intake': patient.dietChart?.waterIntake || '',
      'Restrictions': Array.isArray(patient.dietChart?.restrictions)
        ? patient.dietChart.restrictions.join(', ')
        : patient.dietChart?.restrictions || '',
      'Allergies': Array.isArray(patient.dietChart?.allergies)
        ? patient.dietChart.allergies.join(', ')
        : patient.dietChart?.allergies || '',
      'Remarks': patient.dietChart?.remarks || '',
      'Created Date': patient.dietChart?.createdAt
        ? new Date(patient.dietChart.createdAt).toLocaleDateString('en-GB')
        : ''
    }));
  }

  // ✅ Get specific meal details
  private getMealDetails(meals: any[], mealType: string): string {
    if (!meals || meals.length === 0) return 'Not planned';

    const meal = meals.find(m => m.time === mealType);
    if (!meal || !meal.items || meal.items.length === 0) {
      return 'Not planned';
    }

    const foodItems = meal.items
      .filter((item: any) => item.name && item.name.trim() !== '')
      .map((item: any) => {
        let foodStr = item.name;
        if (item.quantity) {
          foodStr += ` (${item.quantity})`;
        }
        if (item.instructions) {
          foodStr += ` - ${item.instructions}`;
        }
        return foodStr;
      })
      .join('; ');

    let result = foodItems || 'Items not specified';

    if (meal.specialInstructions) {
      result += `\nSpecial: ${meal.specialInstructions}`;
    }

    return result;
  }
}
