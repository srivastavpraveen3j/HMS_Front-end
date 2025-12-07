import { Component } from '@angular/core';
import { MasterService } from '../../views/mastermodule/masterservice/master.service';
import { debounceTime, of, switchMap } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-pharmamedcineserach',
  imports: [],
  templateUrl: './pharmamedcineserach.component.html',
  styleUrl: './pharmamedcineserach.component.css'
})
export class PharmamedcineserachComponent {

//   medicineSearchControl = new FormControl('');
//   filteredMedicines: any[] = []; //

//   constructor(private masterservice : MasterService){}

//    ngOnInit(): void {

//     // Medicine search autocomplete
//     this.medicineSearchControl.valueChanges
//       .pipe(
//         startWith(''),
//         map((val) => val ?? ''),
//         debounceTime(300),
//         distinctUntilChanged(),
//         switchMap((searchTerm: string) => {
//           return searchTerm.length > 1
//             ? this.masterservice.getMedicinenyname({
//                 medicine_name: searchTerm,
//               })
//             : of({ data: [] });
//         })
//       )
//       .subscribe((res: any) => {
//         this.filteredMedicines = res?.data || [];
//       });

//     // this.loadPharmareq();

// //     // amount total
// //        this.pharmareq.get('total')?.valueChanges.subscribe(() => {
// //       this.roundTotal();
// //     });

// //       this.medicinesArray.controls.forEach((group: AbstractControl) => {
// //   group.get('quantity')?.valueChanges.subscribe(() => this.roundTotal());
// //   group.get('charge')?.valueChanges.subscribe(() => this.roundTotal());
// // });


//   }


//   stockWarning: boolean = false;

// selectMedicine(med: any) {
//   if (med.stock === 0) {
//     this.stockWarning = true;
//     setTimeout(() => (this.stockWarning = false), 3000);
//     return;
//   }

//   const alreadyExists = this.medicinesArray.controls.some(
//     (ctrl) => ctrl.get('medicine_name')?.value === med.medicine_name
//   );

//   if (!alreadyExists) {
//     const medicineGroup = this.fb.group({
//       medicine_name: [med.medicine_name],
//       quantity: [1],
//       charge: [med.price],
//       dosageInstruction: [''],
//       checkbox: this.fb.group({
//         morning: [false],
//         noon: [false],
//         evening: [false],
//         night: [false],
//       }),
//     });

//     // Subscribe to quantity or charge changes for this medicine
//     medicineGroup.get('quantity')?.valueChanges.subscribe(() => this.roundTotal());
//     medicineGroup.get('charge')?.valueChanges.subscribe(() => this.roundTotal());

//     this.medicinesArray.push(medicineGroup);
//     this.roundTotal(); // Recalculate immediately
//   }

//   this.medicineSearchControl.setValue('');
//   this.filteredMedicines = [];
// }

//   removeMedicineRow(index: number) {
//     this.medicinesArray.removeAt(index);
//     this.roundTotal()
//   }


//     onMedicineSelected(index: number) {
//     const formGroup = this.medicinesArray.at(index);
//     const selectedMedicineName = formGroup.get('medicine_name')?.value;

//     const selectedMedicine = this.medicines.find(
//       (med) => med.medicine_name === selectedMedicineName
//     );

//     // console.log('Selected medicine for row', index, ':', selectedMedicine);

//     if (selectedMedicine) {
//       formGroup.get('charge')?.setValue(selectedMedicine.price);
//     }
//   }

//   toggleDropdown() {
//     this.dropdownOpen = !this.dropdownOpen;
//   }


}
