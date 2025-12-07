import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
// import Swal from 'sweetalert2';
import { RoleService } from '../../../../views/mastermodule/usermaster/service/role.service';

@Component({
  selector: 'app-permission',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './permission.component.html',
  styleUrl: './permission.component.css',
})
export class PermissionComponent {
  permissionsForm!: FormGroup;

  actions = ['view', 'create', 'edit'];
  // actions = ['view', 'create', 'edit', 'delete'];

 MODULES = {
  ALL: "ALL",
  PLATFORM: "platform",
  ROLES: "roles",
  PERMISSIONS: "permissions",
  USERS: "user",
  BRANCH: "branch",
  ROOM: "room",
  ROOM_TYPE: "roomType",
  BED: "bed",
  BED_TYPE: "bedType",
  WARD_MASTER: "wardMaster",
  DOCTOR: "doctor",
  UHID: "uhid",
  MEDICINE: "medicine",
  MEDICINE_STOCK: "medicineStock",
  PACKAGES: "packages",
  PHARMA_REQUEST_LIST: "pharmaceuticalRequestList",
  IPD_PHARMA_REQUEST_LIST: "ipdpharmaceuticalRequestList",
  IPD_PHARMA_REQUEST_WITHOUT_LIST:"withoutipdpermisisonpharmaceuticalRequestList",
  PHARMA_INWARD: "pharmaceuticalInward",
  PHARMA_BILLING: "PharmaceuticalBilling",
  MEDICAL_TEST: "medicalTest",
  TEST_GROUP: "testGroup",
  TEST_PARAMETER: "testParameter",
  DIAGNOSIS_SHEET: "diagnosisSheet",
  VITALS: "vitals",
  SYMPTOMS: "symptoms",
  SYMPTOM_GROUP: "symptomGroup",
  SERVICE_GROUP: "serviceGroup",
  SERVICE: "service",
  SUBSCRIPTION: "subscription",
  SURGERY_SERVICE: "surgeryService",
  SURGERY_PACKAGE_SERVICE: "surgeryPackageService",
  OUTPATIENT_DEPOSIT: "outpatientDeposit",
  OUTPATIENT_BILL: "outpatientBill",
  OUTPATIENT_RETURN: "outpatientReturn",
  OUTPATIENT_CASE: "outpatientCase",
  OUTPATIENT_VISIT_HISTORY: "outpatientVisitingHistory",
  MEDICO_LEGAL_CASE: "medicoLegalCase",
  INPATIENT_CASE: "inpatientCase",
  INPATIENT_BILLING: "inpatientBilling",
  INPATIENT_DEPOSIT: "inpatientDeposit",
  INPATIENT_DISCOUNT: "inpatientDiscount",
  INPATIENT_INTERIM_BILL: "inpatientIntermBill",
  INPATIENT_ROOM_TRANSFER: "inpatientRoomTransfer",
  FINAL_BILL: "finalBill",
  FINAL_BILL_DISCOUNT: "finalBillDiscount",
  DISCHARGE: "discharge",
  DISCHARGE_SUMMARY: "dischargeSummary",
  OPERATION_THEATRE_SHEET: "oprationTheatresheet",
  OPERATION_CHARGE: "oprationCharge",
  OPERATION_THEATRE_SHEET_ACCOUNTS: "oprationTheatresheetaccounts",
  OPERATION_THEATRE_NOTES: "operationTheatreNotes",
  TREATMENT_HISTORY_SHEET: "treatmentHistorySheet",
  MEDICAL_RECORD_DOCUMENT: "medicalRecordDocument",
  THIRD_PARTY_ADMIN: "thirdPartyAdministrator",
  APPOINTMENT: "appointment",
  APPOINTMENT_RECORD: "appointment_record",
  RADIOLOGY_REQUEST_LIST: "radiologyRequestList",
  DEPARTMENT_REQUEST_LIST: "departmentRequestList",
  INWARD: "inward",
  IPD_INWARD: "ipdinward",
  // TEST_GROUP: "testGroup",
  // TEST_PARAMETER: "testParameter",
  INPATIENT_INTERM_BILL: "inpatientIntermBill",
  MATERIAL_REQUEST_LIST: "materialRequestList",
  MATERIAL_REQ_APPROVAL: "materialRequestApproval",
  PURCHASE_INTEND: "purchaseIntend",
  INVENTORY_ITEM: "inventoryItem",
  REQUEST_FOR_QUOTATION: "requestForQuotation",
  VENDOR: "vendor",
  DISCOUNT: "discountDashboard",
  PURCHASE_ORDER: "purchaseorder",
  DOCTOR_SHARING: "sharedPatientCases",
  REFERRAL_RULE: "referralRule",
  LOGO: "logo",
  THEME: "theme",
  REPORTS: "reports",
  PROCEDURE: "procedure",
  SLOT_MASTER: "slotMaster",
  LETTER_HEAD: "letterheader",
  GOOD_RECEIVE_NOTE: "goodreceivenote",
  INVOICE_VERIFICATION: "invoiceverification",
  HIMS: "hims",
  TREATMENT_SHEET: "treatmentSheet",
  DAILY_PROGRESS_REPORT: "dailyProgressReport",
  VISIT_TYPE_MASTER: "visittypemaster",
  VISIT_MASTER: "visitmaster"
};
  allModules: string[] = Object.values(this.MODULES);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private roleservice: RoleService
  ) {
    this.permissionsForm = this.fb.group({
      permissionName: [''],
      Description: [''],
      moduleName: [''],

      view: [false],
      // viewGlobal: [false],
      create: [false],
      edit: [false],
      delete: [false],
    });
  }

  userPermissions: any = {};

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'permissions'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
  }

  //   savePermissions() {
  //   const raw = this.permissionsForm.value;

  //   const payload = {
  //     name: raw.permissionName,
  //     moduleName: raw.moduleName,
  //     create: raw.create ? 1 : 0,
  //     read: raw.view ? 1 : 0,
  //     update: raw.edit ? 1 : 0,
  //     delete: raw.delete ? 1 : 0
  //   };

  //   console.log('Formatted Payload:', payload);

  //   // TODO: Replace this with your actual API service call
  //   // this.permissionService.createPermission(payload).subscribe(...);

  // }

  async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;

    // this.userform.value
    // console.log("🚀 ~ UsermasterComponent ~ OnSubmit ~ this.userform.value:", this.userform.value)
    if (this.permissionsForm.invalid) {
      console.log(
        '🚀 ~ UsermasterComponent ~ OnSubmit ~ this.userform.invalid:',
        this.permissionsForm.invalid
      );
    } else {
      const raw = this.permissionsForm.value;

      const payload = {
        name: raw.permissionName,
        moduleName: raw.moduleName,
        create: raw.create ? 1 : 0,
        read: raw.view ? 1 : 0,
        update: raw.edit ? 1 : 0,
        delete: raw.delete ? 1 : 0,
      };

      console.log('Formatted Payload:', payload);
      this.roleservice.postPermission(payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Permission Created',
            text: 'New Permission has been generated and saved.',
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

          this.router.navigate(['/setting/permissionlist']);
        },
        error: (err) => {
          console.error('Error creating User:', err);
          Swal.fire({
            icon: 'error',
            title: 'Creation Failed',
            position: 'top-end',
            toast: true,
            timer: 3500,
            text:
              err?.error?.message ||
              'An error occurred while creating the User.',
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
  }
}
