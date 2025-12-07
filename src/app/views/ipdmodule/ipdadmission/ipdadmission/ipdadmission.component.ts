import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';
import { CustomtimepickerComponent } from '../../../../component/customtimepicker/customtimepicker.component';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { debounceTime, switchMap } from 'rxjs';
import { of } from 'rxjs';
import { UhidService } from '../../../uhid/service/uhid.service';
import { IpdService } from '../../ipdservice/ipd.service';
import { BedwardroomService } from '../../../mastermodule/bedmanagement/bedservice/bedwardroom.service';
import { combineLatest, firstValueFrom } from 'rxjs';
import { distinctUntilChanged, startWith } from 'rxjs/operators';
import { IntegerDateComponent } from '../../../../component/integer-date/integer-date.component';
import { OpdService } from '../../../opdmodule/opdservice/opd.service';
import { RoleService } from '../../../mastermodule/usermaster/service/role.service';
import { CompanyMasterService } from '../../../mastermodule/companymaster/service/companymaster.service';

@Component({
  selector: 'app-ipdadmission',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ipdadmission.component.html',
  styleUrls: ['./ipdadmission.component.css'],
})
export class IpdadmissionComponent {
  wards: any[] = [];
  isMLC: string = 'no';
  doctors: any = [];
  companies: any[] = []; // Companies array
  ipdadmission: FormGroup;
  filteredPatients: any[] = [];
  showSuggestions = false;
  manuallySelected = false;
  editMode = false;
  isSubmitting = false;
  selectedRoomNumber: string = '';
  selectedRooms: any[] = [];
  selectedBeds: any[] = [];
  selectedBed: any = null;
  patientId: string = '';
  ipdCaseById: any[] = [];
  doctor: string = '';
  treatDoctor: string = '';

  medicoData: any[] = [];
  medicoId: string = '';
  treatDoctorId: string = '';
  isBedCategory: boolean = false;

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private uhidService: UhidService,
    private ipdservice: IpdService,
    private router: Router,
    private route: ActivatedRoute,
    private bedwardroomservice: BedwardroomService,
    private opdservice: OpdService,
    private role: RoleService,
    private companyService: CompanyMasterService
  ) {
    const now = new Date();
    this.ipdadmission = this.fb.group({
      uhid: [''],
      admissionTime: [this.formatTime(now), Validators.required],
      admissionDate: [this.formatDate(now)],
      patient_name: ['', Validators.required],
      age: [''],
      mobile_no: [
        '',
        [Validators.pattern(/^[6-9]\d{9}$/), Validators.required],
      ],
      gender: [''],
      area: [''],
      pincode: ['', [Validators.pattern(/^[1-9][0-9]{5}$/)]],
      tpaCompany: [''],
      policyNumber: [''],
      insuranceType: [''],
      admittingDoctorId: ['', Validators.required],
      consSpeciality: [''],
      referringDoctorId: [''],
      refSpeciality: [''],
      wardMasterId: [''],
      isMedicoLegalCase: ['false'],
      isSharing: ['false'],
      policeInformerFullName: [''],
      responsibleRelativeFullName: [''],
      treatingDoctor: [''],
      informationReportedDate: [''],
      informTime: [''],
      uniqueHealthIdentificationId: [''],
      room_id: [''],
      bed_id: [''],
      caseType: ['new'],
      dot: [this.formatTime(now)],
      dor: [this.formatDate(now)],
      dob: ['', Validators.required],
      patient_type: [''],
      companyName: [''],
      companyId: [''], // Company ID form control
      police_station_location: [''],
      bucket_number: [''],
      alternate_mobile: [''],
      isBedCategorySelected: [false],
      categoryChargeAs: [''],
      categoryChargeAsRoomId: [null],
      categoryChargeAsBedId: [null],
      // vitals
      systolicBloodPressure: [''],
      diastolicBloodPressure: [''],
      bloodGroup: [''],
      temperature: [''],
      height: [''],
      weight: [''],
      pulseRate: [''],
      spo2: [''],
      bloodSugar: [''],
      respiratoryRate: [''],
    });
  }

  // uhids
  activeFilter: 'today' | 'dateRange' = 'today';
  dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  // doctor search
  doctorSearchControl = new FormControl('');
  showDoctorSuggestions = false;
  filteredDoctors: any[] = [];
  selectedDoctorIndex = -1;

  TreatdoctorSearchControl = new FormControl('');
  filteredTreatDoctors: any[] = [];
  showTreatDoctorSuggestions = false;

  refDoctorSearchControl = new FormControl('');
  filteredRefDoctors: any[] = [];
  showRefDoctorSuggestions = false;

  userPermissions: any = {};
  rooms: any;
  roomTypes: any[] = [];
  selectedRoomTypeId: string | null = null;
  selectedBedTypeId: string | null = null;

  ngOnInit(): void {
    // ✅ Load companies when component initializes
    this.loadCompanies();

    // ✅ Enhanced patient type validation - Watch for patient type changes
    this.ipdadmission
      .get('patient_type')
      ?.valueChanges.subscribe((patientType) => {
        if (patientType === 'cashless' || patientType === 'corporate') {
          // Make company required for cashless/corporate patients
          this.ipdadmission
            .get('companyId')
            ?.setValidators([Validators.required]);
          console.log(
            '🏢 Company field is now required for',
            patientType,
            'patient'
          );
        } else {
          // Clear company requirements for other patient types
          this.ipdadmission.get('companyId')?.clearValidators();
          this.ipdadmission.get('companyId')?.setValue('');
          this.ipdadmission.get('companyName')?.setValue('');
          console.log('📊 Company field cleared for', patientType, 'patient');
        }
        this.ipdadmission.get('companyId')?.updateValueAndValidity();
      });

    // ✅ Watch for company selection changes
    this.ipdadmission.get('companyId')?.valueChanges.subscribe((companyId) => {
      if (companyId) {
        const selectedCompany = this.companies.find((c) => c._id === companyId);
        if (selectedCompany) {
          this.ipdadmission
            .get('companyName')
            ?.setValue(selectedCompany.companyName);
          console.log('🏢 Company selected:', selectedCompany.companyName);
        }
      } else {
        this.ipdadmission.get('companyName')?.setValue('');
      }
    });

    // Existing DOB/Age logic
    this.ipdadmission.get('dob')?.valueChanges.subscribe((dobValue) => {
      if (dobValue) {
        const { years, months, days } = this.calculateAge(new Date(dobValue));
        this.ipdadmission.get('age')?.setValue(`${years}Y ${months}M ${days}D`);
      }
    });

    // age to dob
    let dobUpdating = false;
    let ageUpdating = false;
    this.ipdadmission.get('age')?.valueChanges.subscribe((ageValue) => {
      if (ageValue && !dobUpdating) {
        ageUpdating = true;
        const calculatedDOB = this.calculateDOBFromAge(ageValue);
        if (calculatedDOB) {
          this.ipdadmission
            .get('dob')
            ?.setValue(calculatedDOB, { emitEvent: false });
        }
        ageUpdating = false;
      }
    });

    // load permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'inpatientCase'
    );
    this.userPermissions = uhidModule?.permissions || {};

    this.ipdadmission
      .get('isMedicoLegalCase')
      ?.valueChanges.subscribe((val) => {
        this.isMLC = val === true ? 'yes' : 'no';
      });

    this.ipdadmission
      .get('isBedCategorySelected')
      ?.valueChanges.subscribe((val) => {
        this.isBedCategory = val === true ? true : false;
      });

    // doctor search
    this.doctorSearchControl.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        switchMap((name: string | null) => {
          if (name && name.trim().length >= 1) {
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
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((name: string | null) => {
          if (name && name.trim().length >= 1) {
            return this.role.getusers(1, 100, name.trim());
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
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((name: string | null) => {
          if (name && name.trim().length >= 1) {
            return this.role.getusers(1, 100, name.trim());
          }
          return of([]);
        })
      )
      .subscribe((users: any) => {
        if (Array.isArray(users)) {
          this.filteredRefDoctors = users.filter(
            (u: any) => u.role?.name === 'doctor'
          );
        } else if (users && users.data) {
          this.filteredRefDoctors = users.data.filter(
            (u: any) => u.role?.name === 'doctor'
          );
        } else {
          this.filteredRefDoctors = [];
        }
      });

    // Rest of your existing ngOnInit code...
    this.loadTodaysUHID();

    this.role.getusers().subscribe((res) => {
      this.doctors = res.filter((u: any) => u.role?.name === 'doctor') || [];
    });

    this.ipdadmission
      .get('patient_name')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((searchTerm: string) => {
          if (this.manuallySelected) return of({ uhids: [] });

          // Only trigger API if the user typed at least 2 characters
          if (searchTerm && searchTerm.trim().length > 2) {
            // Use a unified search endpoint (searches name, uhid, mobile, etc.)
            return this.uhidService.getPatientByFilters({
              search: searchTerm.trim(),
            });
          } else {
            return of({ uhids: [] });
          }
        })
      )
      .subscribe((res: any) => {
        if (this.manuallySelected) return;
        this.filteredPatients = res?.uhids || [];
        this.showSuggestions = this.filteredPatients.length > 0;
      });

    this.ipdadmission
      .get('uhid')!
      .valueChanges.pipe(
        debounceTime(100),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (!value || value.length <= 2) {
            this.manuallySelected = false;
            this.filteredPatients = [];
            this.showSuggestions = false;
            return of({ uhids: [] });
          }

          if (this.manuallySelected) return of({ uhids: [] });

          const filters: { [key: string]: string } = { uhid: value };
          return this.uhidService.getPatientByFilters(filters);
        })
      )
      .subscribe((res: any) => {
        this.filteredPatients = res?.uhids || [];
        this.showSuggestions = this.filteredPatients.length > 0;
      });

    this.masterService.getWardmasterUrl().subscribe((res) => {
      this.wards = res.wardMasters;
    });

    // Loading all bedtypes to show name
    this.bedwardroomservice.getroom().subscribe((res) => {
      this.rooms = res.rooms || res.data;
      console.log('ALL ROOMS', this.rooms);
      // Extract unique room types from rooms
      const map = new Map();
      this.rooms.forEach((room: any) => {
        if (room.room_type_id && !map.has(room.room_type_id._id)) {
          map.set(room.room_type_id._id, room.room_type_id);
        }
      });
      this.roomTypes = Array.from(map.values());
    });

    // get ipds admissions
    this.ipdservice.getIPDcase().subscribe({
      next: (res) => {
        this.ipdAdmissions = res.data?.inpatientCases
          ? res.data?.inpatientCases
          : res.data || [];
        console.log(
          '🚀 ~ IpdadmissionComponent ~ this.ipdservice.getIPDcase ~ this.ipdAdmissions:',
          this.ipdAdmissions
        );
      },
      error: (err) => {
        console.log(
          '🚀 ~ IpdadmissionComponent ~ this.ipdservice.getIPDcase ~ err:',
          err
        );
      },
    });

    // to edit form
    this.route.queryParams.subscribe((params) => {
      const ipdadmissionid = params['_id'];
      console.log('ID', this.patientId);
      if (ipdadmissionid) {
        this.editMode = true;
        this.loadIPDadmission(ipdadmissionid);
      } else {
        console.log('ipd case Id not found in query params.');
      }
    });
  }

  // ✅ Enhanced method to load companies
  loadCompanies(): void {
    console.log('🔍 Loading companies...');
    this.companyService.getAllCompanies().subscribe({
      next: (response) => {
        this.companies = response.data || response || [];
        console.log('🏢 Companies loaded:', this.companies.length, 'companies');

        // Filter only active cashless companies
        this.companies = this.companies.filter(
          (company) =>
            company.isActive &&
            (company.type === 'Cashless' || company.type === 'Corporate')
        );

        console.log(
          '🏢 Active cashless/corporate companies:',
          this.companies.length
        );
      },
      error: (error) => {
        console.error('❌ Error loading companies:', error);
        this.companies = [];
        this.showNotification('Failed to load companies', 'error');
      },
    });
  }

  // ✅ Enhanced company selection handler
  onCompanyChange(event: Event): void {
    const companyId = (event.target as HTMLSelectElement).value;
    console.log('🏢 Company selected:', companyId);

    if (companyId) {
      const selectedCompany = this.companies.find((c) => c._id === companyId);
      if (selectedCompany) {
        this.ipdadmission.patchValue({
          companyName: selectedCompany.companyName,
        });
        console.log('✅ Company name set to:', selectedCompany.companyName);
      }
    } else {
      this.ipdadmission.patchValue({
        companyName: '',
      });
      console.log('🗑️ Company name cleared');
    }
  }

  // ✅ Enhanced notification method (add this if not exists)
  private showNotification(
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ): void {
    // You can implement your notification logic here
    // For now, using console log
    console.log(`${type.toUpperCase()}: ${message}`);

    // If you have a toast service, use it like:
    // this.toastService.show(message, type);
  }

  // All your existing methods remain exactly the same...
  calculateDOBFromAge(ageString: string): string | null {
    const age = parseInt(ageString);
    if (isNaN(age) || age <= 0 || age > 150) return null;

    const today = new Date();
    const birthYear = today.getFullYear() - age;
    const dob = new Date(birthYear, today.getMonth(), today.getDate());

    const year = dob.getFullYear();
    const month = String(dob.getMonth() + 1).padStart(2, '0');
    const day = String(dob.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  calculateAge(dob: Date): { years: number; months: number; days: number } {
    const today = new Date();

    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    if (days < 0) {
      months--;
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

  selectDoctor(doctor: any) {
    this.ipdadmission.patchValue({
      admittingDoctorId: doctor._id,
      consSpeciality: doctor.speciality || '',
    });
    this.doctorSearchControl.setValue(doctor.name, { emitEvent: false });
    this.showDoctorSuggestions = false;
  }

  selectTreatDoctor(doctor: any) {
    this.ipdadmission.patchValue({
      treatingDoctor: doctor._id,
    });
    this.TreatdoctorSearchControl.setValue(doctor.name, { emitEvent: false });
    this.showTreatDoctorSuggestions = false;
  }

  selectRefDoctor(doctor: any) {
    this.ipdadmission.patchValue({
      referringDoctorId: doctor._id || '',
    });
    this.refDoctorSearchControl.setValue(doctor.name, { emitEvent: false });
    this.showRefDoctorSuggestions = false;
  }

  hideSuggestionsLater() {
    setTimeout(() => {
      this.showDoctorSuggestions = false;
      this.showTreatDoctorSuggestions = false;
      this.showRefDoctorSuggestions = false;
    }, 200);
  }

  showUHIDDropdown: boolean = false;
  uhidTodayRecords: any[] = [];

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
    this.selectPatient(record);
    this.showUHIDDropdown = false;
  }

  originalBedId: string = '';

  loadIPDadmission(ipdadmissionid: string) {
    this.ipdservice.getIPDcaseById(ipdadmissionid).subscribe((ipdcase: any) => {
      console.log('🚀 ~ loadIPDadmission ~ ipdcaseById:', ipdcase);

      this.ipdCaseById = ipdcase?.data;
      const ipdCase = ipdcase?.data;
      console.log(ipdCase, 'ipdCase');
      this.patientId = ipdCase?.uniqueHealthIdentificationId?._id || '';
      const uhid = ipdCase?.uniqueHealthIdentificationId?.uhid || '';
      if (uhid) {
        this.ipdadmission.patchValue({ caseType: 'old' });
      }

      this.opdservice
        .getMedicalCaseById(this.patientId)
        .subscribe((res: any) => {
          console.log('data medical', res);
          this.medicoData = res;
          this.medicoId = res[0]._id;

          this.treatDoctor = this.medicoData[0]?.treatingDoctor?.name;
          this.treatDoctorId = this.medicoData[0]?.treatingDoctor?._id;
          if (
            ipdCase?.isMedicoLegalCase &&
            this.medicoData &&
            this.medicoData[0]
          ) {
            const medico = this.medicoData[0];
            console.log('Medico Data for Patch:', medico);

            this.ipdadmission.patchValue({
              policeInformerFullName: medico.policeInformerFullName,
              police_station_location: medico.police_station_location,
              responsibleRelativeFullName: medico.responsibleRelativeFullName,
              informationReportedDate: this.formatDate(
                new Date(medico.informationReportedDate)
              ),
              bucket_number: medico.bucket_number,
            });
            this.TreatdoctorSearchControl.setValue(this.treatDoctor);
          }
        });

      if (ipdCase) {
        this.originalBedId = ipdCase?.bed_id?._id;
        this.selectedRoomNumber = ipdCase?.room_id?.roomNumber || '';
        this.selectedRooms = [ipdCase?.room_id];
        this.selectedBeds = [ipdCase?.bed_id];

        const formattedDate = new Date(ipdCase.admissionDate)
          .toISOString()
          .split('T')[0];
        const timeString = new Date(ipdCase.admissionTime)
          .toISOString()
          .split('T')[1]
          .substring(0, 5);

        this.doctorSearchControl.setValue(ipdCase?.admittingDoctorId?.name);
        this.refDoctorSearchControl.setValue(ipdCase?.referringDoctorId?.name);

        // ✅ Enhanced form patching with company fields
        this.ipdadmission.patchValue({
          patient_name: ipdCase?.uniqueHealthIdentificationId?.patient_name,
          uhid: ipdCase?.uniqueHealthIdentificationId?.uhid,
          age: ipdCase?.uniqueHealthIdentificationId?.age,
          gender: ipdCase?.uniqueHealthIdentificationId?.gender,
          area: ipdCase?.uniqueHealthIdentificationId?.area,
          dob: ipdCase?.uniqueHealthIdentificationId?.dob
            ? this.formatDate(
                new Date(ipdCase?.uniqueHealthIdentificationId?.dob)
              )
            : '',
          pincode: ipdCase?.uniqueHealthIdentificationId?.pincode,
          patient_type: ipdCase?.patient_type,
          mobile_no: ipdCase?.uniqueHealthIdentificationId?.mobile_no,
          alternate_mobile: ipdCase?.alternate_mobile,
          admissionDate: formattedDate,
          admissionTime: timeString,
          admittingDoctorId: ipdCase?.admittingDoctorId?._id,
          referringDoctorId: ipdCase?.referringDoctorId?._id || '',
          room_id: ipdCase?.room_id?._id,
          bed_id: ipdCase?.bed_id?._id,
          wardMasterId: ipdCase?.wardMasterId?._id,
          uniqueHealthIdentificationId: ipdCase.uniqueHealthIdentificationId,
          // ✅ Enhanced company field loading
          companyId: ipdCase?.companyId?._id || ipdCase?.companyId || '',
          companyName: ipdCase?.companyName || '',
          systolicBloodPressure: ipdCase?.vitals?.[0]?.systolicBloodPressure,
          diastolicBloodPressure: ipdCase?.vitals?.[0]?.diastolicBloodPressure,
          bloodGroup: ipdCase?.vitals?.[0]?.bloodGroup,
          temperature: ipdCase?.vitals?.[0]?.temperature,
          height: ipdCase?.vitals?.[0]?.height,
          weight: ipdCase?.vitals?.[0]?.weight,
          pulseRate: ipdCase?.vitals?.[0]?.pulseRate,
          spo2: ipdCase?.vitals?.[0]?.spo2,
          bloodSugar: ipdCase?.vitals?.[0]?.bloodSugar,
          respiratoryRate: ipdCase?.vitals?.[0]?.respiratoryRate,
          isMedicoLegalCase: ipdCase?.isMedicoLegalCase,
          isBedCategorySelected: ipdCase?.isBedCategorySelected,
          categoryChargeAs: ipdCase?.categoryChargeAs,
        });

        // Log company information for debugging
        console.log('🏢 Company information loaded:', {
          companyId: ipdCase?.companyId,
          companyName: ipdCase?.companyName,
          patientType: ipdCase?.patient_type,
        });

        this.manuallySelected = true;
      } else {
        console.error('IPD Case not found.');
      }
    });
  }

  filterDoctors(searchTerm: string): void {
    const term = searchTerm.toLowerCase();
    this.filteredDoctors = this.doctors.filter((doctor: any) => {
      const doc = doctor.name.toLowerCase();
      return doc.includes(term);
    });
  }

  selectPatient(patient: any) {
    console.log('Patient', patient._id);
    this.patientId = patient._id;

    this.manuallySelected = true;
    this.ipdadmission.patchValue({
      patient_name: patient.patient_name,
      mobile_no: patient.mobile_no,
      gender: patient.gender || '',
      age: patient.age || '',
      area: patient.area || '',
      dob: patient?.dob ? this.formatDate(new Date(patient?.dob)) : '',
      city: patient.city || '',
      pincode: patient.pincode || '',
      uhid: patient.uhid || '',
      uniqueHealthIdentificationId: patient._id,
      caseType: 'old',
    });
    this.showSuggestions = false;
    this.filteredPatients = [];
  }

  hideSuggestionsWithDelay() {
    setTimeout(() => (this.showSuggestions = false), 200);
  }

  onPatientInput() {
    if (this.editMode) {
      this.filteredPatients = [];
      return;
    }

    const value = this.ipdadmission.get('patient_name')?.value;
    if (this.manuallySelected && (!value || value.length < 2)) {
      this.manuallySelected = false;
    }
    if (!value || value.length <= 2) {
      this.filteredPatients = [];
      this.showSuggestions = false;
    } else {
      this.showSuggestions = true;
    }
  }

  onDoctorChange(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    const doc = this.doctors.find((d: any) => d._id === id);
    if (doc) {
      this.ipdadmission.patchValue({ consSpeciality: doc.specialization });
    }
  }

  onRefDoctorChange(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    const doc = this.doctors.find((d: any) => d._id === id);
    if (doc) {
      this.ipdadmission.patchValue({ refSpeciality: doc.specialization });
    }
  }

  isInvalid(control: string) {
    const c = this.ipdadmission.get(control);
    return c?.invalid && (c?.touched || c?.dirty);
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which || event.keyCode;
    if (charCode < 48 || charCode > 57) event.preventDefault();
  }

  selectedward: any;
  wardId: any;
  wardName: any;
  onWardSelected(event: Event) {
    const wardId = (event.target as HTMLSelectElement).value;
    const ward = this.wards.find((w) => w._id === wardId);
    this.wardId = ward?._id;
    this.wardName = ward.ward_name;
    this.selectedward = ward;
    const rooms = ward?.room_id || [];
    const room = rooms.filter((r: any) =>
      r.bed_id.some((b: any) => b.is_occupied !== true)
    );
    this.selectedRooms = room;
    this.selectedBeds = [];
    this.selectedBed = null;
    this.ipdadmission.patchValue({ room_id: '', bed_id: '' });
  }

  roomNumber: any;
  roomCharge: Number = 0;
  lockRoomCharge: Number = 0;
  selectedRoomLockCharge: Number = 0;
  selectedBedLockCharge: Number = 0;
  roomTypeId: any;
  onRoomSelected(event: Event) {
    const roomId = (event.target as HTMLSelectElement).value;
    const room = this.selectedRooms.find((r) => r._id === roomId);
    this.roomNumber = room.roomNumber;
    this.roomTypeId = room.room_type_id?._id;
    this.selectedBeds = room?.bed_id || [];
    console.log('Selected beds', this.selectedBeds);
    this.roomCharge = room.room_type_id?.price_per_day;
    this.ipdadmission.patchValue({ bed_id: '' });
  }

  onBedSelected(event: Event) {
    const bedId = (event.target as HTMLSelectElement).value;
    this.selectedBed = this.selectedBeds.find((b) => b._id === bedId);
  }

  bednumber: any;
  bedTypeId: any;
  bedCharge: Number = 0;
  lockBedCharge: Number = 0;
  onBedSelectedCustom(bed: any) {
    if (bed.is_occupied) return;
    this.selectedBed = bed;
    this.bednumber = bed.bed_number;
    this.bedCharge = bed.bed_type_id?.price_per_day;
    this.bedTypeId = bed.bed_type_id?._id;
    console.log('Selected bed', this.selectedBed);
    this.ipdadmission.patchValue({ bed_id: bed._id });
  }

  toggleBedCategory(event: any) {
    this.isBedCategory = event.target.checked;
    if (!this.isBedCategory) {
      this.ipdadmission.get('categoryChargeAs')?.reset();
      this.selectedRoomTypeId = null;
      this.selectedBedTypeId = null;
    }
  }

  // AS A category room select
  onRoomTypeSelect(event: Event) {
    const selectedId = (event.target as HTMLSelectElement).value;
    this.selectedRoomTypeId = selectedId;

    const selectedRoom = this.rooms.find(
      (r: any) => r.room_type_id._id === selectedId
    );

    const name = selectedRoom.room_type_id?.name;

    // Pick first bed type if available
    if (selectedRoom?.bed_id?.length) {
      this.selectedBedTypeId = selectedRoom.bed_id[0].bed_type_id?._id || null;
    } else {
      this.selectedBedTypeId = null;
    }

    const categoryRoomId = selectedId ? selectedId : null;
    const categoryBedId = this.selectedBedTypeId
      ? this.selectedBedTypeId
      : null;

    // Optionally patch both values into the form
    this.ipdadmission.patchValue({
      categoryChargeAs: name,
      categoryChargeAsRoomId: categoryRoomId,
      categoryChargeAsBedId: categoryBedId,
    });
  }

  formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  formattedDate(date: string | Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  resetForm(): void {
    const now = new Date();

    this.ipdadmission.reset({
      uhid: '',
      admissionTime: this.formatTime(now),
      admissionDate: this.formatDate(now),
      patient_name: '',
      age: '',
      mobile_no: '',
      gender: '',
      area: '',
      pincode: '',
      tpaCompany: '',
      policyNumber: '',
      insuranceType: '',
      admittingDoctorId: '',
      consSpeciality: '',
      referringDoctorId: '',
      refSpeciality: '',
      wardMasterId: '',
      isMedicoLegalCase: 'false',
      policeInformerFullName: '',
      responsibleRelativeFullName: '',
      treatingDoctor: '',
      informationReportedDate: '',
      informTime: '',
      uniqueHealthIdentificationId: '',
      room_id: '',
      bed_id: '',
      caseType: '',
      dot: this.formatTime(now),
      dor: this.formatDate(now),
      dob: null,
      patient_type: '',
      companyName: '',
      companyId: '', // Reset company fields
      systolicBloodPressure: '',
      diastolicBloodPressure: '',
      bloodGroup: '',
      temperature: '',
      height: '',
      weight: '',
      pulseRate: '',
      spo2: '',
      bloodSugar: '',
      respiratoryRate: '',
      alternate_mobile: '',
      isBedCategorySelected: '',
      categoryChargeAs: '',
    });

    this.doctorSearchControl.setValue('');
    this.refDoctorSearchControl.setValue('');
    this.TreatdoctorSearchControl.setValue('');
    this.selectedBed = '';
  }

  ipdId: any;
  // ✅ ENHANCED OnSubmit with company integration
  async OnSubmit(): Promise<void> {
    const Swal = (await import('sweetalert2')).default;

    // ✅ Enhanced form validation
    if (this.ipdadmission.invalid) {
      this.ipdadmission.markAllAsTouched();

      // Check specific company validation
      const patientType = this.ipdadmission.get('patient_type')?.value;
      const companyId = this.ipdadmission.get('companyId')?.value;

      if (
        (patientType === 'cashless' || patientType === 'corporate') &&
        !companyId
      ) {
        Swal.fire({
          icon: 'warning',
          title: 'Company Required',
          text: `Company selection is required for ${patientType} patients.`,
          customClass: {
            popup: 'hospital-swal-popup',
            title: 'hospital-swal-title',
            htmlContainer: 'hospital-swal-text',
            confirmButton: 'hospital-swal-button',
          },
        });
        return;
      }

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
      this.isSubmitting = true;

      const formData = this.ipdadmission.value;
      console.log('🚀 Form data for submission:', formData);

      let uhid = formData.uhid;
      let uhidId = this.patientId || '';

      const isExistingPatient = !!this.patientId;

      if (!isExistingPatient) {
        // Step 1: Create UHID
        const uhidPayload = {
          patient_name: formData.patient_name,
          mobile_no: formData.mobile_no,
          gender: formData.gender,
          age: formData.age,
          dob: formData.dob,
          area: formData.area,
          city: formData.city,
          pincode: formData.pincode,
          address: formData.address,
          dor: formData.dor,
          dot: formData.dot,
          uhid: formData.uhid,
        };

        const uhidResponse: any = await firstValueFrom(
          this.uhidService.postuhid(uhidPayload)
        );

        console.log('UHID Response:', uhidResponse);
        uhid = uhidResponse?.data?.uhid || uhidResponse?.uhid;
        uhidId = uhidResponse?.data?._id || uhidResponse?._id;
      }

      // Step 2: Format admission datetime
      const date = formData.admissionDate;
      const time = formData.admissionTime;
      const vitals = {
        systolicBloodPressure: +formData.systolicBloodPressure,
        diastolicBloodPressure: +formData.diastolicBloodPressure,
        bloodGroup: formData.bloodGroup,
        temperature: +formData.temperature,
        height: +formData.height,
        weight: +formData.weight,
        pulseRate: +formData.pulseRate,
        spo2: +formData.spo2,
        bloodSugar: +formData.bloodSugar,
        respiratoryRate: +formData.respiratoryRate,
        recordedBy: JSON.parse(localStorage.getItem('authUser') || '{}')._id,
      };

      const combinedDateTime = new Date(`${date}T${time}`);
      this.ipdadmission.patchValue({ admissionTime: combinedDateTime });

      // Step 3: Build final IPD payload
      const referringDoctorId =
        formData.referringDoctorId && formData.referringDoctorId !== 'SELF'
          ? formData.referringDoctorId
          : null;

      const isSharing =
        formData.referringDoctorId && formData.referringDoctorId !== 'SELF'
          ? true
          : false;

      const isBedCategorySelected = !!formData.isBedCategorySelected;

      // ✅ Enhanced final payload with company information
      const finalPayload = {
        ...this.ipdadmission.value,
        uhid: uhid,
        uniqueHealthIdentificationId: uhidId,
        vitals,
        referringDoctorId: referringDoctorId,
        isMedicoLegalCase: formData.isMedicoLegalCase,
        isSharing: isSharing,
        isBedCategorySelected: isBedCategorySelected,
        categoryChargeAs: formData.categoryChargeAs,
        // ✅ Company fields with proper validation
        companyId: formData.companyId || null,
        companyName: formData.companyName || '',
        patient_type: formData.patient_type,
      };

      const medicoCasepayload = {
        uniqueHealthIdentificationId: uhidId,
        policeInformerFullName: formData.policeInformerFullName,
        police_station_location: formData.police_station_location,
        responsibleRelativeFullName: formData.responsibleRelativeFullName,
        treatingDoctor:
          formData.treatingDoctor._id ||
          formData.treatingDoctor ||
          this.treatDoctorId,
        informationReportedDate: formData.informationReportedDate,
        bucket_number: formData.bucket_number,
        caseType: 'inpatient',
      };

      console.log('📋 Final payload for IPD creation:', finalPayload);

      const ipdId = this.route.snapshot.queryParams['_id'];

      if (ipdId) {
        // Update IPD Case
        let updateResponse;

        // ✅ ENHANCED: Use company-aware update logic
        const isCompanyPatient =
          (formData.patient_type === 'cashless' ||
            formData.patient_type === 'corporate') &&
          formData.companyId;

        console.log('🔄 Updating IPD case:', {
          ipdId: ipdId,
          isCompanyPatient: isCompanyPatient,
          companyName: formData.companyName,
        });

        if (isCompanyPatient) {
          // Use company-enhanced update endpoint if available
          updateResponse = await firstValueFrom(
            this.ipdservice.updateIPDcase(ipdId, finalPayload)
          );
        } else {
          updateResponse = await firstValueFrom(
            this.ipdservice.updateIPDcase(ipdId, finalPayload)
          );
        }

        if (formData.isMedicoLegalCase) {
          await firstValueFrom(
            this.opdservice.updateopdedicoLegalCaseapis(
              this.medicoId,
              medicoCasepayload
            )
          );
        }

        // Free old bed if changed
        const newBedId = finalPayload.bed_id;
        if (this.originalBedId && this.originalBedId !== newBedId) {
          await firstValueFrom(
            this.bedwardroomservice.updatebed(this.originalBedId, {
              is_occupied: false,
            })
          );
        }

        if (newBedId) {
          await firstValueFrom(
            this.bedwardroomservice.updatebed(newBedId, { is_occupied: true })
          );
        }

        // ✅ Enhanced success message
        const companyMessage = finalPayload.companyName
          ? ` (${finalPayload.companyName})`
          : '';

        Swal.fire({
          icon: 'success',
          title: 'IPD Case Updated',
          text: `IPD Admission has been updated successfully.${companyMessage}`,
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
      } else {
        // ✅ ENHANCED: Create new IPD Case with company logic
        let created: any;

        const isCompanyPatient =
          (formData.patient_type === 'cashless' ||
            formData.patient_type === 'corporate') &&
          formData.companyId;
        const isCategorySelected = formData.isBedCategorySelected;
        console.log("category", isCategorySelected);

        console.log('🆕 Creating new IPD case:', {
          isCompanyPatient: isCompanyPatient,
          companyName: formData.companyName,
          patientType: formData.patient_type,
        });

        // Use appropriate service method
         if (isCompanyPatient && isCategorySelected) {
          console.log("company and bed category patient");
          created = await firstValueFrom(
            this.ipdservice.postIPDcase(finalPayload) // This should trigger company rate locking backend
          );

          const id = created?.data?._id || created?._id;
          const roomId = created?.data?.categoryChargeAsRoomId;
          const bedId = created?.data?.categoryChargeAsBedId;
          console.log("room id", roomId);
          console.log("bed id", bedId);
          // ✅ Get Locked Company Rates (await instead of subscribe)
          const res = await firstValueFrom(
            this.ipdservice.getCompanyLockedRates(id)
          );

          const data = res.data;

          // ✅ Match Room & Bed Types
          const lockedRoom = data.lockedRoomTypeRates.find(
            (item: any) => item.roomTypeId?._id === roomId
          );

          const lockedBed = data.lockedBedTypeRates.find(
            (item: any) => item.bedTypeId?._id === bedId
          );

          // ✅ Set Locked Rates
          this.selectedRoomLockCharge = lockedRoom?.lockedRate ?? 0;
          this.selectedBedLockCharge = lockedBed?.lockedRate ?? 0;
          console.log("selected room charge", this.selectedRoomLockCharge);
          console.log("selected bed charge", this.selectedBedLockCharge);
        } else if (isCompanyPatient) {
          // ✅ Use company-aware creation method
          created = await firstValueFrom(
            this.ipdservice.postIPDcase(finalPayload) // This should trigger company rate locking in backend
          );

          const id = created?.data?._id || created?._id;
          // ✅ Get Locked Company Rates (await instead of subscribe)
          const res = await firstValueFrom(
            this.ipdservice.getCompanyLockedRates(id)
          );

          const data = res.data;

          // ✅ Match Room & Bed Types
          const lockedRoom = data.lockedRoomTypeRates.find(
            (item: any) => item.roomTypeId?._id === this.roomTypeId
          );

          const lockedBed = data.lockedBedTypeRates.find(
            (item: any) => item.bedTypeId?._id === this.bedTypeId
          );

          // ✅ Set Locked Rates
          this.lockRoomCharge = lockedRoom?.lockedRate ?? 0;
          this.lockBedCharge = lockedBed?.lockedRate ?? 0;
        } else {
          console.log('📊 Creating standard IPD case...');
          created = await firstValueFrom(
            this.ipdservice.postIPDcase(finalPayload)
          );
        }

        this.ipdId = created?._id || created?.data?._id;
        const selectedRoomCategoryCharge = created?.data.categoryRoomCharge;
        const selectedBedCategoryCharge = created?.data.categoryBedCharge;

        if (formData.isMedicoLegalCase) {
          await firstValueFrom(
            this.opdservice.postopdedicoLegalCaseapis(medicoCasepayload)
          );
        }

        const bedId = created?.bed_id || created?.data?.bed_id;
        if (bedId) {
          await firstValueFrom(
            this.bedwardroomservice.updatebed(bedId, { is_occupied: true })
          );
        }

        // ✅ Enhanced success message with company info
        const companyMessage = finalPayload.companyName
          ? ` with ${finalPayload.companyName} company rates`
          : '';

        Swal.fire({
          icon: 'success',
          title: 'IPD Case Created',
          text: `New IPD Admission has been created successfully${companyMessage}.`,
          position: 'top-end',
          toast: true,
          timer: 3500,
          showConfirmButton: false,
          customClass: {
            popup: 'hospital-toast-popup',
            title: 'hospital-toast-title',
            htmlContainer: 'hospital-toast-text',
          },
        });

        // ✅ Log creation success with company details
        console.log('✅ IPD case created successfully:', {
          caseId: created?._id || created?.data?._id,
          companyRatesApplied: isCompanyPatient,
          companyName: finalPayload.companyName,
        });

        const date = formData.admissionDate;
        const time = formData.admissionTime;
        const combinedDateTime = new Date(`${date}T${time}`);

        let primaryBed = {
          wardId: this.wardId,
          wardName: this.wardName,
          roomId: formData.room_id,
          roomNumber: this.roomNumber,
          bedId: formData.bed_id,
          bedNumber: this.bednumber,
          originalRoomCharge: this.roomCharge,
          originalBedCharge: this.bedCharge,
          // roomCharge: isCompanyPatient
          //   ? this.lockRoomCharge
          //   : isBedCategorySelected
          //   ? selectedRoomCategoryCharge
          //   : this.roomCharge,

          // bedCharge: isCompanyPatient
          //   ? this.lockBedCharge
          //   : isBedCategorySelected
          //   ? selectedBedCategoryCharge
          //   : this.bedCharge,
          roomCharge: isCompanyPatient
            ? isCategorySelected
              ? this.selectedRoomLockCharge // ✅ company + selected = selected company charge
              : this.lockRoomCharge // ✅ company + no selection = locked actual rate
            : isCategorySelected
            ? selectedRoomCategoryCharge // ✅ normal + selected = selected normal charge
            : this.roomCharge, // ✅ normal + no selection = actual rate

          bedCharge: isCompanyPatient
            ? isCategorySelected
              ? this.selectedBedLockCharge
              : this.lockBedCharge
            : isCategorySelected
            ? selectedBedCategoryCharge
            : this.bedCharge,

          assignedDate: formData.admissionDate,
        };

        let currentBed = {
          wardId: this.wardId,
          wardName: this.wardName,
          roomId: formData.room_id,
          roomNumber: this.roomNumber,
          bedId: formData.bed_id,
          bedNumber: this.bednumber,
          originalRoomCharge: this.roomCharge,
          originalBedCharge: this.bedCharge,
          roomCharge: isCompanyPatient
            ? isCategorySelected
              ? this.selectedRoomLockCharge // ✅ company + selected = selected company charge
              : this.lockRoomCharge // ✅ company + no selection = locked actual rate
            : isCategorySelected
            ? selectedRoomCategoryCharge // ✅ normal + selected = selected normal charge
            : this.roomCharge, // ✅ normal + no selection = actual rate

          bedCharge: isCompanyPatient
            ? isCategorySelected
              ? this.selectedBedLockCharge
              : this.lockBedCharge
            : isCategorySelected
            ? selectedBedCategoryCharge
            : this.bedCharge,

          assignedDate: formData.admissionDate,
        };

        const payload = {
          inpatientCaseId: this.ipdId,
          lastLogDate: combinedDateTime,
          primaryBed,
          currentBed,
          dailyRoomChargeLogs: [
            {
              date: combinedDateTime,
              roomId: formData.room_id,
              roomNumber: this.roomNumber,
              bedId: formData.bed_id,
              bedNumber: this.bednumber,
              originalRoomCharge: this.roomCharge,
              originalBedCharge: this.bedCharge,
              roomCharge: isCompanyPatient
                ? isCategorySelected
                  ? this.selectedRoomLockCharge // ✅ company + selected = selected company charge
                  : this.lockRoomCharge // ✅ company + no selection = locked actual rate
                : isCategorySelected
                ? selectedRoomCategoryCharge // ✅ normal + selected = selected normal charge
                : this.roomCharge, // ✅ normal + no selection = actual rate

              bedCharge: isCompanyPatient
                ? isCategorySelected
                  ? this.selectedBedLockCharge
                  : this.lockBedCharge
                : isCategorySelected
                ? selectedBedCategoryCharge
                : this.bedCharge,

              remarks: isCategorySelected
                ? `Charge as ${created?.data?.categoryChargeAs}`
                : 'Primary Bed',
            },
          ],
        };

        this.ipdservice.postipdroomtransfer(payload).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'IPD Room Log created',
              text: 'Patient room log created successfully.',
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
          },
          error: (err) => {
            console.error('Room log could not created', err);
          },
        });
      }

      // Final cleanup
      this.ipdadmission.reset();
      this.router.navigate(['/ipd/ipdadmissionlist']);
    } catch (err: any) {
      console.error('❌ Error during IPD + UHID submission:', err);
      this.isSubmitting = false;

      const errorMessage =
        err?.error?.message ||
        err?.message ||
        'Something went wrong during submission.';

      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: errorMessage,
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  generateUHID(): string {
    const date = new Date();
    return `UHID-${date.getFullYear()}${
      date.getMonth() + 1
    }${date.getDate()}-${Math.floor(Math.random() * 1000000)}`;
  }

  // get patient on bed by name
  ipdAdmissions: any[] = [];

  getPatientNameForBed(bedId?: string): string | null {
    for (const adm of this.ipdAdmissions) {
      const admBedId =
        typeof adm.bed_id === 'string' ? adm.bed_id : adm?.bed_id?._id;
      if (admBedId?.toString() === bedId?.toString()) {
        const patientName = adm?.uniqueHealthIdentificationId?.patient_name;
        console.log(patientName);
        console.log(`🛏️ Bed ${bedId} → ${patientName}`);
        return patientName;
      }
    }
    return null;
  }
} // ✅ CLOSING BRACE ADDED
