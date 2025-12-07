import { Component, EventEmitter, forwardRef, NgModule, Output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Bed {
  id: number;
  occupied: boolean;
  booked: boolean;
  patientName?: string;
  condition?: string;
}

@Component({
  selector: 'app-customward',
  templateUrl: './customward.component.html',
  styleUrls: ['./customward.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomwardComponent),
      multi: true,
    },
  ],
})
export class CustomwardComponent {
  value: string = '';
  onChange: any = () => {};
  onTouched: any = () => {};

  selectedWard: string = '';
  selectedBed: string = '';

  wardList = [
    'ICU WARD - Roomno:123',
    'DELUX WARD - Roomno:113',
    'SUPER DELUX WARD Roomno:103',
    'TWIN SHARING - Roomno:113',
    'GENERAL WARD - Roomno:456',
    'EXAMINATION ROOM - Roomno:113',
  ];

  bedsData: any = {
    'ICU WARD - Roomno:123': this.generateBeds(),
    'DELUX WARD - Roomno:113': this.generateBeds(),
    'SUPER DELUX WARD Roomno:103': this.generateBeds(),
    'TWIN SHARING - Roomno:113': this.generateBeds(),
    'GENERAL WARD - Roomno:456': this.generateBeds(),
    'EXAMINATION ROOM - Roomno:113': this.generateBeds(),
  };

  bedImages: any = {
    'ICU WARD - Roomno:123': 'bed2.png',
    'DELUX WARD - Roomno:113': 'bed.png',
    'SUPER DELUX WARD Roomno:103': 'double-bed.png',
    'TWIN SHARING - Roomno:113': 'double-bed (1).png',
    'GENERAL WARD - Roomno:456': 'generalbed.png',
    'EXAMINATION ROOM - Roomno:113': 'surgery-room.png',
  };

  getBeds(ward: string): Bed[] {
    return this.bedsData[ward] || [];
  }


  getBedImage(ward: string): string {
    return this.bedImages[ward] || 'default-bed.png';
  }

  generateBeds() {
    return Array.from({ length: 10 }, (_, i) => ({
      id: 100 + i + 1,
      occupied: false,
      booked: false,
      patientName: '',
      condition: 'Stable',
    }));
  }

  selectSingleBed(selectedBed: Bed): void {
    if (!selectedBed.occupied) {
      this.getBeds(this.selectedWard).forEach((bed) => {
        if (bed !== selectedBed) bed.booked = false;
      });
      selectedBed.booked = !selectedBed.booked;
      this.selectedBed = `${this.selectedWard} - Bed ${selectedBed.id}`; // Combine ward and bed info
      this.onChange(this.selectedBed); // Notify the parent form of the selected bed
    }
  }



  onWardChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedWard = selectElement?.value;
    if (selectedWard) {
      this.selectedWard = selectedWard;
      this.loadBedsForWard(selectedWard);
    }
  }

  loadBedsForWard(ward: string): void {
    console.log(`Loading beds for: ${ward}`);
  }

  // NG_VALUE_ACCESSOR methods
  writeValue(value: any): void {
    if (value) {
      this.selectedBed = value;  // Set the value if it's provided from the parent
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;  // Capture the onChange function to notify the parent
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
