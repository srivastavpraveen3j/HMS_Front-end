import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
  FormControl,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { debounceTime, switchMap } from 'rxjs';
import { of } from 'rxjs';
import { UhidService } from '../../../uhid/service/uhid.service';
import { IpdService } from '../../ipdservice/ipd.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { CompanyMasterService } from '../../../mastermodule/companymaster/service/companymaster.service';
import { IndianCurrencyPipe } from '../../../../pipe/indian-currency.pipe';

@Component({
  selector: 'app-ipdbill',
  templateUrl: './ipdbill.component.html',
  styleUrls: ['./ipdbill.component.css'],
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, IndianCurrencyPipe],
})
export class IpdbillComponent implements OnInit {
  ipdForm!: FormGroup;
  searchForm!: FormGroup;
  services: any[] = [];
  doctors: any = [];
  serviceRows: any[] = [];
  manuallySelected = false;
  filteredPatients: any[] = [];
  showSuggestions = false;
  editMode: boolean = false;
  ipdbill: any[] = [];
  service: any[] = [];
  currentPage = 1;
  totalPages = 1;

  // ✅ Enhanced Company-related properties
  isCompanyPatient: boolean = false;
  ipdCaseId: string = '';
  lockedRates: any = null;
  companyInfo: any = null;

  // Other properties
  radiologyServices: any[] = [];
  hasRadiologyServices = false;
  showservice: boolean = false;
  srv: any[] = [];
  selectedGroup: any = null;
  selectedGroupServices: any[] = [];
  filteredGroupServices: any[] = [];
  activeFilter: 'today' | 'dateRange' = 'today';
  dropdownOpen = false;
  uhidTodayRecords: any[] = [];
  userPermissions: any = {};
  showUHIDDropdown: boolean = false;
  selectedPatientDetails: any = null;
  referral: any[] = [];
  limit = 15;

  // ✅ NEW PROPERTIES FOR TIME-BASED BILLING
  showQuantityDialog = false;
  selectedServiceForQuantity: any = null;
  quantityForm!: FormGroup;
  calculatedTotal = 0;

  // Billing type configurations
  billingTypes = [
    { value: 'fixed', label: 'Fixed Charge', icon: '✅', color: '#6c757d', defaultUnit: 'service' },
    { value: 'hourly', label: 'Per Hour', icon: '⏰', color: '#007bff', defaultUnit: 'hour' },
    { value: 'daily', label: 'Per Day', icon: '📅', color: '#28a745', defaultUnit: 'day' },
    { value: 'session', label: 'Per Session', icon: '🔄', color: '#6f42c1', defaultUnit: 'session' },
    { value: 'quantity', label: 'Per Quantity', icon: '📦', color: '#fd7e14', defaultUnit: 'unit' },
  ];

  // ✅ Add Math for template usage
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private uhidService: UhidService,
    private router: Router,
    private route: ActivatedRoute,
    private ipdservice: IpdService,
    private companyService: CompanyMasterService
  ) {
    const now = new Date();
    this.ipdForm = this.fb.group({
      uhid: ['', Validators.required],
      patient_name: ['', Validators.required],
      bed_id: [''],
      admissionDate: ['', Validators.required],
      age: ['', Validators.required],
      patient_type: ['', Validators.required],
      consultingDoctorId: [''],
      refDr: ['SELF'],
      serviceId: this.fb.array([]),
      serviceDr: [''],
      totalServiceChargeAmount: [1, [Validators.required, Validators.min(1)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      totalBillAmount: [0, [Validators.required, Validators.min(0)]],
      totalDepositAmount: [1, [Validators.required, Validators.min(0)]],
      uniqueHealthIdentificationId: [''],
      billingTime: [this.formatTime(now)],
      billingDate: [this.formatDate(now)],
      inpatientCaseId: [''],
    });

    // ✅ NEW: Initialize quantity form
    this.quantityForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      ratePerUnit: [0],
      unitLabel: ['']
    });
  }

  formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  get serviceId(): FormArray {
    return this.ipdForm.get('serviceId') as FormArray;
  }

  get searchTextControl(): FormControl {
    return this.searchForm.get('searchText') as FormControl;
  }

  get f() {
    return this.ipdForm.controls;
  }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      searchText: [''],
    });
    this.loadServices();

    // ✅ NEW: Setup quantity form value changes
    this.quantityForm.get('quantity')?.valueChanges.subscribe(() => {
      this.updateCalculatedTotal();
    });

    // Route handling for patient ID
    this.route.queryParams.subscribe((params) => {
      const patientId = params['id'];
      if (patientId) {
        this.createIPDbillByPatientId(patientId);
      }
    });

    // Search functionality
    this.searchForm
      .get('searchText')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadServices();
      });

    // Load permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'inpatientBilling'
    );
    this.userPermissions = uhidModule?.permissions || {};

    this.loadTodaysUHID();

    // Load doctors
    this.masterService.getDoctors().subscribe((res) => {
      this.doctors = res.data.data;
    });

    // Handle bill editing
    this.route.queryParams.subscribe((params) => {
      const billid = params['_id'];
      this.ipdservice.getipdBillapis().subscribe((res) => {
        this.ipdbill = res?.data?.newBillings;
        if (billid) {
          this.loadBill(billid);
        }
      });
    });

    // ✅ Enhanced Patient name search with company detection
    this.ipdForm
      .get('patient_name')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((name: string) => {
          if (this.manuallySelected) return of({ uhids: [] });
          return name && name.length > 2
            ? this.ipdservice.getIPDCaseByPatientName(name)
            : of({ inpatientCases: [] });
        })
      )
      .subscribe((res: any) => {
        if (this.manuallySelected) return;
        this.filteredPatients = res?.data?.inpatientCases || [];
        this.showSuggestions = this.filteredPatients.length > 0;
      });

    // ✅ Enhanced UHID search with company detection
    this.ipdForm
      .get('uhid')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((name: string) => {
          if (this.manuallySelected) return of({ inpatientCases: [] });
          return name && name.length > 2
            ? this.ipdservice.getIPDCaseByUhid(name)
            : of({ inpatientCases: [] });
        })
      )
      .subscribe((res: any) => {
        if (!this.manuallySelected) {
          this.filteredPatients = res?.data?.inpatientCases || [];
          this.showSuggestions = this.filteredPatients.length > 0;
        }
      });
  }

  // ✅ NEW: Open quantity dialog
  openQuantityDialog(service: any): void {
    this.selectedServiceForQuantity = service;
    this.showQuantityDialog = true;

    // Set form values
    this.quantityForm.patchValue({
      quantity: service.minUnits || 1,
      ratePerUnit: service.ratePerUnit || service.charge,
      unitLabel: service.unitLabel || this.getUnitLabel(service.billingType)
    });

    this.updateCalculatedTotal();
  }

  // ✅ NEW: Close quantity dialog
  closeQuantityDialog(): void {
    this.showQuantityDialog = false;
    this.selectedServiceForQuantity = null;
    this.quantityForm.reset();
    this.calculatedTotal = 0;
  }

  // ✅ NEW: Update calculated total
  updateCalculatedTotal(): void {
    const quantity = this.quantityForm.get('quantity')?.value || 0;
    const ratePerUnit = this.quantityForm.get('ratePerUnit')?.value || 0;
    this.calculatedTotal = quantity * ratePerUnit;
  }

  // ✅ NEW: Get unit label based on billing type
  getUnitLabel(billingType: string): string {
    const config = this.billingTypes.find(bt => bt.value === billingType);
    return config?.defaultUnit || 'unit';
  }

  // ✅ NEW: Get billing type config
  getBillingTypeConfig(billingType: string): any {
    return this.billingTypes.find(bt => bt.value === billingType) || this.billingTypes[0];
  }

  // ✅ ENHANCED: selectService method with time-based billing support
  async selectService(service: any): Promise<void> {
    console.log('🔍 Selecting service:', service);
    console.log('🏥 Company patient status:', this.isCompanyPatient);
    console.log('🏥 IPD Case ID:', this.ipdCaseId);

    // Check if service already exists
    const existingService = this.serviceId.value.find(
      (s: any) => s.name === service.name || s._id === service._id
    );

    if (existingService) {
      this.showNotification('Service already added!', 'warning');
      return;
    }

    // ✅ NEW: Check billing type
    if (service.billingType && service.billingType !== 'fixed') {
      // Show quantity dialog for time-based services
      this.openQuantityDialog(service);
    } else {
      // Add fixed charge service directly
      await this.addFixedChargeService(service);
    }
  }

  // ✅ NEW: Add service with quantity
  async addServiceWithQuantity(): Promise<void> {
    if (this.quantityForm.invalid) {
      this.showNotification('Please enter valid quantity', 'warning');
      return;
    }

    const service = this.selectedServiceForQuantity;
    const formValue = this.quantityForm.value;

    let finalRate = formValue.ratePerUnit;
    let isCompanyRate = false;
    let originalCharge = service.charge;

    // Check for company rates
    if (this.isCompanyPatient && this.ipdCaseId) {
      try {
        const companyRate = await this.getServiceRate(service._id, service.name);
        if (companyRate !== service.charge) {
          finalRate = companyRate;
          isCompanyRate = true;
        }
      } catch (error) {
        console.error('Error getting company rate:', error);
      }
    }

    // Create service object
    const serviceToAdd = {
      _id: service._id,
      name: service.name,
      charge: service.charge,
      originalCharge: originalCharge,
      type: service.type || '',
      groupId: this.selectedGroup?._id || '',
      groupName: this.selectedGroup?.group_name || '',

      // ✅ NEW: Time-based billing fields
      billingType: service.billingType,
      quantity: formValue.quantity,
      ratePerUnit: finalRate,
      unitLabel: formValue.unitLabel,
      totalAmount: formValue.quantity * finalRate,

      isCompanyRate: isCompanyRate,
    };

    console.log('📝 Adding service with quantity:', serviceToAdd);

    // Add to form array
    this.serviceId.push(this.fb.group(serviceToAdd));

    // Check for radiology services
    this.checkForRadiologyServices();

    // Show success message
    const message = `Service added: ${service.name} (${formValue.quantity} ${formValue.unitLabel}) = ₹${serviceToAdd.totalAmount.toFixed(2)}`;
    this.showNotification(message, 'success');

    // Update totals
    this.getTotalCharge();
    this.updateTotalBillAmount();

    // Close dialog
    this.closeQuantityDialog();
  }

  // ✅ ENHANCED: Add fixed charge service (existing logic with totalAmount)
  async addFixedChargeService(service: any): Promise<void> {
    let finalRate = service.charge;
    let isCompanyRate = false;
    let originalCharge = service.charge;

    // Check for company rates
    if (this.isCompanyPatient && this.ipdCaseId) {
      try {
        const companyRate = await this.getServiceRate(service._id, service.name);
        if (companyRate !== service.charge) {
          finalRate = companyRate;
          isCompanyRate = true;
        }
      } catch (error) {
        console.error('Error getting company rate:', error);
      }
    }

    // Create service object
    const serviceToAdd = {
      _id: service._id,
      name: service.name,
      charge: finalRate,
      originalCharge: originalCharge,
      type: service.type || '',
      groupId: this.selectedGroup?._id || '',
      groupName: this.selectedGroup?.group_name || '',

      // ✅ NEW: Fixed charge fields
      billingType: service.billingType || 'fixed',
      quantity: 1,
      ratePerUnit: finalRate,
      unitLabel: service.unitLabel || 'service',
      totalAmount: finalRate,

      isCompanyRate: isCompanyRate,
    };

    console.log('📝 Adding fixed charge service:', serviceToAdd);

    // Add to form array
    this.serviceId.push(this.fb.group(serviceToAdd));

    // Check for radiology services
    this.checkForRadiologyServices();

    // Show success message
    let message = `Service added: ₹${finalRate}`;
    if (isCompanyRate) {
      message = `✅ Service added with company rate: ₹${finalRate} (saved ₹${originalCharge - finalRate})`;
    }
    this.showNotification(message, isCompanyRate ? 'success' : 'info');

    // Update totals
    this.getTotalCharge();
    this.updateTotalBillAmount();
  }

  // ✅ NEW: Edit service quantity
  editServiceQuantity(index: number): void {
    const service = this.serviceId.at(index).value;

    if (service.billingType === 'fixed') {
      this.showNotification('Fixed charge services cannot be edited', 'info');
      return;
    }

    // Open quantity dialog with existing values
    this.selectedServiceForQuantity = {
      ...service,
      _id: service._id,
      name: service.name
    };

    this.showQuantityDialog = true;

    this.quantityForm.patchValue({
      quantity: service.quantity,
      ratePerUnit: service.ratePerUnit,
      unitLabel: service.unitLabel
    });

    this.updateCalculatedTotal();

    // Remove the service temporarily (will be re-added when user confirms)
    this.removeService(index);
  }

  // ✅ ENHANCED: getTotalCharge to use totalAmount
  getTotalCharge(): number {
    return this.serviceId.value.reduce(
      (total: number, service: any) => {
        // Use totalAmount if available, otherwise fallback to charge
        const amount = service.totalAmount !== undefined
          ? service.totalAmount
          : (parseFloat(service.charge) || 0);
        return total + amount;
      },
      0
    );
  }

  // Rest of your existing methods remain the same...
  // (loadCaseRates, resetCompanyData, getServiceRate, etc.)

  // ✅ Enhanced loadCaseRates with better error handling
  async loadCaseRates(caseId: string): Promise<boolean> {
    if (!caseId) return false;

    try {
      console.log(`🔍 Loading company rates for case: ${caseId}`);
      const response = await this.companyService.getCaseLockedRates(caseId, 'IPD').toPromise();

      if (response && response.success && response.data) {
        this.lockedRates = response.data;
        this.isCompanyPatient = true;
        this.companyInfo = response.data.companyId;

        const serviceRatesCount = this.lockedRates?.lockedServiceRates?.length || 0;
        console.log('🏢 Company rates loaded:', {
          company: this.companyInfo?.companyName,
          serviceRatesCount: serviceRatesCount,
          hasRates: serviceRatesCount > 0
        });

        this.showNotification(
          `✅ Company rates loaded: ${this.companyInfo?.companyName} (${serviceRatesCount} services)`,
          'success'
        );

        return true;
      } else {
        console.log('❌ Failed to load company rates:', response);
        this.resetCompanyData();
        return false;
      }
    } catch (error) {
      console.log('❌ Error loading company rates:', error);
      this.resetCompanyData();
      return false;
    }
  }

  // ✅ Enhanced resetCompanyData
  private resetCompanyData(): void {
    this.isCompanyPatient = false;
    this.lockedRates = null;
    this.companyInfo = null;
  }

  // ✅ Enhanced getServiceRate with Dr. Yusuf Khan special handling
  async getServiceRate(serviceId: string, serviceName: string): Promise<number> {
    console.log(`💰 Getting rate for service: ${serviceName} (${serviceId})`);

    // Check locked rates first
    if (this.isCompanyPatient && this.lockedRates && this.lockedRates.lockedServiceRates) {
      const lockedService = this.lockedRates.lockedServiceRates.find(
        (rate: any) => rate.serviceId.toString() === serviceId.toString()
      );

      if (lockedService) {
        console.log(`✅ Found locked rate for ${serviceName}: ₹${lockedService.lockedRate}`);
        return lockedService.lockedRate;
      }
    }

    // Try API call
    if (this.isCompanyPatient && this.ipdCaseId) {
      try {
        const response = await this.companyService.getCaseServiceRate(
          this.ipdCaseId,
          'IPD',
          serviceId
        ).toPromise();

        if (response && response.success && response.data) {
          console.log(`✅ Company rate API returned: ₹${response.data.rate}`);
          return response.data.rate;
        }
      } catch (error) {
        console.error('❌ Error getting case service rate:', error);
      }
    }

    // Fallback to standard rate
    const service = this.srv.find(s => s._id === serviceId);
    const standardRate = service ? service.charge : 0;
    console.log(`📊 Using standard rate for ${serviceName}: ₹${standardRate}`);
    return standardRate;
  }




  // ✅ Helper method to check if service is Dr. Yusuf Khan
  // isDrYusufService(serviceName: string): boolean {
  //   if (!serviceName) return false;
  //   const name = serviceName.toLowerCase();
  //   return name.includes('dr. yusuf khan') ||
  //          name.includes('yusuf khan') ||
  //          name.includes('dr yusuf') ||
  //          name === 'dr. yusuf khan visting charge';
  // }

  // ✅ Enhanced utility methods for template
  getLockedServiceRate(serviceId: string): number {
    if (this.lockedRates && this.lockedRates.lockedServiceRates) {
      const lockedService = this.lockedRates.lockedServiceRates.find(
        (rate: any) => rate.serviceId.toString() === serviceId.toString()
      );
      return lockedService ? lockedService.lockedRate : 0;
    }
    return 0;
  }

  hasCompanyDiscount(serviceId: string): boolean {
    if (!this.isCompanyPatient) return false;
    const lockedRate = this.getLockedServiceRate(serviceId);
    const service = this.srv.find(s => s._id === serviceId);
    const standardRate = service ? service.charge : 0;
    return lockedRate > 0 && lockedRate !== standardRate;
  }

  getSavingsAmount(serviceId: string): number {
    if (!this.isCompanyPatient) return 0;
    const lockedRate = this.getLockedServiceRate(serviceId);
    const service = this.srv.find(s => s._id === serviceId);
    const standardRate = service ? service.charge : 0;
    return standardRate - lockedRate;
  }

  // ✅ Enhanced getTotalSavings method
  getTotalSavings(): number {
    if (!this.isCompanyPatient) return 0;

    return this.serviceId.value.reduce((total: number, service: any) => {
      const savings = (service.originalCharge || 0) - (service.charge || 0);
      return total + savings;
    }, 0);
  }

  // ✅ Enhanced selectPatient with robust company detection
  async selectPatient(patient: any): Promise<void> {
    console.log('🔍 Selecting patient:', patient);
    this.manuallySelected = true;

    const formattedAdmissionDate = patient?.admissionDate
      ? new Date(patient.admissionDate).toISOString().split('T')[0]
      : '';

    this.ipdCaseId = patient?._id || '';
    console.log('🏥 IPD Case ID set to:', this.ipdCaseId);

    // Patch form with patient data
    this.ipdForm.patchValue({
      uhid: patient?.uniqueHealthIdentificationId?.uhid || '',
      patient_name: patient?.uniqueHealthIdentificationId?.patient_name || '',
      age: patient?.uniqueHealthIdentificationId?.age || '',
      gender: patient?.uniqueHealthIdentificationId?.gender || '',
      patientUhidId: patient?.uniqueHealthIdentificationId?._id || '',
      admissionDate: formattedAdmissionDate || '',
      bed_id: patient?.bed_id?.bed_number || '',
      consultingDoctorId: patient?.admittingDoctorId?._id?.toString() || '',
      uniqueHealthIdentificationId: patient?.uniqueHealthIdentificationId?._id,
      patient_type: patient?.patient_type,
      inpatientCaseId: this.ipdCaseId,
    });

    // ✅ Enhanced company detection
    const isCashlessPatient = patient?.patient_type === 'cashless' || patient?.patient_type === 'corporate';
    const hasCompanyInfo = patient?.companyId || patient?.companyName;

    console.log('🔍 Company detection check:', {
      isCashless: isCashlessPatient,
      hasCompanyInfo: !!hasCompanyInfo,
      companyName: patient?.companyName,
      lockedRatesId: patient?.lockedRatesId
    });

    // Load company rates if applicable
    if (isCashlessPatient && this.ipdCaseId) {
      console.log('🏢 Loading company rates for cashless patient');
      const ratesLoaded = await this.loadCaseRates(this.ipdCaseId);

      // Fallback if rates couldn't be loaded but patient has company info
      if (!ratesLoaded && hasCompanyInfo) {
        console.log('⚠️ Company rates not loaded, but patient has company info');
        this.isCompanyPatient = true;
        this.companyInfo = {
          companyName: patient?.companyName || 'Unknown Company',
          companyId: patient?.companyId,
          type: 'Cashless'
        };
        this.showNotification(
          `Company patient detected: ${this.companyInfo.companyName}. Some rates may not be available.`,
          'info'
        );
      }
    } else {
      console.log('📊 Patient is not cashless, using standard rates');
      this.resetCompanyData();
    }

    this.showSuggestions = false;
    this.filteredPatients = [];
  }

  // Rest of your existing methods remain the same...
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  checkForRadiologyServices(): void {
    console.log('🔍 === STARTING RADIOLOGY SERVICE CHECK ===');
    console.log('🔍 FormArray controls count:', this.serviceId.controls.length);
    console.log('🔍 FormArray raw value:', this.serviceId.value);

    // ✅ Access FormArray controls to get all properties
    const selectedServices = this.serviceId.controls.map(control => control.value);

    console.log('🔍 Selected services with all properties:', selectedServices);

    // ✅ Log each service individually for detailed debugging
    selectedServices.forEach((service, index) => {
      console.log(`🔍 Service ${index + 1}:`, {
        name: service.name,
        type: service.type,
        groupName: service.groupName,
        _id: service._id,
        charge: service.charge,
        allProperties: service
      });
    });

    // ✅ Enhanced filtering with comprehensive radiology detection
    this.radiologyServices = selectedServices.filter((service: any) => {
      // Check all possible type variations
      const typeCheck = service.type && (
        service.type.toLowerCase() === 'radiology' ||
        service.type.toLowerCase() === 'imaging' ||
        service.type.toLowerCase() === 'diagnostic' ||
        service.type.toLowerCase().includes('radio')
      );

      // Check group name variations
      const groupCheck = service.groupName && (
        service.groupName.toLowerCase().includes('radiology') ||
        service.groupName.toLowerCase().includes('imaging') ||
        service.groupName.toLowerCase().includes('x-ray') ||
        service.groupName.toLowerCase().includes('scan') ||
        service.groupName.toLowerCase().includes('diagnostic')
      );

      // Check service name variations (most comprehensive)
      const nameCheck = service.name && (
        service.name.toLowerCase().includes('radiology') ||
        service.name.toLowerCase().includes('x-ray') ||
        service.name.toLowerCase().includes('xray') ||
        service.name.toLowerCase().includes('ct scan') ||
        service.name.toLowerCase().includes('ct-scan') ||
        service.name.toLowerCase().includes('mri') ||
        service.name.toLowerCase().includes('ultrasound') ||
        service.name.toLowerCase().includes('ultra sound') ||
        service.name.toLowerCase().includes('scan') ||
        service.name.toLowerCase().includes('echo') ||
        service.name.toLowerCase().includes('mammography') ||
        service.name.toLowerCase().includes('mammogram') ||
        service.name.toLowerCase().includes('sonography') ||
        service.name.toLowerCase().includes('sono') ||
        service.name.toLowerCase().includes('imaging') ||
        service.name.toLowerCase().includes('doppler') ||
        service.name.toLowerCase().includes('pet scan') ||
        service.name.toLowerCase().includes('bone scan') ||
        service.name.toLowerCase().includes('fluoroscopy')
      );

      const isRadiology = typeCheck || groupCheck || nameCheck;

      console.log(`📊 DETAILED Service check - "${service.name}":`, {
        type: service.type,
        groupName: service.groupName,
        typeCheck: typeCheck,
        groupCheck: groupCheck,
        nameCheck: nameCheck,
        FINAL_RESULT: isRadiology
      });

      return isRadiology;
    });

    this.hasRadiologyServices = this.radiologyServices.length > 0;

    console.log('📋 === RADIOLOGY SERVICE CHECK RESULTS ===');
    console.log('📋 Total services checked:', selectedServices.length);
    console.log('📋 Radiology services found:', this.radiologyServices.length);
    console.log('📋 Has radiology services:', this.hasRadiologyServices);

    if (this.hasRadiologyServices) {
      console.log('📋 Radiology services details:', this.radiologyServices.map(s => ({
        name: s.name,
        type: s.type,
        groupName: s.groupName,
        _id: s._id,
        charge: s.charge
      })));

      console.log('✅ Radiology services ready for API payload:',
        this.radiologyServices.map(service => ({
          serviceId: service._id,
          serviceName: service.name,
          charge: service.charge,
          status: 'pending'
        }))
      );
    } else {
      console.log('❌ No radiology services detected');
      console.log('❌ If you expected radiology services, check:');
      console.log('   1. Service names contain radiology keywords');
      console.log('   2. Group names contain radiology keywords');
      console.log('   3. Service types are set correctly');
    }

    console.log('🔍 === END RADIOLOGY SERVICE CHECK ===');
  }

  loadTodaysUHID(): void {
    const today = new Date().toISOString().split('T')[0];
    this.ipdservice.getIPDcase(1, 100, '').subscribe(
      (res) => {
        const allRecords = res.data.inpatientCases || [];
        this.uhidTodayRecords = allRecords.filter((record: any) => {
          const admissionDate = new Date(record.admissionDate)
            .toISOString()
            .split('T')[0];
          return admissionDate === today;
        });
        console.log("Today's IPD records:", this.uhidTodayRecords);
      },
      (err) => {
        console.error("Error loading today's IPD records:", err);
      }
    );
  }

  selectPatientFromUHID(record: any): void {
    this.selectPatient(record);
    this.showUHIDDropdown = false;
  }

  loadBill(billid: string) {
    // Implementation for loading existing bill
    console.log('Loading bill:', billid);
  }

  onPatientInput() {
    const searchTerm = this.ipdForm.get('patient_name')?.value;
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

  onUhidInput() {
    const searchTerm = this.ipdForm.get('uhid')?.value;
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

  showService(group: any) {
    this.srv = group.services;
    this.showservice = true;
    this.selectedGroup = group;
    this.selectedGroupServices = group.services || [];
    this.filteredGroupServices = [...this.selectedGroupServices];

    // Clear search input
    const searchInput = document.querySelector('.service-search') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
  }

  removeService(index: number) {
    this.serviceRows.splice(index, 1);
    this.serviceId.removeAt(index);
    this.checkForRadiologyServices();
    this.updateTotalBillAmount();

    this.showNotification('Service removed', 'info');
  }

  filterGroupServices(event: Event) {
    const input = event.target as HTMLInputElement;
    const text = input?.value?.toLowerCase() || '';
    this.filteredGroupServices = this.selectedGroupServices.filter(
      (service) =>
        service.name.toLowerCase().includes(text) ||
        (service.description && service.description.toLowerCase().includes(text))
    );
  }

  updateTotalBillAmount() {
    const total = this.getTotalCharge();
    this.ipdForm.patchValue({
      totalBillAmount: total,
    });
  }

  trackByGroupId(index: number, group: any): any {
    return group.id || index;
  }

  trackByServiceId(index: number, service: any): any {
    return service.id || index;
  }

  showNotification(message: string, type: 'success' | 'warning' | 'info' | 'error') {
    console.log(`${type.toUpperCase()}: ${message}`);
    // You can implement toast notifications here
  }

  resetForm(): void {
    const now = new Date();
    this.ipdForm.reset({
      billingTime: this.formatTime(now),
      billingDate: this.formatDate(now),
      uhid: '',
      patient_name: '',
      bed_id: '',
      admissionDate: '',
      age: '',
      patient_type: '',
      consultingDoctorId: '',
      refDr: 'SELF',
      serviceDr: '',
      totalServiceChargeAmount: 1,
      quantity: 1,
      totalBillAmount: 0,
      totalDepositAmount: 1,
      uniqueHealthIdentificationId: '',
    });
    (this.ipdForm.get('serviceId') as FormArray).clear();
    this.serviceRows = [];
    this.radiologyServices = [];
    this.hasRadiologyServices = false;
    this.resetCompanyData();
    this.ipdCaseId = '';
    this.manuallySelected = false;
    this.filteredPatients = [];
    this.showSuggestions = false;
  }

  // ✅ Enhanced onSubmit with company information
  async onSubmit() {
    const Swal = (await import('sweetalert2')).default;

    if (this.ipdForm.invalid) {
      this.ipdForm.markAllAsTouched();
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

    const billid = this.route.snapshot.queryParams['_id'];
    const rawForm = this.ipdForm.getRawValue();

    console.log('📋 Submitting bill with services:', rawForm.serviceId);
    console.log('🏢 Company patient status:', this.isCompanyPatient);

    // ✅ CRITICAL: Call checkForRadiologyServices BEFORE creating payload
    this.checkForRadiologyServices();

    // ✅ Wait a moment for checkForRadiologyServices to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('🔍 After check - Has radiology services:', this.hasRadiologyServices);
    console.log('🔍 After check - Radiology services count:', this.radiologyServices.length);

    // ✅ Enhanced payload with time-based billing support
    const payload = {
      ...rawForm,
      serviceId: rawForm.serviceId.map((service: any) => ({
        name: service.name,
        charge: service.charge,
        type: service.type,
        groupName: service.groupName,
        // ✅ NEW: Time-based billing fields
        billingType: service.billingType || 'fixed',
        quantity: service.quantity || 1,
        ratePerUnit: service.ratePerUnit || service.charge,
        unitLabel: service.unitLabel || 'service',
        totalAmount: service.totalAmount || service.charge,
        isCompanyRate: service.isCompanyRate,
        originalCharge: service.originalCharge,
      })),
      // ✅ Add company metadata
      isCompanyPatient: this.isCompanyPatient,
      companyInfo: this.companyInfo,
      totalSavings: this.getTotalSavings()
    };

    if (billid) {
      // Update existing bill
      this.ipdservice.updateipdBillapis(billid, payload).subscribe({
        next: async (res) => {
          const companyMessage = this.isCompanyPatient
            ? ` (${this.companyInfo?.companyName} rates applied)`
            : '';

          Swal.fire({
            icon: 'success',
            title: 'IPD Bill Updated',
            text: `IPD Bill updated successfully.${companyMessage}`,
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

          // ✅ CRITICAL: Properly handle radiology request creation
          console.log('📋 Checking for radiology services after bill update...');
          console.log('📋 Has radiology services:', this.hasRadiologyServices);
          console.log('📋 Radiology services:', this.radiologyServices);

          if (this.hasRadiologyServices && this.radiologyServices.length > 0) {
            console.log('✅ Creating radiology request for updated bill...');
            const radiologyData = { ...payload, billId: billid };
            try {
              await this.createRadiologyRequest(radiologyData);
              console.log('✅ Radiology request creation completed');
            } catch (error) {
              console.error('❌ Error in radiology request creation:', error);
            }
          } else {
            console.log('❌ No radiology services found, skipping radiology request');
          }

          this.resetForm();
        },
        error: (err) => {
          console.error('Error updating bill:', err);
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: 'Failed to update IPD bill. Please try again.',
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
      // Create new bill
      this.ipdservice.postipdBillapis(payload).subscribe({
        next: async (res) => {
          const companyMessage = this.isCompanyPatient
            ? ` (${this.companyInfo?.companyName} rates applied)`
            : '';

          const savingsMessage = this.isCompanyPatient && this.getTotalSavings() > 0
            ? ` | Saved: ₹${this.getTotalSavings().toFixed(2)}`
            : '';

          Swal.fire({
            icon: 'success',
            title: 'IPD Bill Created',
            text: `IPD Bill created successfully.${companyMessage}${savingsMessage}`,
            position: 'top-end',
            toast: true,
            timer: 4000,
            showConfirmButton: false,
            customClass: {
              popup: 'hospital-toast-popup',
              title: 'hospital-toast-title',
              htmlContainer: 'hospital-toast-text',
            },
          });

          // ✅ CRITICAL: Properly handle radiology request creation
          console.log('📋 Checking for radiology services after bill creation...');
          console.log('📋 Has radiology services:', this.hasRadiologyServices);
          console.log('📋 Radiology services:', this.radiologyServices);
          console.log('📋 Bill response:', res);

          if (this.hasRadiologyServices && this.radiologyServices.length > 0) {
            console.log('✅ Creating radiology request for new bill...');
            const radiologyData = { ...payload, billId: res.data?._id };
            console.log('📋 Radiology data being sent:', radiologyData);

            try {
              await this.createRadiologyRequest(radiologyData);
              console.log('✅ Radiology request creation completed');
            } catch (error) {
              console.error('❌ Error in radiology request creation:', error);
            }
          } else {
            console.log('❌ No radiology services found, skipping radiology request');
            console.log('❌ Debug info:', {
              hasRadiologyServices: this.hasRadiologyServices,
              radiologyServicesLength: this.radiologyServices.length,
              allSelectedServices: this.serviceId.value
            });
          }

          this.resetForm();
          if (res.data?.inpatientCaseId) {
            this.router.navigate(['/ipdpatientsummary'], {
              queryParams: { id: res.data?.inpatientCaseId },
            });
          } else {
            this.router.navigate(['/ipd/ipdbilllist']);
          }
        },
        error: (err) => {
          console.error('Error creating IPD Bill:', err);
          Swal.fire({
            icon: 'error',
            title: 'Creation Failed',
            text: 'Failed to create IPD bill. Please try again.',
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

  async createRadiologyRequest(billingData: any): Promise<void> {
    console.log('🚀 === CREATING RADIOLOGY REQUEST ===');
    console.log('🚀 Has radiology services:', this.hasRadiologyServices);
    console.log('🚀 Radiology services count:', this.radiologyServices.length);
    console.log('🚀 Radiology services data:', this.radiologyServices);

    if (!this.hasRadiologyServices || this.radiologyServices.length === 0) {
      console.log('❌ No radiology services to process - exiting');
      return;
    }

    try {
      const Swal = (await import('sweetalert2')).default;

      // ✅ Enhanced requested services mapping with validation
      const requestedServices = this.radiologyServices.map((service) => {
        const mappedService = {
          serviceId: service._id,
          serviceName: service.name,
          charge: parseFloat(service.charge) || 0,
          status: 'pending',
        };

        console.log('📋 Mapping service for API:', {
          original: service,
          mapped: mappedService
        });

        return mappedService;
      });

      console.log('📋 Final requested services for API:', requestedServices);

      // Prepare radiology request payload
      const radiologyRequestPayload = {
        // Patient information
        patientUhid: billingData.uniqueHealthIdentificationId,
        patientName: billingData.patient_name,
        age: billingData.age,

        // IPD specific information
        sourceType: 'ipd',
        ipdBillId: billingData.billId,
        inpatientCaseId: billingData.inpatientCaseId,
        bedNumber: billingData.bed_id,

        // Request details
        consultingDoctor: billingData.consultingDoctorId,
        clinicalHistory: 'As per IPD billing request',
        clinicalIndication: 'Radiology services requested via IPD billing',
        urgency: 'routine',
        requestTime: billingData.billingTime,

        // ✅ Use the validated requested services
        requestedServices: requestedServices,

        // Calculate total amount for radiology services
        totalAmount: requestedServices.reduce((total, service) => {
          return total + (service.charge || 0);
        }, 0),

        createdBy: billingData.consultingDoctorId,
      };

      console.log('📋 Complete radiology request payload:', radiologyRequestPayload);

      // ✅ Final validation before API call
      if (!radiologyRequestPayload.requestedServices || radiologyRequestPayload.requestedServices.length === 0) {
        console.error('❌ CRITICAL: No requested services in payload!');
        throw new Error('No radiology services in request payload');
      }

      // Call the radiology request API
      this.ipdservice.posttradiologyreq(radiologyRequestPayload).subscribe({
        next: (response) => {
          console.log('✅ Radiology request created successfully:', response);

          Swal.fire({
            icon: 'success',
            title: 'Radiology Request Created',
            text: `Radiology request ${response.data?.requestNumber} has been created for ${requestedServices.length} service(s).`,
            position: 'top-end',
            toast: true,
            timer: 3000,
            showConfirmButton: false,
          });
        },
        error: (error) => {
          console.error('❌ Error creating radiology request:', error);

          Swal.fire({
            icon: 'warning',
            title: 'Radiology Request Failed',
            text: 'IPD bill was created successfully, but radiology request failed. Please create it manually.',
          });
        },
      });
    } catch (error) {
      console.error('❌ Error in createRadiologyRequest:', error);
    }
  }

  loadServices() {
    const search = this.searchForm.get('searchText')?.value || '';
    this.masterService
      .getServiceGroup(this.currentPage, this.limit, search, 'ipd')
      .subscribe((res) => {
        this.services = res.data || res.groups;
        this.totalPages = res.totalPages;
        this.currentPage = res.page || this.currentPage;
        console.log('✅ IPD Services loaded:', this.services?.length);
      });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadServices();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadServices();
    }
  }

  // ✅ Enhanced createIPDbillByPatientId
  async createIPDbillByPatientId(patientId: string): Promise<void> {
    this.ipdservice.getIPDcaseById(patientId).subscribe({
      next: async (ipdcase: any) => {
        console.log('🚀 IPD case loaded for billing:', ipdcase);

        const patient = ipdcase.data;
        const uhidId = ipdcase.data.uniqueHealthIdentificationId._id;
        this.ipdCaseId = patient?._id || '';

        this.uhidService.getUhidById(uhidId).subscribe({
          next: async (uhid: any) => {
            // Patch form with patient data
            this.ipdForm.patchValue({
              patient_name: uhid.patient_name || '',
              uniqueHealthIdentificationId: uhid,
              uhid: uhid?.uhid || '',
              age: uhid.age || '',
              gender: uhid.gender || '',
              patientUhidId: patient?.uniqueHealthIdentificationId?._id || '',
              patient_type: patient?.patient_type || '',
              admissionDate: patient?.admissionDate
                ? patient.admissionDate.split('T')[0]
                : '',
              bed_id: patient?.bed_id?.bed_number || '',
              consultingDoctorId: patient?.admittingDoctorId?._id?.toString() || '',
              inpatientCaseId: this.ipdCaseId,
            });

            // ✅ Load company rates if cashless patient
            if (patient?.patient_type === 'cashless' && this.ipdCaseId) {
              console.log('🏢 Loading company rates for direct patient selection');
              await this.loadCaseRates(this.ipdCaseId);
            } else {
              console.log('📊 Patient is not cashless, using standard rates');
              this.resetCompanyData();
            }

            this.manuallySelected = true;
          },
          error: (err) => {
            console.error('Error fetching UHID for billing:', err);
          },
        });
      },
      error: (err) => {
        console.error('Error fetching IPD case for billing:', err);
      },
    });
  }
}
