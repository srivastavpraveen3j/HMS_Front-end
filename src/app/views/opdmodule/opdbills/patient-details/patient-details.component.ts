import { OpdService } from './../../opdservice/opd.service';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-patient-details',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.css']
})
export class PatientDetailsComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() convertFromAppointment: boolean = false;
  @Input() opdTodayRecords: any[] = [];

  showOPDDropdown = false;
  billNumber: string | null = '';
  caseid: string | null = '';
  selectedServices: any[] = []; // <-- To show selected services

  constructor(
    private route: ActivatedRoute,
    private OutSerivce: OpdService,
    private fb: FormBuilder // <-- Needed for creating FormGroups in FormArray
  ) { }


  private patchPatientDetails(data: any) {
    // If `data.uniqueHealthIdentificationId` exists, prefer that
    const uhidData = data.uniqueHealthIdentificationId ?? data;
    const patient_name = data.patient_name ?? uhidData?.patient_name ?? data.patientUhid.patient_name;
    const age = data.age ?? uhidData?.age ??  data.patientUhid.age;
    const gender = data.gender ?? uhidData?.gender ?? data.patientUhid.gender;
    const mobile_no = data.mobile_no ?? uhidData?.mobile_no ?? data.patientUhid.mobile_no;
    const caseNo = data.uhid ?? uhidData?.uhid ?? data.patientUhid.uhid;
    const Bill_No = data.billnumber;
    this.parentForm.patchValue({
      patient_name,
      age,
      gender,
      caseNo,
      mobile_no,
      Bill_No
    });
  }

  ngOnInit() {
    // First, check the path to see if it's a "case" URL
    this.route.url.subscribe(urlSegments => {
      const path = urlSegments.map(seg => seg.path).join('/');

      if (path === 'case') {
        // Case URL: use query param _id
        this.route.queryParamMap.subscribe(params => {
          const caseId = params.get('_id');
          if (!caseId) throw new Error('No case _id in query params!');

          this.OutSerivce.getOPDcaseById(caseId).subscribe({
            next: (res) => {
              const patient = res;
              if (!patient) throw new Error('Case not found!');

              this.patchPatientDetails(patient.
                uniqueHealthIdentificationId
              );
            },
            error: err => console.error('Error fetching OPD case:', err)
          });
        });

      } else {
        // Not a case URL: assume bill logic
        this.route.paramMap.subscribe(params => {
          const billId = params.get('id');
          if (!billId) throw new Error('No bill id in route params!');
          this.prefillFormByBillNumber(billId);
        });
      }
    });
  }


  // ✅ Getter to access services FormArray in parent form
  get services(): FormArray {
    return this.parentForm.get('services') as FormArray;
  }

  // ✅ Prefill services from old bill
  prefillServices(bill: any) {
    this.services.clear();

    bill.services?.forEach((service: any) => {
      this.services.push(this.fb.group({
        _id: [service._id],
        name: [service.name],
        charge: [service.charge],
        type: [service.type],
        isBilled: [service.isBilled],
      }));
    });

    // Display in selected panel
    this.selectedServices = [...bill.services];
  }

  // ✅ Prefill form + services by bill number
  prefillFormByBillNumber(billNo: string) {
    this.OutSerivce.getOPDbillById(billNo).subscribe({
      next: (res) => {
        console.log("123", res);
        if (res?.success && res.data) {
          const bill = res.data;
          // Patch patient info
          if (bill) {
            this.patchPatientDetails(bill);
          }
          // Patch services
          this.prefillServices(bill);
        }
      },
      error: (err) => console.error('Error fetching OPD bill:', err)
    });
  }

  selectPatientFromOPD(record: any) {
    // this.patientSelected.emit(record);
    this.showOPDDropdown = false;
  }
}
