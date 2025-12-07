import { MasterService } from './../../masterservice/master.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CompanyMasterService } from '../service/companymaster.service';
import { CommonModule } from '@angular/common';
import { BedwardroomService } from '../../bedmanagement/bedservice/bedwardroom.service';
import { forkJoin } from 'rxjs';
import * as XLSX from 'xlsx';
import { SurgerypackagemasterService } from '../../surgerymaster/operation/surgerypackagemaster/service/surgerypackagemaster.service';

// ✅ FIXED: Add proper interface for import results
interface ImportResult {
  companyInfo: any;
  serviceRates: any[];
  bedTypeRates: any[];
  roomTypeRates: any[];
  surgeryPackageRates: any[];
  surgeryRoomPackageRates: any[];
  surgeryPackages: any[];
  companySurgeryPackageRates: any[];
  companyRoomTypePkgRates: any[];
  summary: {
    totalServices: number;
    totalBedTypes: number;
    totalRoomTypes: number;
    validServices: number;
    validBedTypes: number;
    validRoomTypes: number;
    totalSurgeryPackages: number;
    validSurgeryPackages: number;
  };
}

@Component({
  selector: 'app-companymaster',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './companymaster.component.html',
  styleUrl: './companymaster.component.css',
})
export class CompanymasterComponent implements OnInit {
  showMoreService = 3;
  showMoreBed = 3;
  showMoreRoom = 3;
  showMoreSurgery = 3;
  surgeryPackages: any[] = [];
  companyForm!: FormGroup;
  services: any[] = [];
  bedTypes: any[] = [];
  roomTypes: any[] = [];
  companies: any[] = [];
  isEditMode = false;
  selectedCompanyId: string = '';
  isExporting = false;
  isLoading = false;
  formInitialized = false;
  masterDataReady = false; // async gating

  showViewModal = false;
  selectedCompanyForView: any = null;
  companyRatesData: any = null;
  loadingCompanyData = false;

  isImporting = false;
  importResults: ImportResult | null = null;
  showImportModal = false;
  canApplyImport = false;

  companyTypes = ['Cashless', 'Credit', 'Corporate', 'Cash'];
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  companySurgeryPackageRates: any[] = [];
  companyRoomTypePkgRates: any[] = [];
  constructor(
    private fb: FormBuilder,
    private companyService: CompanyMasterService,
    private MasterService: MasterService,
    private bedwardroomservice: BedwardroomService,
    private surgeryPackageService: SurgerypackagemasterService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.fetchAllMasterData();
  }

  fetchAllMasterData(): void {
    this.isLoading = true;
    this.masterDataReady = false;

    forkJoin({
      services: this.MasterService.getServics(),
      bedTypes: this.bedwardroomservice.getbedtyp(),
      roomTypes: this.bedwardroomservice.getroomTyp(),
      companies: this.companyService.getAllCompanies(),
    }).subscribe({
      next: (results) => {
        this.services =
          results.services?.services || results.services?.data || [];
        this.bedTypes =
          results.bedTypes?.data?.bedTypes || results.bedTypes?.bedTypes || [];
        this.roomTypes =
          results.roomTypes?.roomTypes || results.roomTypes?.data || [];
        this.companies = results.companies?.data || []; // Now fetch surgery packages, then set init and ready

        this.surgeryPackageService
          .getsurgerypackagemasters(1, 10000)
          .subscribe((res) => {
            this.surgeryPackages = res.packages || res.data || [];
            this.initializeAllFormArrays();
            this.isLoading = false;
            this.formInitialized = true;
            this.masterDataReady = true;
          });
      },
      error: (error) => {
        console.error('❌ Error loading master data:', error);
        this.isLoading = false;
      },
    });
  }
  initializeForm(): void {
    this.companyForm = this.fb.group({
      type: ['', Validators.required],
      companyName: ['', Validators.required],
      companyShortName: ['', Validators.required],
      tpaName: [''],
      address: [''],
      city: [''],
      phone: [''],
      isActive: [true],
      isDefaultHospitalName: [false],
      doNotCalculateIPDServiceCharges: [false],
      cashlessFormDownloadLink: [''],
      takeRateOfCompany: [''],
      serviceRates: this.fb.array([]),
      bedTypeRates: this.fb.array([]),
      roomTypeRates: this.fb.array([]),
      surgeryPackageRates: this.fb.array([]),
    });
  }

  get serviceRatesArray(): FormArray {
    return this.companyForm.get('serviceRates') as FormArray;
  }
  get bedTypeRatesArray(): FormArray {
    return this.companyForm.get('bedTypeRates') as FormArray;
  }
  get roomTypeRatesArray(): FormArray {
    return this.companyForm.get('roomTypeRates') as FormArray;
  }
  get surgeryPackageRatesArray(): FormArray {
    return this.companyForm.get('surgeryPackageRates') as FormArray;
  }

  initializeAllFormArrays(): void {
    this.clearAllFormArrays();
    this.initializeServiceRates();
    this.initializeBedTypeRates();
    this.initializeRoomTypeRates();
    this.initializeSurgeryRates();
  }

  clearAllFormArrays(): void {
    this.serviceRatesArray.clear();
    this.bedTypeRatesArray.clear();
    this.roomTypeRatesArray.clear();
  }

  initializeServiceRates(): void {
    this.services.forEach((service, index) => {
      const serviceGroup = this.fb.group({
        serviceId: [service._id],
        serviceName: [service.name || `Service ${index + 1}`],
        originalRate: [service.charge || 0],
        customRate: [
          service.charge || 0,
          [Validators.required, Validators.min(0)],
        ],
        effectiveDate: [new Date()],
      });
      this.serviceRatesArray.push(serviceGroup);
    });
  }

  initializeBedTypeRates(): void {
    this.bedTypes.forEach((bedType, index) => {
      const bedTypeGroup = this.fb.group({
        bedTypeId: [bedType._id],
        bedTypeName: [bedType.name || `Bed Type ${index + 1}`],
        originalRate: [bedType.price_per_day || 0],
        customRate: [
          bedType.price_per_day || 0,
          [Validators.required, Validators.min(0)],
        ],
        effectiveDate: [new Date()],
      });
      this.bedTypeRatesArray.push(bedTypeGroup);
    });
  }

  initializeRoomTypeRates(): void {
    this.roomTypes.forEach((roomType, index) => {
      const roomTypeGroup = this.fb.group({
        roomTypeId: [roomType._id],
        roomTypeName: [roomType.name || `Room Type ${index + 1}`],
        originalRate: [roomType.price_per_day || 0],
        customRate: [
          roomType.price_per_day || 0,
          [Validators.required, Validators.min(0)],
        ],
        effectiveDate: [new Date()],
      });
      this.roomTypeRatesArray.push(roomTypeGroup);
    });
  }

  initializeSurgeryRates(): void {
    this.surgeryPackageRatesArray.clear();
    for (const pkg of this.surgeryPackages) {
      this.surgeryPackageRatesArray.push(
        this.fb.group({
          surgeryPackageId: [pkg._id, Validators.required],
          customRate: [
            pkg.totalPrice || 0,
            [Validators.required, Validators.min(0)],
          ],
          effectiveDate: [new Date()],
        })
      );
    }
  } // ------------------- EXPORT EXCEL --------------------

  exportToExcel(): void {
    if (
      !this.formInitialized ||
      this.isLoading ||
      !this.masterDataReady ||
      !this.services.length ||
      !this.bedTypes.length ||
      !this.roomTypes.length ||
      !this.surgeryPackages.length
    ) {
      alert('Data not ready for export! Wait until all records visibly load.');
      return;
    }
    this.isExporting = true;
    try {
      const workbook = XLSX.utils.book_new();
      const servicesData = this.prepareSimplifiedServicesData();
      const bedTypesData = this.prepareSimplifiedBedTypesData();
      const roomTypesData = this.prepareSimplifiedRoomTypesData();
      const surgeryPackagesData = this.prepareSimplifiedSurgeryPackagesData();

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(servicesData),
        'Services'
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(bedTypesData),
        'Bed Types'
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(roomTypesData),
        'Room Types'
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(surgeryPackagesData),
        'Surgery Packages'
      );

      const currentDate = new Date();
      const dateString = currentDate.toISOString().split('T')[0];
      const fileName = `Master_Rates_Template_${dateString}.xlsx`;

      XLSX.writeFile(workbook, fileName);
      alert(`✅ Excel template exported successfully as ${fileName}`);
    } catch (error: any) {
      alert('❌ Error exporting Excel file: ' + (error.message || error));
    } finally {
      this.isExporting = false;
    }
  }

  prepareSimplifiedServicesData(): any[] {
    return this.services.map((service, index) => ({
      'S.No': index + 1,
      'Service Name': service.name || '',
      'Service Type': service.type || '',
      'Charge (₹)': service.charge || 0,
      'Custom Price (₹)': '',
    }));
  }
  prepareSimplifiedBedTypesData(): any[] {
    return this.bedTypes.map((bedType, index) => ({
      'S.No': index + 1,
      'Bed Type Name': bedType.name || '',
      'Price Per Day (₹)': bedType.price_per_day || 0,
      'Custom Price (₹)': '',
    }));
  }
  prepareSimplifiedRoomTypesData(): any[] {
    return this.roomTypes.map((roomType, index) => ({
      'S.No': index + 1,
      'Room Type Name': roomType.name || '',
      'Price Per Day (₹)': roomType.price_per_day || 0,
      'Custom Price (₹)': '',
    }));
  }
  prepareSimplifiedSurgeryPackagesData(): any[] {
    const rows: any[] = [];
    for (const pkg of this.surgeryPackages) {
      // Master/package-level row
      rows.push({
        'Package ID': pkg._id,
        'Package Name': pkg.name,
        'Package Type': pkg.type || '',
        'Default Package Rate': pkg.totalPrice,
        'Company Custom Rate': '', // <----- ADD THIS COLUMN
        'Room Type': '',
        'Room Default Rate': '',
      });
      // Room-wise rows
      if (pkg.roomWiseBreakdown && Array.isArray(pkg.roomWiseBreakdown)) {
        for (const roomBr of pkg.roomWiseBreakdown) {
          rows.push({
            'Package ID': pkg._id,
            'Package Name': pkg.name,
            'Package Type': pkg.type || '',
            'Default Package Rate': '',
            'Company Custom Rate': '', // <----- ADD THIS COLUMN (KEEP EMPTY FOR ROOMS)
            'Room Type': roomBr.roomName,
            'Room Default Rate': roomBr.packagePrice,
            'Company Room Custom Rate': '', // <----- ADD THIS COLUMN
          });
        }
      }
    }
    return rows;
  }

  // ------------------------------------------- // ---------- PATCH + EDIT + CRUD ------------ // -------------------------------------------

  editCompany(company: any): void {
    this.isEditMode = true;
    this.selectedCompanyId = company._id;
    this.companyForm.patchValue({
      type: company.type,
      companyName: company.companyName,
      companyShortName: company.companyShortName,
      tpaName: company.tpaName,
      address: company.address,
      city: company.city,
      phone: company.phone,
      isActive: company.isActive,
    });

    // Services / beds / rooms patch (your existing helpers are fine)

    // Patch package and room-wise custom rates:
    this.companySurgeryPackageRates = [];
    this.companyRoomTypePkgRates = [];
    if (company.surgeryPackageRates && company.surgeryPackageRates.length > 0) {
      this.surgeryPackageRatesArray.clear();
      company.surgeryPackageRates.forEach((rate: any) => {
        this.surgeryPackageRatesArray.push(
          this.fb.group({
            surgeryPackageId: [
              rate.surgeryPackageId._id || rate.surgeryPackageId,
              Validators.required,
            ],
            customRate: [rate.customRate, Validators.required],
            effectiveDate: [rate.effectiveDate],
          })
        );

        this.companySurgeryPackageRates.push({
          surgeryPackageId: rate.surgeryPackageId._id || rate.surgeryPackageId,
          customRate: rate.customRate,
          effectiveDate: rate.effectiveDate,
        });

        // Patch any room breakdown to our array
        if (rate.roomCustomRates && Array.isArray(rate.roomCustomRates)) {
          for (const rc of rate.roomCustomRates) {
            this.companyRoomTypePkgRates.push({
              surgeryPackageId:
                rate.surgeryPackageId._id || rate.surgeryPackageId,
              roomTypeId: rc.roomTypeId._id || rc.roomTypeId,
              customRate: rc.customRate,
            });
          }
        }
      });
    }
  }

  patchServiceRates(serviceRates: any[]): void {
    serviceRates.forEach((rate) => {
      const index = this.serviceRatesArray.controls.findIndex(
        (control) => control.get('serviceId')?.value === rate.serviceId
      );
      if (index >= 0) {
        this.serviceRatesArray.at(index).patchValue({
          customRate: rate.customRate,
          effectiveDate: rate.effectiveDate,
        });
      }
    });
  }

  patchBedTypeRates(bedTypeRates: any[]): void {
    bedTypeRates.forEach((rate) => {
      const index = this.bedTypeRatesArray.controls.findIndex(
        (control) => control.get('bedTypeId')?.value === rate.bedTypeId
      );
      if (index >= 0) {
        this.bedTypeRatesArray.at(index).patchValue({
          customRate: rate.customRate,
          effectiveDate: rate.effectiveDate,
        });
      }
    });
  }

  patchRoomTypeRates(roomTypeRates: any[]): void {
    roomTypeRates.forEach((rate) => {
      const index = this.roomTypeRatesArray.controls.findIndex(
        (control) => control.get('roomTypeId')?.value === rate.roomTypeId
      );
      if (index >= 0) {
        this.roomTypeRatesArray.at(index).patchValue({
          customRate: rate.customRate,
          effectiveDate: rate.effectiveDate,
        });
      }
    });
  }

onSubmit(): void {
  if (this.companyForm.valid) {
    // Pull valid package rates from Angular FormArray
    const formData = this.companyForm.value;
    // Usually, formData.surgeryPackageRates is the FormArray "value".

    // Filter room rates for only valid ones!
    formData.surgeryRoomPackageRates = (this.companyRoomTypePkgRates || [])
      .filter(r => r.customRate !== '' && r.customRate !== null && r.customRate !== undefined && !isNaN(Number(r.customRate)));

    // Likewise, optionally filter package rates for blanks (rare but robust)
    formData.surgeryPackageRates = (formData.surgeryPackageRates || [])
      .filter((r: any) => r.customRate !== '' && r.customRate !== null && r.customRate !== undefined && !isNaN(Number(r.customRate)));

    if (this.isEditMode) {
      this.companyService.updateCompanyRates(this.selectedCompanyId, formData).subscribe({
        next: () => { this.loadCompanies(); this.resetForm(); },
        error: () => { alert('❌ Error updating company'); }
      });
    } else {
      this.companyService.createCompany(formData).subscribe({
        next: () => { this.loadCompanies(); this.resetForm(); },
        error: () => { alert('❌ Error creating company'); }
      });
    }
  } else {
    alert('❌ Form is invalid.');
  }
}


  loadCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (data: any) => {
        this.companies = data.data || [];
      },
      error: (error) => {
        alert('❌ Error loading companies.');
      },
    });
  }

  resetForm(): void {
    this.isEditMode = false;
    this.selectedCompanyId = '';
    this.companyForm.reset();
    this.clearAllFormArrays();
    this.initializeAllFormArrays();
    this.companyForm.patchValue({
      type: '',
      companyName: '',
      companyShortName: '',
      isActive: true,
    });
  }

  addSurgeryPackageRate() {
    this.surgeryPackageRatesArray.push(
      this.fb.group({
        surgeryPackageId: ['', Validators.required],
        customRate: [0, Validators.required],
        effectiveDate: [new Date()],
      })
    );
  }

  removeSurgeryPackageRate(i: number) {
    this.surgeryPackageRatesArray.removeAt(i);
  } // ------------------------------------------- // --------- IMPORT/EXCEL LOGIC -------------- // -------------------------------------------

  triggerFileUpload(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.files && target.files.length > 0) {
      const file = target.files[0];
      this.importFromExcel(file, event);
    }
  }

  importFromExcel(file: File, event: Event): void {
    this.isImporting = true;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const importedData = this.parseExcelData(workbook);
        if (importedData) {
          this.showImportPreview(importedData);
        } else {
          this.showImportError('Invalid Excel file format');
        }
      } catch (error) {
        this.showImportError(error);
      } finally {
        this.isImporting = false;
        const fileInput = event.target as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    };
    reader.onerror = (error) => {
      this.showImportError('Error reading file');
      this.isImporting = false;
    };
    reader.readAsBinaryString(file);
  }

  parseExcelData(workbook: XLSX.WorkBook): ImportResult | null {
    try {
      const result: ImportResult = {
        companyInfo: null,
        serviceRates: [],
        bedTypeRates: [],
        roomTypeRates: [],
        surgeryPackageRates: [],
        surgeryRoomPackageRates: [],
        surgeryPackages: [],
        companySurgeryPackageRates: [],
        companyRoomTypePkgRates: [],
        summary: {
          totalServices: 0,
          totalBedTypes: 0,
          totalRoomTypes: 0,
          validServices: 0,
          validBedTypes: 0,
          validRoomTypes: 0,
          totalSurgeryPackages: 0,
          validSurgeryPackages: 0,
        },
      }; // Parse services, bed types, room types, surgery packages

      if (workbook.SheetNames.includes('Services')) {
        const sheet = workbook.Sheets['Services'];
        const data = XLSX.utils.sheet_to_json(sheet);
        result.serviceRates = this.parseServiceRates(data);
        result.summary.totalServices = data.length;
        result.summary.validServices = result.serviceRates.length;
      }
      if (workbook.SheetNames.includes('Bed Types')) {
        const sheet = workbook.Sheets['Bed Types'];
        const data = XLSX.utils.sheet_to_json(sheet);
        result.bedTypeRates = this.parseBedTypeRates(data);
        result.summary.totalBedTypes = data.length;
        result.summary.validBedTypes = result.bedTypeRates.length;
      }
      if (workbook.SheetNames.includes('Room Types')) {
        const sheet = workbook.Sheets['Room Types'];
        const data = XLSX.utils.sheet_to_json(sheet);
        result.roomTypeRates = this.parseRoomTypeRates(data);
        result.summary.totalRoomTypes = data.length;
        result.summary.validRoomTypes = result.roomTypeRates.length;
      }
      if (workbook.SheetNames.includes('Surgery Packages')) {
        const sheet = workbook.Sheets['Surgery Packages'];
        const data = XLSX.utils.sheet_to_json(sheet);
        result.surgeryPackageRates = this.parseSurgeryPackageRates(data);
        result.surgeryRoomPackageRates =
          this.parseSurgeryRoomPackageRates(data);
        result.summary.totalSurgeryPackages = data.length;
        result.summary.validSurgeryPackages =
          result.surgeryPackageRates.length +
          result.surgeryRoomPackageRates.length;
      }
      return result;
    } catch (error) {
      return null;
    }
  }

  parseServiceRates(data: any[]): any[] {
    const validRates: any[] = [];
    data.forEach((row: any) => {
      if (
        row['S.No'] &&
        row['Custom Price (₹)'] &&
        row['Custom Price (₹)'] !== ''
      ) {
        const serviceName = row['Service Name'];
        const customPrice = parseFloat(row['Custom Price (₹)']);
        const matchingService = this.services.find(
          (service) => service.name === serviceName
        );
        if (matchingService && !isNaN(customPrice) && customPrice >= 0) {
          validRates.push({
            serviceId: matchingService._id,
            serviceName: serviceName,
            originalRate: matchingService.charge || 0,
            customRate: customPrice,
            effectiveDate: new Date(),
          });
        }
      }
    });
    return validRates;
  }

  parseBedTypeRates(data: any[]): any[] {
    const validRates: any[] = [];
    data.forEach((row: any) => {
      if (
        row['S.No'] &&
        row['Custom Price (₹)'] &&
        row['Custom Price (₹)'] !== ''
      ) {
        const bedTypeName = row['Bed Type Name'];
        const customPrice = parseFloat(row['Custom Price (₹)']);
        const matchingBedType = this.bedTypes.find(
          (bedType) => bedType.name === bedTypeName
        );
        if (matchingBedType && !isNaN(customPrice) && customPrice >= 0) {
          validRates.push({
            bedTypeId: matchingBedType._id,
            bedTypeName: bedTypeName,
            originalRate: matchingBedType.price_per_day || 0,
            customRate: customPrice,
            effectiveDate: new Date(),
          });
        }
      }
    });
    return validRates;
  }

  parseRoomTypeRates(data: any[]): any[] {
    const validRates: any[] = [];
    data.forEach((row: any) => {
      if (
        row['S.No'] &&
        row['Custom Price (₹)'] &&
        row['Custom Price (₹)'] !== ''
      ) {
        const roomTypeName = row['Room Type Name'];
        const customPrice = parseFloat(row['Custom Price (₹)']);
        const matchingRoomType = this.roomTypes.find(
          (roomType) => roomType.name === roomTypeName
        );
        if (matchingRoomType && !isNaN(customPrice) && customPrice >= 0) {
          validRates.push({
            roomTypeId: matchingRoomType._id,
            roomTypeName: roomTypeName,
            originalRate: matchingRoomType.price_per_day || 0,
            customRate: customPrice,
            effectiveDate: new Date(),
          });
        }
      }
    });
    return validRates;
  } // SURGERY PACKAGE IMPORT PARSERS (full header-robust!)

  parseSurgeryPackageRates(data: any[]): any[] {
    const validRates: any[] = [];
    data.forEach((row: any) => {
      const keys = Object.keys(row).reduce((acc, k) => {
        acc[k.trim().toLowerCase()] = k;
        return acc;
      }, {} as Record<string, string>);
      const packageIdField = keys['package id'];
      const roomTypeField = keys['room type'];
      const companyRateField = keys['company custom rate'];
      if (
        packageIdField &&
        companyRateField &&
        (!roomTypeField ||
          !row[roomTypeField] ||
          row[roomTypeField].toString().trim() === '') &&
        typeof row[companyRateField] !== 'undefined' &&
        row[companyRateField] !== ''
      ) {
        const pkg = this.surgeryPackages.find(
          (s) => s._id === String(row[packageIdField]).trim()
        );
        if (pkg && !isNaN(parseFloat(row[companyRateField]))) {
          validRates.push({
            surgeryPackageId: pkg._id,
            packageName: pkg.name,
            packageType: keys['package type'] ? row[keys['package type']] : '',
            originalRate: pkg.totalPrice || 0,
            customRate: parseFloat(row[companyRateField]),
            effectiveDate:
              keys['effective date'] && row[keys['effective date']]
                ? new Date(row[keys['effective date']])
                : new Date(),
          });
        }
      }
    });
    return validRates;
  }

  parseSurgeryRoomPackageRates(data: any[]): any[] {
    const validRates: any[] = [];
    data.forEach((row: any) => {
      const packageIdField = Object.keys(row).find(
        (k) => k.trim().toLowerCase() === 'package id'
      );
      const roomTypeField = Object.keys(row).find(
        (k) => k.trim().toLowerCase() === 'room type'
      );
      const roomRateField = Object.keys(row).find(
        (k) => k.trim().toLowerCase() === 'company room custom rate'
      );
      if (
        packageIdField &&
        roomTypeField &&
        roomRateField &&
        row[packageIdField] &&
        row[roomTypeField] &&
        row[roomRateField] !== undefined &&
        row[roomRateField] !== ''
      ) {
        const pkg = this.surgeryPackages.find(
          (s) => s._id === (row[packageIdField] || '').toString().trim()
        );
        const matchingRoom =
          pkg &&
          pkg.roomWiseBreakdown?.find(
            (r: any) =>
              (r.roomName || '').toString().trim().toLowerCase() ===
              (row[roomTypeField] || '').toString().trim().toLowerCase()
          );
        if (pkg && matchingRoom && !isNaN(parseFloat(row[roomRateField]))) {
          validRates.push({
            surgeryPackageId: pkg._id,
            roomTypeId: matchingRoom.roomTypeId,
            packageName: pkg.name,
            roomTypeName: matchingRoom.roomName,
            originalRate: matchingRoom.packagePrice || 0,
            customRate: parseFloat(row[roomRateField]),
            effectiveDate: row['Effective Date']
              ? new Date(row['Effective Date'])
              : new Date(),
          });
        }
      }
    });
    return validRates;
  }

  // ----------- IMPORT PREVIEW / APPLY / UTILS -----------

  showImportPreview(importedData: ImportResult | null): void {
    if (!importedData || typeof importedData.summary !== 'object') {
      this.showImportError('Invalid or empty import file. No preview to show.');
      this.importResults = null;
      this.canApplyImport = false;
      return;
    }
    this.importResults = importedData;
    this.showImportModal = true;
    this.canApplyImport = true;
  }

  closeImportModal(): void {
    this.showImportModal = false;
    this.importResults = null;
    this.canApplyImport = false;
  }

  applyImportedRates(): void {
    if (!this.importResults || typeof this.importResults.summary !== 'object') {
      this.showImportError(
        'No import results to apply. Please import a valid Excel file.'
      );
      this.canApplyImport = false;
      return;
    }
    this.importResults.serviceRates.forEach((importedRate: any) => {
      const index = this.serviceRatesArray.controls.findIndex(
        (control) => control.get('serviceId')?.value === importedRate.serviceId
      );
      if (index >= 0) {
        this.serviceRatesArray.at(index).patchValue({
          customRate: importedRate.customRate,
          effectiveDate: importedRate.effectiveDate,
        });
      }
    });
    this.importResults.bedTypeRates.forEach((importedRate: any) => {
      const index = this.bedTypeRatesArray.controls.findIndex(
        (control) => control.get('bedTypeId')?.value === importedRate.bedTypeId
      );
      if (index >= 0) {
        this.bedTypeRatesArray.at(index).patchValue({
          customRate: importedRate.customRate,
          effectiveDate: importedRate.effectiveDate,
        });
      }
    });
    this.importResults.roomTypeRates.forEach((importedRate: any) => {
      const index = this.roomTypeRatesArray.controls.findIndex(
        (control) =>
          control.get('roomTypeId')?.value === importedRate.roomTypeId
      );
      if (index >= 0) {
        this.roomTypeRatesArray.at(index).patchValue({
          customRate: importedRate.customRate,
          effectiveDate: importedRate.effectiveDate,
        });
      }
    });

    this.importResults.surgeryPackageRates.forEach((importedRate: any) => {
      let idx = this.surgeryPackageRatesArray.controls.findIndex(
        (control) =>
          control.get('surgeryPackageId')?.value ===
          importedRate.surgeryPackageId
      );
      if (idx === -1) {
        this.surgeryPackageRatesArray.push(
          this.fb.group({
            surgeryPackageId: [
              importedRate.surgeryPackageId,
              Validators.required,
            ],
            customRate: [
              importedRate.customRate,
              [Validators.required, Validators.min(0)],
            ],
            effectiveDate: [importedRate.effectiveDate],
          })
        );
      } else {
        this.surgeryPackageRatesArray.at(idx).patchValue({
          customRate: importedRate.customRate,
          effectiveDate: importedRate.effectiveDate,
        });
      }
      const pkgRate = this.getOrCreateCompanyPkgRate(
        importedRate.surgeryPackageId
      );
      pkgRate.customRate = importedRate.customRate;
      pkgRate.effectiveDate = importedRate.effectiveDate;
    });
    this.importResults.surgeryRoomPackageRates.forEach((importedRate: any) => {
      const roomRate = this.getOrCreateCompanyRoomPkgRate(
        importedRate.surgeryPackageId,
        importedRate.roomTypeId
      );
      roomRate.customRate = importedRate.customRate;
    });

    this.closeImportModal();
    this.canApplyImport = false;
    alert(`✅ Successfully imported rates:
• ${this.importResults.summary.validServices} Service rates
• ${this.importResults.summary.validBedTypes} Bed type rates
• ${this.importResults.summary.validRoomTypes} Room type rates
• ${this.importResults.summary.validSurgeryPackages} Surgery Package rates

Please review and save the form.`);
  }

  getOrCreateCompanyPkgRate(packageId: string): any {
    let found = this.companySurgeryPackageRates.find(
      (r) => r.surgeryPackageId === packageId
    );
    if (!found) {
      found = {
        surgeryPackageId: packageId,
        customRate: null,
        effectiveDate: null,
      };
      this.companySurgeryPackageRates.push(found);
    }
    return found;
  }

  getOrCreateCompanyRoomPkgRate(packageId: string, roomTypeId: string): any {
    let found = this.companyRoomTypePkgRates.find(
      (r) => r.surgeryPackageId === packageId && r.roomTypeId === roomTypeId
    );
    if (!found) {
      found = { surgeryPackageId: packageId, roomTypeId, customRate: null };
      this.companyRoomTypePkgRates.push(found);
    }
    return found;
  }

  showImportError(error: any): void {
    alert(
      `❌ Import Error:\n\n${
        error.message || error
      }\n\nPlease check the Excel file format and try again.`
    );
  }

  // ----------- VIEWING COMPANY DATA (optionally modal/view structure) ------------

  async viewCompanyRates(company: any): Promise<void> {
    this.selectedCompanyForView = company;
    this.showViewModal = true;
    this.loadingCompanyData = true;
    this.companyRatesData = null;
    try {
      const response = await this.companyService
        .getCompanyById(company._id)
        .toPromise();
      if (response && response.success) {
        this.companyRatesData = response.data; // ------ PATCH SURGERY PACKAGE RATES TO POPULATE NAMES ------

        if (this.companyRatesData.surgeryPackageRates) {
          this.companyRatesData.surgeryPackageRates.forEach((pkgRate: any) => {
            // If it's just an ID, patch in master
            if (
              typeof pkgRate.surgeryPackageId === 'string' &&
              this.surgeryPackages
            ) {
              const master = this.surgeryPackages.find(
                (p) => p._id === pkgRate.surgeryPackageId
              );
              if (master) pkgRate.surgeryPackageId = master;
            }
          });
        }
        if (this.companyRatesData.surgeryRoomPackageRates) {
          this.companyRatesData.surgeryRoomPackageRates.forEach(
            (roomPkg: any) => {
              if (
                typeof roomPkg.surgeryPackageId === 'string' &&
                this.surgeryPackages
              ) {
                const master = this.surgeryPackages.find(
                  (p) => p._id === roomPkg.surgeryPackageId
                );
                if (master) roomPkg.surgeryPackageId = master;
              }
            }
          );
        }
      } else {
        this.companyRatesData = company;
      }
    } catch (error) {
      this.companyRatesData = company;
    } finally {
      this.loadingCompanyData = false;
    }
  }

  // -- Helper methods for template if needed --
  resolvePackageName(pkgId: any): string {
    if (pkgId && typeof pkgId === 'object' && pkgId.name) return pkgId.name;
    const found = this.surgeryPackages.find((p) => p._id === pkgId);
    return found ? found.name : '';
  }
  resolvePackageRate(pkgId: any): number {
    if (pkgId && typeof pkgId === 'object' && pkgId.totalPrice)
      return pkgId.totalPrice;
    const found = this.surgeryPackages.find((p) => p._id === pkgId);
    return found ? found.totalPrice : 0;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedCompanyForView = null;
    this.companyRatesData = null;
  }

  // ----------- UI UTILITIES ------------

  getSavings(originalRate: number, customRate: number): number {
    return originalRate - customRate;
  }
  isDiscounted(originalRate: number, customRate: number): boolean {
    return customRate < originalRate;
  }
  isIncreased(originalRate: number, customRate: number): boolean {
    return customRate > originalRate;
  }
  getPackageRate(packageId: string): number | string {
    const pkg = this.surgeryPackages.find((x) => x._id === packageId);
    return pkg ? pkg.totalPrice : '-';
  }
  maxRoomRows(pkg: any): number {
    return (pkg.roomWiseBreakdown ? pkg.roomWiseBreakdown.length : 1) || 1;
  }
} // END OF EXPORT CLASS
