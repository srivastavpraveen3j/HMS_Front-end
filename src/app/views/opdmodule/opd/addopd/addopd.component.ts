// addopd.component.ts
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';
import { CustomtimepickerComponent } from '../../../../component/customtimepicker/customtimepicker.component';
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { UhidService } from '../../../uhid/service/uhid.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of, firstValueFrom, forkJoin } from 'rxjs';
import { OpdService } from '../../opdservice/opd.service';
import { combineLatest } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { RoleService } from '../../../mastermodule/usermaster/service/role.service';
// import Swal from 'sweetalert2';
interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'date' | 'time' | 'textarea' | 'select' | 'radio' | 'email' | 'checkbox';
  required?: boolean;
  options?: string[];
  fullWidth?: boolean;
  condition?: () => boolean;
}


@Component({
  selector: 'app-addopd',
  standalone: true,
  templateUrl: './addopd.component.html',
  styleUrls: ['./addopd.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CustomcalendarComponent,
    FormsModule
  ],
})
export class AddopdComponent implements OnInit {
  opdForm!: FormGroup;
  isMLC: string = 'no';
  doctors: any[] = [];
  filteredPatients: any[] = [];
  showSuggestions = false;
  manuallySelected = false;
  opdcases: any[] = [];
  editMode = false;
  opdcaseId: string = '';
  isSubmitting = false;
  opdhistory: any[] = [];
  vistingdate: any[] = [];
  billtotalamlount: any[] = [];
  billtotalreceived: any[] = [];
  billdeposit: any[] = [];
  pancard: string = '';
  adharcard: string = '';
  emailAddress: string = '';
  activeFilter: 'today' | 'dateRange' = 'today';
  billreceivedMap: { [billId: string]: number[] } = {};
  billtotalMap: { [billId: string]: number[] } = {};
  billDepositMap: { [billId: string]: number[] } = {};
  uhidTodayRecords: any[] = [];

  patientId: string = '';
  medicoData: any[] = [];
  medicoId: string = '';
  treatDoctor: string = '';
  treatDoctorId: string = '';
  medicoCase: any = {};
  isDiscountRequested: boolean = false;
  DiscountStatus: any;
  discountedAmount: any;
  AmountReceivable: any;
  appointmentId: string = '';
  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private uhidService: UhidService,
    private opdservice: OpdService,
    private router: Router,
    private route: ActivatedRoute,
    private role: RoleService
  ) {
    this.createForm();
  }

  number(val: any): number {
    return Number(val);
  }


  fieldConfigs: FieldConfig[] = [
    { key: 'patient_name', label: 'Patient*', type: 'text', required: true },
    { key: 'dob', label: 'DOB*', type: 'date', required: true },
    { key: 'age', label: 'Age*', type: 'text', required: true },
    { key: 'gender', label: 'Gender', type: 'radio', options: ['male', 'female'] },
    { key: 'mobile_no', label: 'Mobile*', type: 'text', required: true },
    { key: 'address', label: 'Address', type: 'textarea', fullWidth: true },
    { key: 'area', label: 'Area', type: 'textarea', fullWidth: true },
    { key: 'caseType', label: 'Case', type: 'select', options: ['new', 'old'] },
    { key: 'uhid', label: 'UHID Number', type: 'text', condition: () => this.opdForm.get('caseType')?.value === 'old' },
    { key: 'dor', label: 'Date', type: 'date' },
    { key: 'dot', label: 'Time', type: 'time' },
    { key: 'height', label: 'Height (cm)', type: 'text' },
    { key: 'weight', label: 'Weight (kg)', type: 'text' },
    { key: 'pincode', label: 'Pincode', type: 'text' },
    { key: 'emailAddress', label: 'Email', type: 'email' },
    { key: 'panCardNumber', label: 'PAN Card', type: 'text' },
    { key: 'aadharNumber', label: 'Aadhar Card', type: 'text' },

    { key: 'consulting_Doctor', label: 'Consulting Doctor', type: 'text' },
    { key: 'referringDoctorId', label: 'Referring Doctor', type: 'text' },

    { key: 'isMedicoLegalCase', label: 'Is Medico Legal Case?', type: 'checkbox' },
    { key: 'medicoLegalCaseNumber', label: 'MLC Case Number', type: 'text' },
    { key: 'mlcDoctor', label: 'MLC Doctor', type: 'text' },
    { key: 'policeInformerFullName', label: 'Police Informer Name', type: 'text' },
    { key: 'responsibleRelativeFullName', label: 'Responsible Relative Name', type: 'text' },
    { key: 'treatingDoctor', label: 'Treating Doctor', type: 'text' },
    { key: 'informationReportedDate', label: 'Information Reported Date', type: 'date' },
  ];

  createForm(): void {
    this.opdForm = this.fb.group({
      uhid: [''],
      caseType: ['New'],
      dor: ['2025-11-06', Validators.required],
      dot: ['14:30', Validators.required],
      patient_name: ['', Validators.required],
      gender: ['', Validators.required],
      age: ['', Validators.required],
      height: [''],
      weight: [''],
      mobile_no: [
        '',
        [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)],
      ],
      area: [''],
      pincode: ['', [Validators.pattern(/^[1-9][0-9]{5}$/)]],
      address: [''], // ✅ fixed to lowercase
      city: [''],
      uniqueHealthIdentificationId: [''],
      consulting_Doctor: [''],
      tpaCorporate: ['CASH'],
      referringDoctorId: ['SELF'],
      isMedicoLegalCase: ['false'],
      medicoLegalCaseNumber: [''],
      mlcDoctor: [''],
      policeInformerFullName: [''],
      responsibleRelativeFullName: [''],
      treatingDoctor: [''],
      informationReportedDate: [''],
      dob: [''],
      aadharNumber: [''],
      panCardNumber: [
        '',
        [
          Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
          Validators.maxLength(10),
        ],
      ],
      emailAddress: ['', [Validators.email]],
    });
  }

  formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5); // 'HH:mm'
  }

  formatDate(date: Date): string {
    return date.toISOString().slice(0, 10); // 'yyyy-MM-dd'
  }

  // Allow numbers and commas only
  allowOnlyNumbersAndComma(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const pattern = /[0-9]/; // allow only numbers for typing
    const inputChar = String.fromCharCode(event.charCode);

    // Block anything that's not a number
    if (!pattern.test(inputChar)) {
      event.preventDefault();
      return;
    }

    // Wait for input to appear, then auto-insert comma if needed
    setTimeout(() => {
      // Remove extra spaces
      input.value = input.value.replace(/\s+/g, '');

      // Auto add comma if last char isn't already a comma and not empty
      if (input.value && !input.value.endsWith(',')) {
        // If length is 10 digits (like a mobile number), add a comma
        const parts = input.value.split(',');
        const last = parts[parts.length - 1];
        if (last.length === 10) {
          input.value += ',';
        }
      }
    });
  }


  // Optional: validate the comma-separated numbers
  validateMobileNumbers() {
    const mobileStr = this.opdForm.get('mobile_no')?.value;
    if (!mobileStr) return true;

    const numbers = mobileStr.split(',').map((n: string) => n.trim());
    for (let num of numbers) {
      if (!/^[6-9][0-9]{9}$/.test(num)) {
        return false; // invalid number found
      }
    }
    return true;
  }

  aadharValidator(control: AbstractControl) {
    const val = control.value;
    // console.log('Aadhar Validator value:', val, typeof val);

    if (typeof val !== 'string') {
      return null;
    }

    // Remove all non-digit characters from the input
    const cleaned = val.replace(/\D/g, '');

    // Check if cleaned length is 12 and starts with digits 2-9
    const valid = /^[2-9][0-9]{11}$/.test(cleaned);

    return valid ? null : { invalidAadhar: true };
  }

  onAadharInput(event: any) {
    let val = event.target.value;
    // Remove all non-digit characters
    val = val.replace(/\D/g, '');

    // Limit to 12 digits max
    val = val.substring(0, 12);

    // Format as xxxx-xxxx-xxxx while typing
    let formatted = '';
    for (let i = 0; i < val.length; i++) {
      if (i === 4 || i === 8) {
        formatted += '-';
      }
      formatted += val[i];
    }

    // Update the input field value
    this.opdForm.controls['aadharNumber'].setValue(formatted, {
      emitEvent: false,
    });
  }

  dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  // doctor search
  doctorSearchControl = new FormControl('');
  filteredDoctors: any[] = [];
  showDoctorSuggestions = false;

  TreatdoctorSearchControl = new FormControl('');
  showTreatDoctorSuggestions = false;
  filteredTreatDoctors: any[] = [];

  refDoctorSearchControl = new FormControl('');
  filteredRefDoctors: any[] = [];
  showRefDoctorSuggestions = false;

  userPermissions: any = {};

  ngOnInit(): void {
    // Permissions
    const ctrls: { [key: string]: any } = {};
    this.fieldConfigs.forEach(f => {
      ctrls[f.key] = f.required ? [null, Validators.required] : [null];
    });

    // ✅ Add static date and time fields
    ctrls['dor'] = [new Date().toISOString().split('T')[0], Validators.required]; // today's date
    ctrls['dot'] = [new Date().toTimeString().slice(0, 5), Validators.required];  // current time (HH:mm)

    this.opdForm = this.fb.group(ctrls);

    // setInterval(() => {
    //   const now = new Date();
    //   const currentTime = now.toTimeString().slice(0, 5);
    //   this.opdForm.get('dot')?.setValue(currentTime, { emitEvent: false });
    // }, 15000);

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'outpatientCase'
    );
    const medicoModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'medicoLegalCase'
    );
    this.userPermissions =
      (uhidModule?.permissions && medicoModule.permissions) || {};

    this.opdForm.get('isMedicoLegalCase')?.valueChanges.subscribe((val) => {
      this.isMLC = val === true ? 'yes' : 'no';
    });

    this.doctorSearchControl.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        switchMap((name: string | null) => {
          if (name && name.trim().length >= 1) {
            // ✅ FIXED: Pass the search term to getusers service
            return this.role.getusers(1, 100, name.trim());
          }
          return of([]);
        })
      )
      .subscribe((users: any) => {
        if (Array.isArray(users)) {
          this.filteredDoctors = users.filter(
            (u: any) => u.role?.name === 'doctor'
          );
        } else if (users && users.data) {
          this.filteredDoctors = users.data.filter(
            (u: any) => u.role?.name === 'doctor'
          );
        } else {
          this.filteredDoctors = [];
        }
      });


    this.TreatdoctorSearchControl.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        switchMap((name: string | null) => {
          if (name && name.trim().length >= 1) {
            return this.role.getusers();
          }
          return of([]);
        })
      )
      .subscribe((users: any) => {
        if (Array.isArray(users)) {
          this.filteredTreatDoctors = users.filter(
            (u: any) => u.role?.name === 'doctor'
          );
        } else if (users && users.data) {
          this.filteredTreatDoctors = users.data.filter(
            (u: any) => u.role?.name === 'doctor'
          );
        } else {
          this.filteredTreatDoctors = [];
        }
      });

    this.refDoctorSearchControl.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        switchMap((name: string | null) => {
          if (name && name.trim().length >= 1) {
            // 🔹 Fetch doctors from Doctor Master API
            return this.masterService.getDoctorMasterList(name.trim());
          }
          return of([]);
        })
      )
      .subscribe((res: any) => {
        let list = [];

        if (Array.isArray(res)) {
          list = res;
        } else if (res && res.data) {
          list = res.data;
        }

        // 🔹 Limit to 10 items
        this.filteredRefDoctors = list.slice(0, 10);
      });



    // Load other data
    this.loadTodaysUHID();
    this.loadOpddeposit();

    // --- 🔥 Optimized patient_name filter ---
    this.opdForm
      .get('patient_name')!
      .valueChanges.pipe(
        debounceTime(100),
        distinctUntilChanged(),
        switchMap((name: string) => {
          if (!name || name.length <= 2) {
            this.manuallySelected = false; // ✅ reset on clear
            this.filteredPatients = [];
            this.showSuggestions = false;
            return of({ uhids: [] });
          }

          if (this.manuallySelected) return of({ uhids: [] });

          const filters: { [key: string]: string } = { patient_name: name };
          // Add optional filters...
          return this.uhidService.getPatientByFilters(filters);
        })
      )
      .subscribe((res: any) => {
        this.filteredPatients = res?.uhids || [];
        this.showSuggestions = this.filteredPatients.length > 0;
      });

    // --- 🔥 Optimized uhid number  filter ---

    this.opdForm
      .get('uhid')!
      .valueChanges.pipe(
        debounceTime(100),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (!value || value.length <= 2) {
            this.manuallySelected = false; // ✅ reset
            this.filteredPatients = [];
            this.showSuggestions = false;
            return of({ uhids: [] });
          }

          if (this.manuallySelected) return of({ uhids: [] });

          const filters: { [key: string]: string } = { uhid: value };
          // Add optional filters...
          return this.uhidService.getPatientByFilters(filters);
        })
      )
      .subscribe((res: any) => {
        this.filteredPatients = res?.uhids || [];
        this.showSuggestions = this.filteredPatients.length > 0;
      });

    // Edit mode
    this.fetchDoctors();

    this.route.queryParams.subscribe((params) => {
      this.opdcaseId = params['_id'];
      const appointmentId = params['appointmentId'];
      const uhid = params['uhid'];
      this.appointmentId = appointmentId || '';
      // this.patientId = this.opdcaseId;
      // console.log("id", this.opdcaseId);
      console.log('appointmentId', appointmentId);
      this.editMode = !!this.opdcaseId;
      console.log('billing', this.opdhistory);

      if (this.editMode && this.opdcaseId) {
        this.manuallySelected = true;
        this.loadOpdCase(this.opdcaseId);
      }

      if (appointmentId) {
        this.createAppointmentCase(appointmentId);
      }

      if (!this.editMode && uhid) {
        this.patientFromUhid(uhid);
      }
    });

    //  age calculated
    this.opdForm.get('dob')?.valueChanges.subscribe((dobValue) => {
      if (dobValue) {
        const { years, months, days } = this.calculateAge(new Date(dobValue));
        this.opdForm.get('age')?.setValue(`${years}Y ${months}M ${days}D`);
      }
    });

    // dob calculation
    // NEW: Age to DOB calculation
    // Age to DOB calculation
    let dobUpdating = false;
    let ageUpdating = false;
    this.opdForm.get('age')?.valueChanges.subscribe((ageValue) => {
      if (ageValue && !dobUpdating) { // Removed the DOB value check
        ageUpdating = true;
        const calculatedDOB = this.calculateDOBFromAge(ageValue);
        if (calculatedDOB) {
          this.opdForm.get('dob')?.setValue(calculatedDOB, { emitEvent: false });
        }
        ageUpdating = false;
      }
    });

  }

  calculateDOBFromAge(ageString: string): string | null {
    const age = parseInt(ageString);
    if (isNaN(age) || age <= 0 || age > 150) return null;

    const today = new Date();
    const birthYear = today.getFullYear() - age;

    // Use current month and day for approximate DOB
    const dob = new Date(birthYear, today.getMonth(), today.getDate());

    // Format as YYYY-MM-DD for HTML date input
    const year = dob.getFullYear();
    const month = String(dob.getMonth() + 1).padStart(2, '0');
    const day = String(dob.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }


  selectDoctor(doctor: any) {
    this.opdForm.patchValue({ consulting_Doctor: doctor._id });
    this.doctorSearchControl.setValue(doctor.name, { emitEvent: false });
    this.showDoctorSuggestions = false;
  }


  selectTreatDoctor(doctor: any) {
    this.opdForm.patchValue({ treatingDoctor: doctor._id });
    this.TreatdoctorSearchControl.setValue(doctor.name, { emitEvent: false });
    this.showTreatDoctorSuggestions = false;
  }

  selectRefDoctor(doctor: any) {
    this.opdForm.patchValue({ referringDoctorId: doctor._id });
    this.refDoctorSearchControl.setValue(doctor.name, { emitEvent: false });
    this.showRefDoctorSuggestions = false;
  }

  hideSuggestionsLater() {
    setTimeout(() => {
      this.showDoctorSuggestions = false;
      this.showTreatDoctorSuggestions = false;
      this.showRefDoctorSuggestions = false;
    }, 200); // delay so click can register before hiding
  }

  calculateAge(dob: Date): { years: number; months: number; days: number } {
    const today = new Date();

    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    // Adjust days and months if negative
    if (days < 0) {
      months--;
      // Get days in the previous month
      const prevMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      ).getDate();
      days += prevMonth;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  }
  // uhid fo toadys
  showUHIDDropdown: boolean = false;

  loadTodaysUHID(): void {
    const today = new Date().toISOString().split('T')[0];

    this.uhidService.getUhid(1, 100, `dor=${today}`).subscribe(
      (res) => {
        this.uhidTodayRecords = res.uhids;

        console.log("Today's UHID Records:", this.uhidTodayRecords);
      },
      (err) => {
        console.error("Error loading today's UHID:", err);
      }
    );
  }

  selectPatientFromUHID(record: any): void {
    console.log('Selected from UHID dropdown:', record);

    // Reuse your existing patient select logic
    this.selectPatient(record);

    // Close dropdown
    this.showUHIDDropdown = false;
  }

  fetchDoctors() {
    this.role.getusers().subscribe({
      next: (res) => {
        // console.log("🚀 ~ AddopdComponent ~ this.masterService.getDoctors ~ res:", res)
        this.doctors = res.filter((u: any) => u.role?.name === 'doctor');
        console.log(
          '🚀 ~ AddopdComponent ~ this.masterService.getDoctors ~ this.doctors:',
          this.doctors
        );
      },
      error: (err) => {
        console.log(
          '🚀 ~ AddopdComponent ~ this.masterService.getDoctors ~ err:',
          err
        );
      },
    });
  }

  // opdcase : any [] = [];
  loadOpdCase(opdcaseid: string): void {
    this.opdservice.getOPDcaseById(opdcaseid).subscribe(
      (opdcase: any) => {
        console.log('OPD DATA', opdcase);
        this.patientId = opdcase.uniqueHealthIdentificationId?._id;
        if (!opdcase)
          return console.warn('No OPD case found for ID:', opdcaseid);

        const uhidId =
          opdcase.uniqueHealthIdentificationId?._id ||
          opdcase.uniqueHealthIdentificationId;
        // console.log(uhidId, "uhid");
        const doctorId = opdcase.consulting_Doctor?._id;
        const refDoctorId = opdcase.referringDoctorId?._id;

        this.opdservice.getMedicalCaseById(uhidId).subscribe((res: any) => {
          this.medicoData = res;
          console.log('medicodata', this.medicoData);

          this.medicoId = res._id;
          this.treatDoctor = res.treatingDoctor?.name;
          this.treatDoctorId = res.treatingDoctor?._id;
        });

        const doctorRequests = [this.role.getuserById(doctorId)];
        console.log('refid', refDoctorId);

        if (refDoctorId) {
          doctorRequests.push(this.role.getuserById(refDoctorId));
        }

        // Step 1: Get UHID
        this.uhidService.getUhidById(uhidId).subscribe(
          (uhid: any) => {
            // Step 2: Get Doctor
            forkJoin(doctorRequests).subscribe(
              (responses) => {
                const consultingDoctorResponse = responses[0];
                const consultingDoctor =
                  consultingDoctorResponse?.data || consultingDoctorResponse;

                // Handle optional referring doctor
                const referringDoctorResponse = responses[1];
                const referringDoctor =
                  referringDoctorResponse?.data ||
                  referringDoctorResponse ||
                  null;
                // Now you can safely use both doctor objects without worrying about missing referring doctor
                console.log('Consulting Doctor:', consultingDoctor);
                console.log('Referring Doctor:', referringDoctor);

                // Patch basic form values
                this.opdForm.patchValue({
                  patient_name: uhid.patient_name || '',
                  dob: this.formatDateToInput(uhid.dob),
                  dor: this.formatDateToInput(uhid.dor),
                  dot: uhid.dot?.slice(0, 5) || '',
                  gender: uhid.gender || '',
                  mobile_no: uhid.mobile_no || '',
                  age: uhid.age || '',
                  height: opdcase.height || '',
                  weight: opdcase.weight || '',
                  emailAddress: opdcase.emailAddress || '',
                  aadharNumber: opdcase.aadharNumber || '',
                  panCardNumber: opdcase.panCardNumber || '',
                  pincode: uhid.pincode || '',
                  area: uhid.area || '',
                  address: opdcase.address || '',
                  city: opdcase.city || '',
                  uhid: uhid.uhid || '',
                  caseType: opdcase.caseType || '',
                  consulting_Doctor: consultingDoctor?._id || '',
                  referringDoctorId: referringDoctor?._id || '',
                  uniqueHealthIdentificationId: uhid,
                  isMedicoLegalCase: opdcase.isMedicoLegalCase,
                });

                //==> patching doctors name
                this.doctorSearchControl.setValue(consultingDoctor?.name || '');
                this.refDoctorSearchControl.setValue(
                  referringDoctor?.name || ''
                );

                // Handle medico-legal case if applicable
                if (opdcase.isMedicoLegalCase && this.medicoData?.[0]) {
                  this.opdForm.patchValue({
                    policeInformerFullName:
                      this.medicoData[0].policeInformerFullName,
                    responsibleRelativeFullName:
                      this.medicoData[0].responsibleRelativeFullName,
                    informationReportedDate: this.formatDateToInput(
                      this.medicoData[0].informationReportedDate
                    ),
                  });
                  this.TreatdoctorSearchControl.setValue(this.treatDoctor);
                }
              },
              (error) => {
                console.error('Error fetching doctor details:', error);
              }
            );
          },
          (uhidError) =>
            console.error('Error fetching UHID details:', uhidError)
        );
      },
      (error) => console.error('Error loading OPD case by ID:', error)
    );
  }

  uhid: string = '';
  createAppointmentCase(id: string) {
    this.opdservice.getOpdAppointmentbyid(id).subscribe({
      next: (res: any) => {
        const appointmentDetails = res.data;
        console.log('Appointment Details:', appointmentDetails);

        const consultingDoctor = appointmentDetails.Consulting_Doctor;

        const uhid = appointmentDetails.uhid?._id;
        this.uhid = uhid || '';

        if (appointmentDetails.uhid) {
          this.opdForm.patchValue({
            caseType: 'old',
            uniqueHealthIdentificationId: uhid || '',
          });
        }

        this.opdForm.patchValue({
          patient_name: appointmentDetails.patient_name || '',
          dob: this.formatDateToInput(appointmentDetails.uhid?.dob),
          dor: this.formatDateToInput(appointmentDetails.uhid?.dor),
          dot: appointmentDetails.uhid?.dot?.slice(0, 5) || '',
          gender: appointmentDetails.uhid?.gender || '',
          mobile_no: appointmentDetails.uhid?.mobile_no || '',
          age: appointmentDetails.uhid?.age || '',
          emailAddress: appointmentDetails.emailAddress || '',
          aadharNumber: appointmentDetails.aadharNumber || '',
          panCardNumber: appointmentDetails.panCardNumber || '',
          pincode: appointmentDetails.uhid?.pincode || '',
          area: appointmentDetails.uhid?.area || '',
          address: appointmentDetails.uhid?.address || '',
          city: appointmentDetails.uhid?.city || '',
          uhid: appointmentDetails.uhid?.uhid || '',
          consulting_Doctor: consultingDoctor._id || '',
        });

        this.manuallySelected = true;

        this.doctorSearchControl.setValue(consultingDoctor?.name || '');
      },
    });
  }

  formatDateToInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // handle invalid date
    return date.toISOString().split('T')[0]; // returns YYYY-MM-DD
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  patientFromUhid(uhid: any): void {
    console.log(uhid);
    this.uhid = uhid;
    this.uhidService.getUhidById(uhid).subscribe((res: any) => {
      console.log('uhid res', res);

      this.opdForm.patchValue({
        patient_name: res.patient_name || '',
        caseType: 'old',
        mobile_no: res.mobile_no || '',
        gender: res.gender || '',
        age: res.age || '',
        area: res.area || '',
        city: res.city || '',
        pincode: res.pincode || '',
        dob: this.formatDateToInput(res.dob),
        uhid: res.uhid || '',
        uniqueHealthIdentificationId: this.uhid,
      });

      this.manuallySelected = true;
    });
  }

  selectPatient(patient: any): void {
    this.patientId = patient._id;

    this.manuallySelected = true;

    // Clear previous data
    this.vistingdate = [];
    this.billtotalamlount = [];
    this.billtotalreceived = [];
    this.billtotalMap = {};
    this.billreceivedMap = {};
    this.billDepositMap = {};
    // Set basic patient details first
    this.opdForm.patchValue({
      patient_name: patient.patient_name || '',
      mobile_no: patient.mobile_no || '',
      gender: patient.gender || '',
      age: patient.age || '',
      height: patient.height || '',
      weight: patient.weight || '',
      area: patient.area || '',
      city: patient.city || '',
      pincode: patient.pincode || '',
      dob: this.formatDateToInput(patient.dob),
      uhid: patient.uhid || '',
      uniqueHealthIdentificationId: patient._id || '',
    });

    const nameControl = this.opdForm.get('patient_name');
    if (nameControl) {
      nameControl.markAsTouched();
      nameControl.markAsDirty();
      nameControl.updateValueAndValidity();
    }

    this.opdservice.getOPDhistoryById(patient._id).subscribe({
      next: (opdhistory) => {
        this.opdhistory = opdhistory.history;
        console.log('billing', this.opdhistory);

        const latestCase = this.opdhistory.find(
          (h) => h.outpatientcases && h.outpatientcases.length > 0
        )?.outpatientcases[0];

        this.pancard = latestCase?.panCardNumber || '';
        this.adharcard = latestCase?.aadharNumber || '';
        this.emailAddress = latestCase?.emailAddress || '';

        this.opdForm.patchValue({
          panCardNumber: this.pancard,
          aadharNumber: this.adharcard,
          emailAddress: this.emailAddress,
        });

        ['aadharNumber', 'emailAddress'].forEach((field) => {
          const ctrl = this.opdForm.get(field);
          if (ctrl) {
            ctrl.markAsTouched();
            ctrl.markAsDirty();
            ctrl.updateValueAndValidity();
          }
        });

        this.opdhistory.forEach((history) => {
          history.outpatientcases?.forEach((outcase: any) => {
            this.vistingdate.push(outcase.createdAt);
          });

          history.OutpatientBills?.forEach((outbill: any) => {
            this.billtotalamlount.push(outbill);
            this.billtotalreceived.push(outbill.amountreceived);

            const billId = outbill._id;
            if (!this.billtotalMap[billId]) this.billtotalMap[billId] = [];
            this.billtotalMap[billId].push(outbill.totalamount);

            if (!this.billreceivedMap[billId])
              this.billreceivedMap[billId] = [];
            this.billreceivedMap[billId].push(outbill.amountreceived);
          });

          history.OutpatientDeposits?.forEach((outdeposit: any) => {
            const billId = outdeposit.outpatientBillId;
            if (!this.billDepositMap[billId]) this.billDepositMap[billId] = [];
            this.billDepositMap[billId].push(outdeposit.depositAmount);
          });
        });
      },
      error: (err) => {
        console.error('Error fetching OPD history:', err);
      },
    });

    this.filteredPatients = [];
    this.showSuggestions = false;
  }

  onPatientInput() {
    const nameValue = this.opdForm.get('patient_name')?.value || '';

    // If user starts typing, unset manual flag
    if (this.manuallySelected && nameValue.length <= 2) {
      this.manuallySelected = false;
    }

    if (nameValue.length <= 2) {
      this.filteredPatients = [];
      this.showSuggestions = false;
      return;
    }

    this.showSuggestions = true;
  }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200); // short delay to allow click
  }

  getDepositSum(billId: string): number {
    let totalDeposit = 0;

    if (this.opdhistory && this.opdhistory.length > 0) {
      this.opdhistory.forEach((history) => {
        if (
          history.OutpatientDeposits &&
          history.OutpatientDeposits.length > 0
        ) {
          history.OutpatientDeposits.forEach((deposit: any) => {
            if (deposit.outpatientBillId === billId) {
              totalDeposit += Number(deposit.depositAmount);
            }
          });
        }
      });
    }

    return totalDeposit;
  }

  // depsoit satrts here
  opddeposit: any[] = [];
  loadOpddeposit() {
    this.opdservice.getopdopddepositapis().subscribe((res) => {
      // console.log("🚀 ~ AddopdComponent ~ this.opdservice.getopdopddepositapis ~ res:", res)
    });
  }

  hasBillDue(): boolean {
    return this.billtotalamlount.some((bill) => {
      const billId = bill._id;
      const total = Number(bill.totalamount);
      const discount = Number(bill.discountMeta.discount);
      // alert(bill.totalamount)
      // alert(Number(bill.discountMeta.discount))
      const received = Number(bill.amountreceived);
      const deposits = this.getDepositSum(billId);
      // console.log("");
      // Calculate balance considering deposits correctly (subtract deposits)
      const balanceDue = total - (received + deposits + discount);
      return balanceDue !== 0;
    });
  }

  getBillDueAmount(bill: any): number {
    return (
      // alert(bill.discountMeta.discount);
      Number(bill.totalamount) -
      (Number(bill.amountreceived) + this.getDepositSum(bill._id)) -
      Number(bill.discountMeta.discount)
    );
  }

  resetForm(): void {
    const now = new Date();

    this.opdForm.reset({
      uhid: '',
      caseType: 'New',
      dot: this.formatTime(now),
      dor: this.formatDate(now),
      patient_name: '',
      gender: '',
      age: '',
      height: '',
      weight: '',
      mobile_no: '',
      area: '',
      pincode: '',
      address: '',
      city: '',
      uniqueHealthIdentificationId: '',
      consulting_Doctor: [''],
      tpaCorporate: 'CASH',
      referringDoctorId: [''],
      isMedicoLegalCase: 'false',
      medicoLegalCaseNumber: '',
      mlcDoctor: '',
      policeInformerFullName: '',
      responsibleRelativeFullName: '',
      treatingDoctor: '',
      informationReportedDate: '',
      dob: '',
      aadharNumber: '',
      panCardNumber: '',
      emailAddress: '',
    });
    this.doctorSearchControl.setValue('');
    this.refDoctorSearchControl.setValue('');
    this.TreatdoctorSearchControl.setValue('');
  }

  async onSubmit(): Promise<void> {
    if (this.opdForm.invalid) {
      this.opdForm.markAllAsTouched();

      // Dynamically import SweetAlert2
      const Swal = (await import('sweetalert2')).default;

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

    try {
      const formData = this.opdForm.value;

      let uhid = formData.uhid;

      console.log('formdata uhid', uhid);
      let uhidId = this.patientId || '';

      const isExistingPatient = !!this.patientId;

      if (!isExistingPatient && !uhid) {
        // Step 1: Generate and create UHID
        // const generatedUhid = this.generateUHID();
        const uhidPayload = {
          patient_name: formData.patient_name,
          mobile_no: formData.mobile_no,
          gender: formData.gender,
          age: formData.age,
          dob: formData.dob,
          area: formData.area,
          city: formData.city,
          pincode: formData.pincode,
          address: formData.address, // ✅ fixed
          dor: formData.dor,
          dot: formData.dot,
          uhid: formData.uhid,
        };
        console.log("uhidPayload", uhidPayload);
        const uhidResponse: any = await firstValueFrom(
          this.uhidService.postuhid(uhidPayload)
        );
        uhidId = uhidResponse?.data?._id || uhidResponse?._id;
        // uhid = uhidResponse?.data?.uhid || uhidResponse?.uhid;
        // uhidId = uhidResponse?._id;

        console.log('UHID', uhid);
        console.log('uhid id', uhidId);
      }

      const isSharing = !!(
        formData.referringDoctorId &&
        formData.referringDoctorId !== 'SELF' &&
        formData.referringDoctorId.trim() !== ''
      );

      const referringDoctor =
        formData.referringDoctorId?._id ||
        (typeof formData.referringDoctorId === 'string' &&
          /^[0-9a-fA-F]{24}$/.test(formData.referringDoctorId)
          ? formData.referringDoctorId
          : null); // Only assign if it's a valid ObjectId string

      // Step 2: Prepare OPD payload using returned UHID values
      const opdPayload = {
        uniqueHealthIdentificationId: uhidId || this.uhid,
        isInpatient: false,
        consulting_Doctor:
          formData.consulting_Doctor?._id || formData.consulting_Doctor,
        referringDoctorId: referringDoctor,
        aadharNumber: Number(
          String(formData.aadharNumber || '').replace(/\D/g, '')
        ),
        panCardNumber: formData.panCardNumber,
        emailAddress: formData.emailAddress,
        caseType: formData.caseType?.toLowerCase(),
        tpaCorporate: formData.tpaCorporate,
        mobile_no: formData.mobile_no,
        patient_name: formData.patient_name,
        dob: formData.dob,
        age: formData.age,
        height: formData.height,
        weight: formData.weight,
        gender: formData.gender,
        address: formData.address, // ✅ fixed
        area: formData.area,
        city: formData.city,
        pincode: formData.pincode,
        dot: formData.dot,
        dor: formData.dor,
        uhid: formData.uhid,
        isMedicoLegalCase: formData.isMedicoLegalCase,
        isSharing: isSharing,
        consulted: 'waiting',
      };

      const medicoCasepayload = {
        uniqueHealthIdentificationId: uhidId,
        mlcDoctor: formData.mlcDoctor,
        policeInformerFullName: formData.policeInformerFullName,
        responsibleRelativeFullName: formData.responsibleRelativeFullName,
        treatingDoctor:
          formData.treatingDoctor?._id ||
          formData.treatingDoctor ||
          this.treatDoctorId,
        informationReportedDate: formData.informationReportedDate,
        caseType: 'outpatient',
      };

      // Step 3: Create OPD case

      // const opdid = this.route.snapshot.queryParams['_id'];

      if (this.opdcaseId) {
        await firstValueFrom(
          this.opdservice.updateOPDcase(this.opdcaseId, opdPayload)
        );

        if (formData.isMedicoLegalCase) {
          await firstValueFrom(
            this.opdservice.updateopdedicoLegalCaseapis(
              this.medicoId,
              medicoCasepayload
            )
          );
        }

        const Swal = (await import('sweetalert2')).default;
        Swal.fire({
          icon: 'success',
          title: 'OPD Case Updated',
          text: 'OPD Admission has been updated successfully.',
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

        this.opdForm.reset();
        this.router.navigateByUrl('/opd/opdcases');
      } else {
        const response = await firstValueFrom(
          this.opdservice.postOPDcase(opdPayload)
        );
        const opdcaseid = response._id;

        if (formData.isMedicoLegalCase) {
          await firstValueFrom(
            this.opdservice.postopdedicoLegalCaseapis(medicoCasepayload)
          );
        }

        if (this.appointmentId) {
          await firstValueFrom(
            this.opdservice.updateopdappointmentapis(this.appointmentId, {
              outpatientcaseId: opdcaseid,
            })
          );
        }

        const Swal = (await import('sweetalert2')).default;

        Swal.fire({
          icon: 'success',
          title: 'OPD Case Created',
          text: 'UHID and OPD case successfully created.',
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

        if (response && !this.appointmentId) {
          const patientData = {
            doctorId: response.consulting_Doctor,
            caseId: response._id,
            source: 'OPD',
            isOPDToQueue: true,
          };
          this.opdservice.addPatientToQueue(patientData).subscribe({
            next: () => {
              // Optionally update UI or show success toast
            },
            error: (err) => {
              console.error('Error adding patient to queue:', err);
              Swal.fire({
                icon: 'error',
                title: 'Add Failed',
                text: 'Please create case first then do check-in or Re-assign doctor',
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

        this.opdForm.reset();
        if (this.appointmentId) {
          this.router.navigateByUrl('opd/opdappointmentquelist');
        } else {
          this.router.navigateByUrl('/opd/opdcases');
        }
      }
    } catch (error: any) {
      console.error('Error during submission:', error);
      const Swal = (await import('sweetalert2')).default;
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text:
          error?.error?.message ||
          'An error occurred during UHID or OPD case creation.',
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
    }
  }

  // generateUHID(): string {
  //   const date = new Date();
  //   return `UHID-${date.getFullYear()}${
  //     date.getMonth() + 1
  //   }${date.getDate()}-${Math.floor(Math.random() * 1000000)}`;
  // }

  // depsoit

  selectedBill: any = null;
  selectedBillDeposits: any[] = [];

  selectBill(bill: any) {
    this.selectedBill = bill;

    // Find deposits for this bill
    const billId = bill._id;

    // Filter deposits from all deposits stored in billDepositMap or opdhistory
    // You already have billDepositMap built, but let's get full deposits to show date etc.

    // For simplicity, get deposits from opdhistory's OutpatientDeposits for this billId
    this.selectedBillDeposits = [];

    if (this.opdhistory && this.opdhistory.length > 0) {
      this.opdhistory.forEach((history) => {
        if (
          history.OutpatientDeposits &&
          history.OutpatientDeposits.length > 0
        ) {
          history.OutpatientDeposits.forEach((deposit: any) => {
            if (deposit.outpatientBillId === billId) {
              this.selectedBillDeposits.push(deposit);
            }
          });
        }
      });
    }
  }
}
