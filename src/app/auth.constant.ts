// permissions.constant.ts

export const MODULES = {
  ALL: 'ALL',
    PLATFORM: 'platform',
    ROLES: 'roles',
    PERMISSIONS: 'permissions',
    USERS: 'user',
    BRANCH: 'branch',
    ROOM: 'room',
    ROOM_TYPE: 'roomType',
    BED: 'bed',
    BED_TYPE: 'bedType',
    WARD_MASTER: 'wardMaster',
    DOCTOR: 'doctor',
    UHID: 'uhid',
    MEDICINE: 'medicine',
    MEDICINE_STOCK: 'medicineStock',
    PACKAGES: 'packages',
    PHARMA_REQUEST_LIST: 'pharmaceuticalRequestList',
    PHARMA_INWARD: 'pharmaceuticalInward',
    PHARMA_BILLING: 'PharmaceuticalBilling',
    MEDICAL_TEST: 'medicalTest',
    TEST_GROUP: 'testGroup',
    TEST_PARAMETER: 'testParameter',
    DIAGNOSIS_SHEET: 'diagnosisSheet',
    VITALS: 'vitals',
    SYMPTOMS: 'symptoms',
    SYMPTOM_GROUP: 'symptomGroup',
    SERVICE_GROUP: 'serviceGroup',
    SERVICE: 'service',
    SURGERY_SERVICE: 'surgeryService',
    OUTPATIENT_DEPOSIT: 'outpatientDeposit',
    OUTPATIENT_BILL: 'outpatientBill',
    OUTPATIENT_RETURN: 'outpatientReturn',
    OUTPATIENT_CASE: 'outpatientCase',
    OUTPATIENT_VISIT_HISTORY: 'outpatientVisitingHistory',
    MEDICO_LEGAL_CASE: 'medicoLegalCase',
    INPATIENT_CASE: 'inpatientCase',
    INPATIENT_BILLING: 'inpatientBilling',
    INPATIENT_DEPOSIT: 'inpatientDeposit',
    INPATIENT_DISCOUNT: 'inpatientDiscount',
    INPATIENT_INTERIM_BILL: 'inpatientIntermBill',

    INPATIENT_ROOM_TRANSFER: 'inpatientRoomTransfer',
    FINAL_BILL: 'finalBill',
    FINAL_BILL_DISCOUNT: 'finalBillDiscount',
    DISCHARGE: 'discharge',
    DISCHARGE_SUMMARY: 'dischargeSummary',
    OPERATION_THEATRE_SHEET: 'oprationTheatresheet',
    OPERATION_THEATRE_NOTES: 'operationTheatreNotes',
    TREATMENT_HISTORY_SHEET: 'treatmentHistorySheet',
    MEDICAL_RECORD_DOCUMENT: 'medicalRecordDocument',
    THIRD_PARTY_ADMIN: 'thirdPartyAdministrator',
    APPOINTMENT: 'appointment',
    DEPARTMENT_REQUEST_LIST: 'departmentRequestList',
    INWARD: 'inward',
    DOCTOR_SHARING: 'sharedPatientCases',
  // Add more as needed
};

export type PermissionSet = {
  create?: 0 | 1;
  view?: 0 | 1;
  update?: 0 | 1;
  delete?: 0 | 1;
};
