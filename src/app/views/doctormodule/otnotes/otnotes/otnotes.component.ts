import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, switchMap, of } from 'rxjs';
// import Swal from 'sweetalert2';
import { IpdService } from '../../../ipdmodule/ipdservice/ipd.service';
import { DoctorService } from '../../doctorservice/doctor.service';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';
import { CustomtimepickerComponent } from '../../../../component/customtimepicker/customtimepicker.component';

@Component({
  selector: 'app-otnotes',
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './otnotes.component.html',
  styleUrl: './otnotes.component.css',
})
export class OtnotesComponent implements OnInit {
  otnotes: FormGroup;
  manuallySelected = false;
  filteredPatients: any[] = [];
  showSuggestions = false;

  sections = ['OT PROCEDURE', 'POST OPERATIVE ORDER'];
  selectedSection: string = 'OT PROCEDURE';
  sectionContent: { [key: string]: string } = {
    'OT PROCEDURE': '',
    'POST OPERATIVE ORDER': '',
  };

  activeFilter: 'today' | 'dateRange' = 'today';
  dropdownOpen = false;
  uhidTodayRecords: any[] = [];
  ipdId: string  = '';

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  constructor(
    private fb: FormBuilder,
    private ipdservice: IpdService,
    private doctorservice: DoctorService,
    private router: Router,
    private routes: ActivatedRoute
  ) {
    const now = new Date();

    this.otnotes = this.fb.group({
      uhid: ['', Validators.required],
      doa: [''],
      patient_name: ['', Validators.required],
      age: ['', Validators.required],
      doctor: [''],
      bed: [''],
      intime: [this.formatTime(now)],
      indate: [this.formatDate(now)],
      startingtime: [this.formatTime(now)],
      startingdate: [this.formatDate(now)],
      outtime: [this.formatTime(now)],
      outdate: [this.formatDate(now)],
      endingtime: [this.formatTime(now)],
      endingdate: [this.formatDate(now)],
      suregon: [''],
      procedure_name: [''],
      anaesthetic: [''],
      anaesthesia: [''],
      otprocedure: [''],
      postoperativeorder: [''],
      inpatientCaseId: [''],
      // otid: ['']

      // added fields
      anesthetist: [''],
      anethesia: [''],
      surgeon_name: [''],
      operation_note: [''],
      anesthesia_note: [''],
      circulatory_staff: [''],
      scrub_nurse_1: [''],
      scrub_nurse_2: [''],
      remark: [''],

      //added fields
      diagnosis: [''],
      consent: [''],
      position: [''],
      skin_incision: [''],
      approach: [''],
      steps: [''],
      closure: [''],
      shifting: [''],
      weight: [''],
    });
  }

  userPermissions: any = {};

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'operationTheatreNotes'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions

    this.routes.queryParams.subscribe((params) => {
      const ipdid = params['id'];
      if(ipdid){
        this.ipdId = ipdid;
        this.getPatientFromCase(ipdid);
      }
    })

    // uhid
    this.loadTodaysUHID();

    // search by ot patient name
    this.otnotes
      .get('patient_name')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((name: string) => {
          if (this.manuallySelected) return of([]);
          return name && name.length > 2
            ? this.ipdservice.getpatientoprationTheatresheet(name)
            : of([]);
        })
      )
      .subscribe((res: any) => {
        if (this.manuallySelected) return;
        this.filteredPatients = res;
        this.showSuggestions = this.filteredPatients.length > 0;
      });

    // serch by ot patietn uhid

    this.otnotes
      .get('uhid')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((name: string) => {
          if (this.manuallySelected) return of([]);
          return name && name.length > 2
            ? this.ipdservice.getpatientuhidoprationTheatresheet(name)
            : of([]);
        })
      )
      .subscribe((res: any) => {
        if (this.manuallySelected) return;
        this.filteredPatients = res;
        this.showSuggestions = this.filteredPatients.length > 0;
      });

    // serch by ot patietn uhid

    // to edit
    this.routes.queryParams.subscribe((params) => {
      const otnoteid = params['_id'] || null;
      if (otnoteid) {
        this.manuallySelected = true;
        this.loadOtnotes(otnoteid);
      }
    });
  }

  // uhid fo toadys
  showUHIDDropdown: boolean = false;

  loadTodaysUHID(): void {
    const today = new Date().toISOString().split('T')[0];

    this.ipdservice.getIPDcase(1, 100, '').subscribe(
      (res) => {
        console.log('FULL RESPONSE:', res);

        const allRecords = res.data.inpatientCases || [];

        this.uhidTodayRecords = allRecords.filter((record: any) => {
          // SAFER → compare admissionDate instead of createdAt
          const admissionDate = new Date(record.admissionDate)
            .toISOString()
            .split('T')[0];
          return admissionDate === today;
        });

        console.log("Today's UHID Records:", this.uhidTodayRecords);
      },
      (err) => {
        console.error("Error loading today's UHID:", err);
      }
    );
  }

  getPatientFromCase(id: string){
    this.ipdservice.getIPDcaseById(id).subscribe((res => {
      console.log("patient from case", res);
      const patient = res.data || res;
      if(patient){
        this.selectPatient(patient);
      }
    }))
  }

  selectPatientFromUHID(record: any): void {
    console.log('Selected from UHID dropdown:', record);
    this.selectPatient(record);
    this.showUHIDDropdown = false;
  }

  formatDateToInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // handle invalid date
    return date.toISOString().split('T')[0]; // returns YYYY-MM-DD
  }

  loadOtnotes(Otid: string) {
    this.doctorservice.getoperationNote().subscribe((res: any) => {
      const otnotes = res;
      const otnote = otnotes.find((p: any) => p._id === Otid);
      console.log('Fetched OT Note:', otnote);

      if (otnote) {
        // Step 1: Load dynamic section data into sectionContent
        this.sectionContent = {
          'OT PROCEDURE': otnote.otprocedure || '',
          'POST OPERATIVE ORDER': otnote.postoperativeorder || '',
        };

        // Step 2: Patch all form values including section content
        this.otnotes.patchValue({
          patient_name: otnote.patient_name,
          uhid: otnote.uhid,
          age: otnote.age,
          patient_type: otnote.patient_type,
          doctor: otnote.doctor,
          bed: otnote.bed,
          intime: otnote.intime,
          indate: this.formatDate(otnote.indate),
          startingtime: otnote.startingtime,
          startingdate: this.formatDate(otnote.startingdate),
          outtime: otnote.outtime,
          outdate: this.formatDate(otnote.outdate),
          endingtime: otnote.endingtime,
          endingdate: this.formatDate(otnote.endingdate),
          suregon: otnote.suregon,
          procedure_name: otnote.procedure_name,
          otprocedure: this.sectionContent['OT PROCEDURE'],
          postoperativeorder: this.sectionContent['POST OPERATIVE ORDER'],
          inpatientCaseId: otnote.inpatientCaseId,
          otid: otnote.otid,
          anesthetist: otnote.anesthetist || '',
          anethesia: otnote.anethesia || '',
          surgeon_name: otnote.surgeon_name || '',
          operation_note: otnote.operation_note || '',
          anesthesia_note: otnote.anesthesia_note || '',
          circulatory_staff: otnote.circulatory_staff || '',
          scrub_nurse_1: otnote.scrub_nurse_1 || '',
          scrub_nurse_2: otnote.scrub_nurse_2 || '',
          remark: otnote.remark || '',
          diagnosis: otnote.diagnosis || '',
          consent: otnote.consent,
          position: otnote.position,
          skin_incision: otnote.skin_incision,
          approach: otnote.approach,
          steps: otnote.steps,
          closure: otnote.closure,
          shifting: otnote.shifting,
        });
      } else {
        console.warn('OT note not found for ID:', Otid);
      }
    });
  }

  formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  formatDate(date: any): string | null {
    if (!date) return null;

    // Handle DD/MM/YYYY format
    if (typeof date === 'string' && date.includes('/')) {
      const [day, month, year] = date.split('/');
      const isoString = new Date(`${year}-${month}-${day}`)
        .toISOString()
        .split('T')[0];
      return isoString;
    }

    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  }

  selectPatient(patient: any): void {
    this.manuallySelected = true;
    const inpatientCase = patient?.inpatientCases?.[0] || patient;
    const operationTheatresheets = patient?.operationTheatresheets;

    const formattedAdmissionDate = inpatientCase?.admissionDate
      ? new Date(inpatientCase.admissionDate).toISOString().split('T')[0]
      : '';

    const formattedSurgeryDate = operationTheatresheets?.surgeryDate
      ? new Date(operationTheatresheets.surgeryDate).toISOString().split('T')[0]
      : '';

    this.otnotes.patchValue({
      uhid: patient.uhid || patient.uniqueHealthIdentificationId?.uhid || '',
      patient_name:
        patient?.patient_name ||
        patient.uniqueHealthIdentificationId?.patient_name ||
        '',
      age: patient?.age || patient.uniqueHealthIdentificationId?.age || '',
      gender:
        patient?.gender || patient.uniqueHealthIdentificationId?.gender || '',
      weight: patient.vitals[0]?.weight || '',
      patientUhidId:
        patient?._id || patient.uniqueHealthIdentificationId?._id || '',
      admissionDate: formattedAdmissionDate,
      bed: inpatientCase?.bed_id?.bed_number || '',
      doctor: inpatientCase?.admittingDoctorId?.name || '',
      uniqueHealthIdentificationId:
        patient?._id || patient.uniqueHealthIdentificationId?._id || '',
      inpatientCaseId: inpatientCase?._id || '',
      startingdate: formattedSurgeryDate,
      startingtime: operationTheatresheets?.surgeryStartTime || '',
      outtime: operationTheatresheets?.surgeryEndTime || '',
      anaesthesia: operationTheatresheets?.anesthesiaType || '',
      procedure_name: operationTheatresheets?.surgeryPackageId?.name || '',

      suregon: inpatientCase?.admittingDoctorId?.name || '',
      anesthetist: operationTheatresheets?.anesthetist || '',
      anethesia: operationTheatresheets?.anesthesia || '',
      surgeon_name: operationTheatresheets?.surgeon_name || '',
      operation_note: operationTheatresheets?.operation_note || '',
      anesthesia_note: operationTheatresheets?.anesthesia_note || '',
      circulatory_staff: operationTheatresheets?.circulatory_staff || '',
      scrub_nurse_1: operationTheatresheets?.scrub_nurse_1 || '',
      scrub_nurse_2: operationTheatresheets?.scrub_nurse_2 || '',
      remark: operationTheatresheets?.remark || '',
      diagnosis: operationTheatresheets?.diagnosis || '',
      consent: operationTheatresheets?.consent,
      position: operationTheatresheets?.position,
      skin_incision: operationTheatresheets?.skin_incision,
      approach: operationTheatresheets?.approach,
      steps: operationTheatresheets?.steps,
      closure: operationTheatresheets?.closure,
      shifting: operationTheatresheets?.shifting,
    });

    this.showSuggestions = false;
    this.filteredPatients = [];
  }

  onPatientInput(): void {
    const searchTerm = this.otnotes.get('patient_name')?.value;

    if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
      this.manuallySelected = false;
    }

    if (!searchTerm || searchTerm.length <= 2) {
      this.filteredPatients = [];
      this.showSuggestions = false;
      return;
    }

    if (this.filteredPatients.length > 0) {
      this.showSuggestions = true;
    }
  }
  onUhidInput(): void {
    const searchTerm = this.otnotes.get('uhid')?.value;

    if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
      this.manuallySelected = false;
    }

    if (!searchTerm || searchTerm.length <= 2) {
      this.filteredPatients = [];
      this.showSuggestions = false;
      return;
    }

    if (this.filteredPatients.length > 0) {
      this.showSuggestions = true;
    }
  }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  selectSection(section: string): void {
    this.selectedSection = section;
  }

  resetForm(): void{
     const now = new Date();

     this.otnotes.reset({
       uhid: '',
       doa: [''],
       patient_name: '',
       age: '',
       doctor: [''],
       bed: [''],
       //  intime: this.formatTime(now),
       //  indate: this.formatDate(now),
       //  startingtime: this.formatTime(now),
       //  startingdate: this.formatDate(now),
       //  outtime: this.formatTime(now),
       //  outdate: this.formatDate(now),
       //  endingtime: this.formatTime(now),
       //  endingdate: this.formatDate(now),
       intime: '',
       indate: '',
       startingtime: '',
       startingdate: '',
       outtime: '',
       outdate: '',
       endingtime: '',
       endingdate: '',
       suregon: [''],
       procedure_name: [''],
       anaesthetic: [''],
       anaesthesia: [''],
       otprocedure: [''],
       postoperativeorder: [''],
       anesthetist: [''],
       anethesia: [''],
       surgeon_name: [''],
       operation_note: [''],
       anesthesia_note: [''],
       circulatory_staff: [''],
       scrub_nurse_1: [''],
       scrub_nurse_2: [''],
       remark: [''],
       diagnosis: [''],
       consent: [''],
       position: [''],
       skin_incision: [''],
       approach: [''],
       steps: [''],
       closure: [''],
       shifting: [''],
     });
     this.sectionContent = {
       'OT PROCEDURE': '',
       'POST OPERATIVE ORDER': '',
     };

  }

  async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;

    if (this.otnotes.invalid) {
      this.otnotes.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Invalid Form',
        text: 'Please complete all required fields before submitting.',
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
      return;
    }

    // ✅ Sync section content into the form
    this.otnotes.patchValue({
      otprocedure: this.sectionContent['OT PROCEDURE'],
      postoperativeorder: this.sectionContent['POST OPERATIVE ORDER'],
    });

    const payload = this.otnotes.value;

    this.routes.queryParams.subscribe((params) => {
      const otnoteid = params['_id'] || null;

      if (otnoteid) {
        // 🔄 Update existing OT note
        this.doctorservice
          .updateoperationNoteapisapis(otnoteid, payload)
          .subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'OT Note Updated',
                text: 'OT note has been successfully updated!',
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
              this.router.navigateByUrl('/doctor/otnoteslist'); // ✅ Update this to your actual OT notes list route
            },
            error: (err) => {
              console.error('Error updating OT note:', err);
              Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                // text: 'There was an error updating the OT note.',
                text:
                  err?.error?.message ||
                  'There was an error updating the OT note.',
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
        // ➕ Create new OT note
        this.doctorservice.postoperationNoteapisapis(payload).subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: 'OT Note Created',
              text: 'OT note has been successfully submitted!',
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
            this.otnotes.reset();
            if(res.inpatientCaseId){
              this.router.navigate(['/ipdpatientsummary'], {
                queryParams: { id: res.inpatientCaseId },
              })
            }else{
              this.router.navigate(['/ipdpatientsummary']); 
            }
            // this.router.navigateByUrl('/doctor/otnoteslist'); // ✅ Update to your route
          },
          error: (err) => {
            console.error('Error creating OT note:', err);
            Swal.fire({
              icon: 'error',
              title: 'Submission Failed',
              // text: 'There was an error while saving the OT note.',
              text:
                err?.error?.message ||
                'There was an error creating the OT note.',
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
  }
}
