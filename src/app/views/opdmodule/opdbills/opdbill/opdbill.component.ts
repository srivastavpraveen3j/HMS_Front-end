import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PatientDetailsComponent } from '../patient-details/patient-details.component';
import { ServiceDetailsComponent } from '../service-details/service-details.component';
import { PaymentDetailsComponent } from '../payment-details/payment-details.component';
import { OPDDropdownComponent } from '../../../../component/opd-dropdown/opd-dropdown.component';
import { OpdService } from '../../opdservice/opd.service';
import Swal from 'sweetalert2';
import { DiscountService } from '../../../../core/services/discount.service';
@Component({
  selector: 'app-opdbill',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    PatientDetailsComponent,
    ServiceDetailsComponent,
    PaymentDetailsComponent,
    OPDDropdownComponent
  ],
  templateUrl: './opdbill.component.html',
  styleUrls: ['./opdbill.component.css'],
})
export class OpdbillComponent implements OnInit {
  // -------------------- Form & Input --------------------
  opdbillForm!: FormGroup;           // The main OPD bill form
  selectedServices: any[] = [];      // Services selected in this bill

  // -------------------- Patient & Case Information --------------------
  patientId!: string;                 // ID of the patient
  uhid: string = '';                  // Unique Health ID
  caseId: string = '';                // Case reference ID
  billId: string = '';                // Bill reference ID

  // -------------------- Records & History --------------------
  opdTodayRecords: any[] = [];        // OPD records of today

  // -------------------- Flags & Modes --------------------
  convertFromAppointment = false;     // Was this bill created from an appointment?
  isEditMode: boolean = false;        // Are we editing an existing bill?
  isDiscountRequested = false;        // Has discount been requested?

  // -------------------- Billing & Financials --------------------
  totalAmount: number = 0;            // Total amount for the bill
  // DiscountStatus: string = "";        // Current discount status



  // ✅ use inject() — no constructor
  private fb = inject(FormBuilder);
  private opdService = inject(OpdService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private discountService = inject(DiscountService);


  ngOnInit(): void {
    this.initForm();

    this.route.queryParamMap.subscribe((params: any) => {
      this.patientId = params.get('_id') || '';
      this.billId = this.route.snapshot.paramMap.get('id') || '';
      this.isEditMode = !!this.billId;

      if (this.patientId) {
        this.fetchUHID(this.patientId);
      }

      if (this.billId) {
        this.isEditMode = true;
        this.loadBillForEdit(this.billId);
        this.loadDiscount(this.billId);
      }
    });
  }

  fetchUHID(patientId: string): void {
    this.opdService.getOPDcaseById(patientId).subscribe({
      next: (res: any) => {
        this.uhid = res?.uniqueHealthIdentificationId?._id || '';
        this.opdbillForm.patchValue({ uhid: this.uhid });
        console.log('Fetched UHID:', this.uhid);
      },
      error: (err: any) => {
        console.error('Failed to fetch UHID:', err);
      }
    });
  }

  private initForm(): void {
    this.opdbillForm = this.fb.group({
      uhid: [''], // ✅ was this.uhid (empty before fetch)
      Bill_No: [''],
      patient_name: ['', Validators.required],
      age: [''],
      gender: [''],
      caseNo: ['', Validators.required],
      mobile_no: [''],
      paymentmethod: [''],
      amountreceived: [0],
      AmountReceivable: [],
      paidAmount: [0],
      remainder: [0],
      totalAmount: [0],
      remarks: [''],
      discount: [0],
      discountReason: [''],
      services: this.fb.array([]),
      cash: [0],
      upi: [0],
      card: [0],
      transactionId:['']
    });
  }


  get services(): FormArray {
    return this.opdbillForm.get('services') as FormArray;
  }

  private addService(service: any): void {
    this.services.push(this.fb.group({
      _id: [service._id],
      name: [service.name],
      charge: [service.charge],
      type: [service.type]
    }));
  }

  private updateTotal(): void {
    const total = this.services.value.reduce((sum: number, s: any) => sum + (s.charge || 0), 0);
    const paid = this.opdbillForm.value.paidAmount || 0;
    this.opdbillForm.patchValue({
      totalAmount: total,
      remainder: total - paid
    });
    this.totalAmount = total;
  }

  private createOPDBill(payload: any): void {
    this.opdService.postOPDbill(payload).subscribe({
      next: (res: any) => {
        // alert("TEST")
        const caseId = res?.data?.OutpatientcaseId;
        this.showSuccessToast(
          'OPD Bill Created',
          caseId ? `/patientsummary?id=${caseId}` : '/opd/listopbills'
        );
      },
      error: (err: any) => this.showErrorAlert('Creation Failed', err)
    });
  }

  private loadBillForEdit(billId: string): void {
    this.opdService.getOPDbillById(billId).subscribe({
      next: (res: any) => {
        const bill = res?.data;
        if (!bill) return;

        this.opdbillForm.patchValue({
          Bill_No: bill.Bill_No,
          uhid: bill.OutpatientcaseId?.uniqueHealthIdentificationId,
          patient_name: bill.patient_name,
          age: bill.age,
          gender: bill.gender,
          caseNo: bill.caseNo,
          mobile_no: bill.mobile_no,
          paymentmethod: bill.paymentmethod,
          amountreceived: bill.amountreceived,
          paidAmount: bill.paidAmount,
          remainder: bill.remainder,
          totalAmount: bill.totalAmount,
          remarks: bill.remarks
        });

        this.services.clear();
        bill.services?.forEach((s: any) => this.addService(s));
        this.updateTotal();
      },
      error: (err: any) => this.showErrorAlert("Failed to load bill", err)
    });
  }

  private loadDiscount(billId: string): void {
    this.discountService.getDiscountRequestsbyBillId(billId).subscribe({
      next: (res: any) => {
        this.discountService.emitDiscountData(res[0]);
      }
    });
  }

  private showSuccessToast(message: string, redirectUrl?: string): void {
    Swal.fire({
      icon: 'success',
      title: message,
      showConfirmButton: true,
    }).then(() => {
      if (redirectUrl) this.router.navigateByUrl(redirectUrl);
    });
  }

  private showErrorAlert(title: string, error: any): void {
    Swal.fire({
      icon: 'error',
      title,
      text: error?.message || 'Something went wrong!',
      showConfirmButton: true
    });
  }

  private updateOPDBill(billId: string, payload: any): void {
    this.opdService.updateOPDbill(billId, payload).subscribe({
      next: () => {
        this.showSuccessToast('OPD Bill Updated', '/opd/listopbills');
      },
      error: (err: any) => this.showErrorAlert('Update Failed', err)
    });
  }

  /*** UI Actions ***/
  selectPatient(patient: any): void {
    this.opdbillForm.patchValue({
      patient_name: patient.patient_name,
      age: patient.age,
      gender: patient.gender,
      caseNo: patient.uhid,
      mobile_no: patient.mobile_no
    });
    this.services.clear();
    patient.services?.forEach((s: any) => this.addService(s));
    this.updateTotal();
  }

  onSelectedServices(services: any[]): void {
    this.services.clear();
    services.forEach(s => this.addService(s));
    this.updateTotal();
  }

  removeService(index: number): void {
    this.services.removeAt(index);
    this.updateTotal();
  }

  onPaymentChange(amount: number): void {
    alert("called")
    const remainder = this.opdbillForm.value.totalAmount - amount;
    this.opdbillForm.patchValue({ paidAmount: amount, remainder });
  }

  requestDiscount(): void {
    this.isDiscountRequested = true;
  }

  onOPDDropdownChange(selected: any): void {
    // handle OPD dropdown selection
  }

  onSubmit(): void {
    if (this.isEditMode) {
      const payload = {
        services: this.opdbillForm.value.services.map((s: any) => ({
          name: s.name,
          charge: s.charge,
          type: s.type,
          isBilled: true
        })),
        totalamount: this.totalAmount,
        netpay: this.totalAmount,
        paymentmethod: this.opdbillForm.value.paymentmethod,
        amountreceived: this.opdbillForm.value.amountreceived,
        remarks: this.opdbillForm.value.remarks,
        remainder: this.opdbillForm.value.remainder
      };
      this.updateOPDBill(this.billId, payload);
    } else {
      const payload = {
        patientUhid: this.uhid,
        services: this.opdbillForm.value.services.map((s: any) => ({
          name: s.name,
          charge: s.charge,
          type: s.type,
          isBilled: true
        })),
        totalamount: this.totalAmount,
        netpay: this.totalAmount,
        paymentmethod: this.opdbillForm.value.paymentmethod,
        amountreceived: this.opdbillForm.value.amountreceived,
        remarks: this.opdbillForm.value.remarks,
        remainder: this.opdbillForm.value.remainder,
        OutpatientcaseId: this.patientId,
        cash: this.opdbillForm.value.cash,
        upi: this.opdbillForm.value.upi,
        card: this.opdbillForm.value.card
      };
      const billNo = `BILL-${Date.now()}`;
      this.opdbillForm.patchValue({ Bill_No: billNo });
      this.createOPDBill(payload);
    }
  }
}
