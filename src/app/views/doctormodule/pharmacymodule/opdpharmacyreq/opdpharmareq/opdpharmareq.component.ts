import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule, FormArray, AbstractControl, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, of, switchMap } from 'rxjs';
import { IpdService } from '../../../../ipdmodule/ipdservice/ipd.service';
import { MasterService } from '../../../../mastermodule/masterservice/master.service';
import { DoctorService } from '../../../doctorservice/doctor.service';
import { UhidService } from '../../../../uhid/service/uhid.service';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
// import Swal from 'sweetalert2';
import { OpdService } from '../../../../opdmodule/opdservice/opd.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-opdpharmareq',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './opdpharmareq.component.html',
  styleUrl: './opdpharmareq.component.css',
})
export class OpdpharmareqComponent {
  pharmareq: FormGroup;
  manuallySelected = false;
  filteredPatients: any[] = [];
  showSuggestions = false;
  selectedPatient: any = null;
  selectedPatientDetails: any = null;
  medicines: any[] = [];
  medicineSearchControl = new FormControl('');
  activeFilter: 'today' | 'dateRange' = 'today';
  dropdownOpen = false;
  uhidTodayRecords: any[] = [];
  filteredMedicines: any[] = []; //
  filteredCases: any[] = []; // Initialize as empty array, not undefined
  userPermissions: any = {};
  userId: string = '';
  editMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ipdservice: IpdService,
    private masterservice: MasterService,
    private doctorservice: DoctorService,
    private uhidService: UhidService,
    private opdservce: OpdService,
    private toastr : ToastrService
  ) {
    this.pharmareq = this.fb.group({
      uniqueHealthIdentificationId: ['', Validators.required],
      patientType: ['outpatientDepartment', Validators.required],
      patient_name: ['', Validators.required],
      requestForType: ['Sales', Validators.required],
      billtype: ['cash', Validators.required],
      charge: [],
      additionalRemarks: [''],
      pharmacistUserId: [''],
      status: ['pending'],
      quantity: [[0]],
      caseNo: [''],
      outpatientCaseUniqueId : [Validators.required],
      // PharmaceuticalRequestList: ['664fcdd12baf4a1b74f203db'],
      medicinesArray: this.fb.array([]),
      // When creating the FormGroup for each row, add:
      medicine_name: [''],
      searchTerm: [''],
    });
  }

  onMedicineSelected(index: number) {
    const formGroup = this.medicinesArray.at(index);
    const selectedMedicineName = formGroup.get('medicine_name')?.value;

    const selectedMedicine = this.medicines.find(
      (med) => med.medicine_name === selectedMedicineName
    );

    console.log('Selected medicine for row', index, ':', selectedMedicine);

    if (selectedMedicine) {
      formGroup.get('charge')?.setValue(selectedMedicine.price);
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  ngOnInit(): void {
    const userData = localStorage.getItem('authUser');
    // console.log(JSON.parse(localStorage.getItem('authUser') || ''));

// load data of opdcase

 this.route.queryParams.subscribe((params) => {
  const patientId = params['patientId'];   // 👈 changed
  if (patientId) {
    this.loadOpdPharmareqByPatientId(patientId);
  }
});
// load data of opdcase


    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userId = user?._id || '';
      } catch (e) {
        console.error('Error parsing authUser from localStorage:', e);
      }
    }
    // console.log('User ID:', this.userId);

    // Load permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'pharmaceuticalRequestList'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // Load UHID initially
    this.loadTodaysUHID();

    // Patient autocomplete filtering
    const nameControl = this.pharmareq.get('patient_name');
    const uhidControl = this.pharmareq.get('caseNo');

    combineLatest([
      nameControl!.valueChanges.pipe(startWith('')),
      uhidControl!.valueChanges.pipe(startWith('')),
    ])
      .pipe(
        debounceTime(300),
        switchMap(([patient_name, caseNo]) => {
          if (this.manuallySelected) return of({ uhids: [] });

          const filters: { [key: string]: string } = {};
          if (patient_name && patient_name.length > 2)
            filters['patient_name'] = patient_name;
          if (caseNo && caseNo.length > 2) filters['uhid'] = caseNo;

          return Object.keys(filters).length
            ? this.uhidService.getPatientByFilters(filters)
            : of({ uhids: [] });
        })
      )
      .subscribe((response: any) => {
        if (!this.manuallySelected) {
          this.filteredPatients = response?.uhids || [];
          this.showSuggestions = this.filteredPatients.length > 0;
        }
      });

    // Medicine search autocomplete
    this.medicineSearchControl.valueChanges
      .pipe(
        startWith(''),
        map((val) => val ?? ''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm: string) => {
          return searchTerm.length > 1
            ? this.masterservice.getMedicinenyname({
                medicine_name: searchTerm,
              })
            : of({ data: [] });
        })
      )
      .subscribe((res: any) => {
        this.filteredMedicines = res?.data || [];
      });

    this.loadPharmareq();
  }

  // uhid fo toadys
  showUHIDDropdown: boolean = false;

  loadTodaysUHID(): void {
    const today = new Date().toISOString().split('T')[0];

    // this.uhidService.getUhid(1, 100, `dor=${today}`).subscribe(res => {
    //   this.uhidTodayRecords = res.uhids;

    //   console.log("Today's UHID Records:", this.uhidTodayRecords);
    // }, err => {
    //   console.error("Error loading today's UHID:", err);
    // });

    this.opdservce.getOPDcase(1, 100, '').subscribe((res) => {
      const allRecords = res.outpatientCases || [];

      const today = new Date().toISOString().split('T')[0];
      this.uhidTodayRecords = allRecords.filter((record: any) => {
        const createdDate = new Date(record.createdAt)
          .toISOString()
          .split('T')[0];
        return createdDate === today;
      });

      console.log("Today's OPD Cases:", this.uhidTodayRecords);
    });
  }

  onPatientSuggestionClick(patient: any): void {
    this.selectPatient(patient);
  }


  // selectMedicine(med: any) {
  //   const alreadyExists = this.medicinesArray.controls.some(
  //     (ctrl) => ctrl.get('medicine_name')?.value === med.medicine_name
  //   );

  //   if (!alreadyExists) {
  //     this.medicinesArray.push(
  //       this.fb.group({
  //         medicine_name: [med.medicine_name],
  //         quantity: [1],
  //         charge: [med.price],
  //       })
  //     );
  //   }

  //   // Clear search and dropdown
  //   this.medicineSearchControl.setValue('');
  //   this.filteredMedicines = [];
  // }



checkQuantity(index: number): void {
  const row = this.medicinesArray.at(index);
  const enteredQty = row.get('quantity')?.value;
  const available = row.get('availableStock')?.value;

  if (enteredQty > available) {
    row.get('quantity')?.setValue(available);
    this.toastr.warning(
      `Only <strong>${available}</strong> units are available in stock.`,
      'Stock Limit Exceeded',
      {
        enableHtml: true,
        timeOut: 5000,
        positionClass: 'toast-bottom-right',
        closeButton: true,
        progressBar: true,
      }
    );
  }

  if (enteredQty < 1) {
    row.get('quantity')?.setValue(1);
    this.toastr.info(
      `Minimum quantity is <strong>1</strong>.`,
      'Invalid Quantity',
      {
        enableHtml: true,
        timeOut: 3000,
        positionClass: 'toast-bottom-right',
        closeButton: true,
        progressBar: true,
      }
    );
  }
}


  stockWarning: boolean = false;

selectMedicine(med: any) {
  if (med.stock === 0) {
    this.stockWarning = true;
    setTimeout(() => (this.stockWarning = false), 3000);
    return;
  }

  const alreadyExists = this.medicinesArray.controls.some(
    (ctrl) => ctrl.get('medicine_name')?.value === med.medicine_name
  );

  if (!alreadyExists) {
    this.medicinesArray.push(
      this.fb.group({
        medicine_name: [med.medicine_name],
        quantity: [1],
        charge: [med.price],
        availableStock: [med.stock] // ✅ Hidden control used for validation only
      })
    );
  }

  this.medicineSearchControl.setValue('');
  this.filteredMedicines = [];
}


  removeMedicineRow(index: number) {
    this.medicinesArray.removeAt(index);
  }

  selectPatientFromUHID(record: any): void {
    console.log('Selected from UHID dropdown:', record);

    // Reuse your existing patient select logic
    this.selectPatient(record);

    // Close dropdown
    this.showUHIDDropdown = false;
  }

  fetchAllUHIDCases(): Promise<any[]> {
    const pageSize = 50;
    let currentPage = 1;
    let allCases: any[] = [];

    return new Promise((resolve) => {
      const fetchPage = () => {
        this.opdservce
          .getOPDcase(currentPage, pageSize)
          .subscribe((res: any) => {
            const data = res.outpatientCases || [];
            allCases = [...allCases, ...data];

            if (data.length === pageSize) {
              currentPage++;
              fetchPage(); // Fetch next page
            } else {
              resolve(allCases);
            }
          });
      };

      fetchPage();
    });
  }

  // load pharma req
  loadPharmareq() {
    this.route.queryParams.subscribe((params) => {
      const opdpharmareqid = params['_id'] || null;

      this.doctorservice
        .getpharmareqById(opdpharmareqid)
        .subscribe((res: any) => {
          const opdpharmareq = res[0];
          console.log('🚀 Loaded Pharmacy Request:', opdpharmareq);

          if (opdpharmareq) {
            this.editMode = true;
            // 🔍 Fetch all UHID data to find the matching patient
            // this.opdservce.getOPDcase().subscribe((uhidRes) => {
            //   const uhiddata = uhidRes.outpatientCases || [];
            //   console.log(
            //     '🚀 ~ OpdpharmareqComponent ~ this.uhidService.getUhid ~ uhiddata:',
            //     uhiddata
            //   );

            this.fetchAllUHIDCases().then((uhiddata: any[]) => {
              console.log('🚀 All UHID Data:', uhiddata);

              // 🔄 Match the UHID from the request
             console.log(
               'Matching UHID against:',
               opdpharmareq?.uniqueHealthIdentificationId
             );

             const matchedUHID = uhiddata.filter(
               (u: any) =>
                 u?.uniqueHealthIdentificationId?._id ===
                 opdpharmareq?.uniqueHealthIdentificationId
             );

              console.log("matched",matchedUHID);
              const patientName =
                matchedUHID.length > 0
                  ? matchedUHID[0]?.uniqueHealthIdentificationId?.patient_name ||
                    ''
                  : '';
                  const uhid = matchedUHID.length > 0
                  ? matchedUHID[0]?.uniqueHealthIdentificationId?.uhid ||
                    ''
                  : '';

              // ✅ Patch form fields
              this.pharmareq.patchValue({
                patient_name: patientName,
                caseNo: uhid,
                billtype: opdpharmareq.billingType,
                requestfor: opdpharmareq.requestForType,
                status: opdpharmareq.status,
                uniqueHealthIdentificationId:
                  opdpharmareq.uniqueHealthIdentificationId,
              });
            });

            // ✅ Patch medicines array
            const packages = opdpharmareq.packages || [];
            this.medicinesArray.clear();

            packages.forEach((pkg: any) => {
              this.medicinesArray.push(
                this.fb.group({
                  medicine_name: [pkg.medicineName],
                  quantity: [pkg.quantity],
                  charge: [pkg.charge],
                  checkbox: this.fb.group({
                    morning: [pkg.checkbox?.morning || false],
                    noon: [pkg.checkbox?.noon || false],
                    evening: [pkg.checkbox?.evening || false],
                    night: [pkg.checkbox?.night || false],
                  }),
                })
              );
            });
          } else {
            console.warn('Pharma Request not found for ID:', opdpharmareqid);
          }
        });
    });
  }

  get medicinesArray(): FormArray {
    return this.pharmareq.get('medicinesArray') as FormArray;
  }

  getCheckboxControl(
    row: AbstractControl,
    time: 'morning' | 'noon' | 'evening' | 'night'
  ): FormControl {
    const control = row.get(['checkbox', time]);
    if (!control) throw new Error(`Missing checkbox.${time} control`);
    return control as FormControl;
  }

  addMedicineRow() {
    const medicineGroup = this.fb.group({
      medicine_name: [''],
      checkbox: this.fb.group({
        morning: [false],
        noon: [false],
        evening: [false],
        night: [false],
      }),
      quantity: [0],
      charge: [''],
    });

    this.medicinesArray.push(medicineGroup);
  }

  selectPatient(patient: any): void {
    this.manuallySelected = true;
    this.selectedPatient = patient;

    this.pharmareq.patchValue({
      caseNo: patient.uhid || patient?.uniqueHealthIdentificationId?.uhid,
      patient_name:
        patient?.patient_name ||
        patient?.uniqueHealthIdentificationId?.patient_name,
      age: patient?.age || patient?.uniqueHealthIdentificationId?.age,
      gender: patient?.gender || patient?.uniqueHealthIdentificationId?.age,
      uniqueHealthIdentificationId:
        patient?.uniqueHealthIdentificationId?._id || patient?._id,
      uhid: patient?.uniqueHealthIdentificationId?.uhid || patient.uhid,
    });

    this.filteredPatients = [];
    this.showSuggestions = false;
  }

  onPatientInput(): void {
    const searchTerm = this.pharmareq.get('patient_name')?.value?.trim() || '';

    if (this.manuallySelected && searchTerm.length < 3) {
      this.manuallySelected = false;
      this.selectedPatient = null;
    }

    // No suggestions below 3 characters
    if (searchTerm.length < 3) {
      this.filteredPatients = [];
      this.showSuggestions = false;
      return;
    }

    // This flag will work *only if* filteredPatients is already populated
    this.showSuggestions = this.filteredPatients.length > 0;
  }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }


 async OnSubmit(){
    const Swal = (await import('sweetalert2')).default;

    if (this.pharmareq.invalid) {
      this.pharmareq.markAllAsTouched();
      return;
    }

    const formValue = this.pharmareq.value;

    const payload = {
      uniqueHealthIdentificationId: formValue.uniqueHealthIdentificationId, // ✅ just use as-is
      requestForType: formValue.requestForType.toLowerCase(),
      patientType: formValue.patientType,
      pharmacistUserId: formValue.pharmacistUserId || this.userId,
      billingType: formValue.billtype,
      status: formValue.status,
      packages: formValue.medicinesArray.map((med: any) => ({
        medicineName: med.medicine_name,
        quantity: Number(med.quantity) || 0,
        dosageInstruction: med.dosageInstruction || '',
        charge: Number(med.charge) || 0,
        checkbox: {
          morning: !!med.checkbox?.morning,
          noon: !!med.checkbox?.noon,
          evening: !!med.checkbox?.evening,
          night: !!med.checkbox?.night,
        },
      })),
    };

    this.route.queryParams.subscribe((params) => {
      const opdpharmareqid = params['_id'] || null;

      if (opdpharmareqid) {
        this.doctorservice.updatePharmareq(opdpharmareqid, payload).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Pharma Request Updated',
              text: 'Pharma request Updated successfully!',
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
            this.pharmareq.reset();
            this.router.navigateByUrl('/doctor/opdpharmareqlist');
          },
          error: (err) => {
            console.error('Error update pharma request:', err);
            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text: err?.error?.message || 'Failed to update pharma request.',
              customClass: {
                popup: 'hospital-swal-popup',
                title: 'hospital-swal-title',
                htmlContainer: 'hospital-swal-text',
                confirmButton: 'hospital-swal-button',
              },
            });
          },
        });
      } else {
        console.log(
          '🚀 ~ OpdpharmareqComponent ~ this.doctorservice.postPharmareq ~ payload:',
          payload
        );
        this.doctorservice.postPharmareq(payload).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Pharma Request Sent',
              text: 'Pharma request sent successfully!',
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
            this.pharmareq.reset();
            this.router.navigateByUrl('/doctor/opdpharmareqlist');
          },
          error: (err) => {
            console.error('Error submitting pharma request:', err);
            Swal.fire({
              icon: 'error',
              title: 'Submission Failed',
              text: err?.error?.message || 'Failed to submit pharma request.',
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
    });
    // this.doctorservice.postPharmareq(payload).subscribe({
    //   next: () => {
    //     Swal.fire({
    //       icon: 'success',
    //       title: 'Pharma Request Sent',
    //       text: 'Pharma request sent successfully!',
    //       position: 'top-end',
    //       toast: true,
    //       timer: 3000,
    //       showConfirmButton: false,
    //       customClass: {
    //         popup: 'hospital-toast-popup',
    //         title: 'hospital-toast-title',
    //         htmlContainer: 'hospital-toast-text',
    //       }
    //     });
    //     this.pharmareq.reset();
    //     this.router.navigateByUrl('/doctor/opdpharmareqlist');
    //   },
    //   error: (err) => {
    //     console.error('Error submitting pharma request:', err);
    //     Swal.fire({
    //       icon: 'error',
    //       title: 'Submission Failed',
    //       text: err?.error?.message || 'Failed to submit pharma request.',
    //       customClass: {
    //         popup: 'hospital-swal-popup',
    //         title: 'hospital-swal-title',
    //         htmlContainer: 'hospital-swal-text',
    //         confirmButton: 'hospital-swal-button',
    //       }
    //     });
    //   }
    // });
  }

  //   onMedicineSelected(index: number) {
  //   const medicineName = this.medicinesArray.at(index).get('medicine_name')?.value;
  //   if (!medicineName) {
  //     // Clear charge if no medicine selected
  //     this.medicinesArray.at(index).patchValue({ charge: '' });
  //     return;
  //   }

  //   const selectedMedicine = this.medicines.find(med => med.medicine_name === medicineName);

  //   if (selectedMedicine) {
  //     this.medicinesArray.at(index).patchValue({ charge: selectedMedicine.price });
  //   } else {
  //     this.medicinesArray.at(index).patchValue({ charge: '' });
  //   }
  // }

patient : any [] = [];
  loadOpdPharmareqByPatientId(patientId : string){
     this.opdservce.getOPDcaseById(patientId).subscribe({
      next: (opdcase: any) => {
        console.log("opdcase", opdcase);
        this.patient = opdcase;
        const uhidId = opdcase.uniqueHealthIdentificationId._id;

        // Fetch UHID details separately
        this.uhidService.getUhidById(uhidId).subscribe({
          next: (uhid: any) => {
            // console.log("🚀 ~ OpdbillComponent ~ this.uhidService.getUhidById ~ uhid:", uhid)

            this.pharmareq.patchValue({
              caseNo: uhid.uhid || '',
              patient_name: uhid.patient_name || '',
              age: uhid.age || '',
              gender: uhid.gender || '',
              uniqueHealthIdentificationId: uhid._id,
              patientUhidId: uhid._id,
              // Add more fields if needed
            });
            this.manuallySelected = true; // prevent "no match" error
          },

          error: (err) => {
            console.error('Error fetching UHID:', err);
          },
        });
      },
      error: (err) => {
        console.error('Error fetching OPD case:', err);
      },
  });
};
}



