import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  AfterViewInit,
  ViewContainerRef,
  ComponentRef,
  Injector,
} from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  FormArray,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { MasterService } from '../../views/mastermodule/masterservice/master.service';
import { IpdService } from '../../views/ipdmodule/ipdservice/ipd.service';
import { DoctorService } from '../../views/doctormodule/doctorservice/doctor.service';
import { debounceTime, filter, of, switchMap } from 'rxjs';
import { TestService } from '../../viewspatho/testservice/test.service';
import { RoleService } from '../../views/mastermodule/usermaster/service/role.service';

@Component({
  selector: 'app-manageradioinward',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './manageradioinward.component.html',
  styleUrls: ['./manageradioinward.component.css'],
})
export class ManageradioinwardComponent implements OnInit, AfterViewInit {
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('letterheaderContainer', { read: ViewContainerRef })
  letterheaderContainer!: ViewContainerRef;

  // Form and data properties
  radioreq: any[] = [];
  radioinward: FormGroup;
  templateForm: FormGroup;
  manuallySelected = false;
  filteredPatients: any[] = [];
  showSuggestions = false;
  selectedPatient: any = null;
  selectedPatientDetails: any = null;
  selectedPackages: any[] = [];
  filteredRadiologyreq: any[] = [];
  uniqueHealthIdentificationId: string = '';

  // Template and signature related properties
  availableTemplates: any[] = [];
  selectedTemplateId: string = '';
  radiologists: any[] = [];
  similarReports: any[] = [];

  // ✅ Letterhead component reference
  letterheaderRef!: ComponentRef<any>;
  letterheaderHtml: string = '';

  // Signature drawing properties
  isDrawing = false;
  signatureData: string = '';
  private context!: CanvasRenderingContext2D;

  // ✅ Enhanced signature properties
  signatureType: 'draw' | 'upload' | 'select' = 'draw';
  uploadedSignatureFile: File | null = null;
  uploadedSignaturePreview: string = '';
  uploadedFileName: string = '';
  isDragOver: boolean = false;

  // ✅ Signature library properties
  savedSignatures: any[] = [];
  selectedLibrarySignature: any = null;

  // Selection properties
  selectedDepartmentRequestId: string = '';
  selectedRequestId: string = '';
  selectedTestGroupName: string = '';
  selectedTestGroupStatus: string = 'pending';
  selectedTestParameters: any[] = [];
  selectedRadiologyRequest: any = null;
  selectedRequestedServices: any[] = [];

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;

  userPermissions: any = {};

  // ✅ Enhanced user properties
  user: string = '';
  currentUser: any = null;
  loggedUserName: string = '';

  constructor(
    private masterService: MasterService,
    public router: Router,
    private fb: FormBuilder,
    private ipdservice: IpdService,
    private doctorservice: DoctorService,
    private testservice: TestService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private injector: Injector,
    private rolservice: RoleService
  ) {
    this.radioinward = this.fb.group({
      // Basic patient and request info
      uhid: [''],
      admittingDoctorId: [''],
      dueAmount: [0],
      PaymentMode: ['cash'],
      amountReceived: [0],
      total: [0],
      uniqueHealthIdentificationId: [''],
      inpatientDepartmentId: [''],
      patient_name: [''],
      age: [''],
      inwardSerialNumber: ['4654654'],
      status: [''],
      pharmacistUserId: ['6651579e3834d2aaf4a94620'],
      remarks: [''],
      typeOfRequest: ['radiology'],
      testParameters: this.fb.array([]),
      pharmaceuticalRequestId: [''],
      requestedDepartmentId: [''],
      transactionId: [''],
      type: ['inpatientDepartment'],
      requestNumber: [''],
      bedNumber: [''],
      ward: [''],
      sourceType: ['ipd'],

      // ✅ Radiology report fields
      protocol: ['', Validators.required],
      observation: ['', Validators.required],
      impression: ['', Validators.required],
      consultantRadiologist: ['', Validators.required],
      reportedBy: [''],
      reportStatus: ['draft'],
      urgency: ['routine'],
      clinicalHistory: [''],
      clinicalIndication: [''],
      templateUsed: [null],
      referredBy: [''],
      studyDate: [new Date().toISOString().split('T')[0]],
      studyTime: [new Date().toTimeString().slice(0, 5)],
      gender: ['male'],
    });

    // Template form for creating new templates
    this.templateForm = this.fb.group({
      templateName: ['', Validators.required],
      serviceName: ['', Validators.required],
      protocol: [''],
      observation: [''],
      impression: [''],
    });
  }

  ngOnInit(): void {
    this.initializeUser();
    this.initializePermissions();
    this.loadRadiologyRequests();
    this.checkForSelectedRequest();
    this.loadUsers();
    this.loadTemplates();
    this.setupFormSubscriptions();
    this.loadSavedSignatures(); // ✅ Load saved signatures
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeSignatureCanvas();
      this.loadLetterheader();
    }, 100);
  }

  // ✅ Enhanced user initialization
  initializeUser(): void {
    const userStr = localStorage.getItem('authUser');
    if (userStr && userStr !== '[]') {
      try {
        const parsedUser = JSON.parse(userStr);
        this.user = parsedUser._id || '';
        this.currentUser = parsedUser;
        this.loggedUserName = parsedUser.name || 'User';

        console.log('✅ Current logged user:', this.currentUser);

        this.radioinward.patchValue({
          consultantRadiologist: this.user,
          pharmacistUserId: this.user,
          reportedBy: this.user,
        });
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        this.user = '';
        this.currentUser = null;
        this.loggedUserName = 'User';
      }
    } else {
      console.warn('⚠️ No authenticated user found in localStorage');
    }
  }

  // ✅ Load letterheader component dynamically
  async loadLetterheader(): Promise<void> {
    try {
      const { LetterheaderComponent } = await import(
        '../../views/settingsmodule/letterhead/letterheader/letterheader.component'
      );

      this.letterheaderRef = this.letterheaderContainer.createComponent(
        LetterheaderComponent,
        { injector: this.injector }
      );

      setTimeout(() => {
        const letterheaderElement = this.letterheaderRef.location.nativeElement;
        this.letterheaderHtml = letterheaderElement.outerHTML;
        console.log('✅ Letterheader loaded successfully');
      }, 500);
    } catch (error) {
      console.error('❌ Error loading letterheader:', error);
      this.letterheaderHtml =
        '<div class="letterhead-placeholder">Hospital Letterhead</div>';
    }
  }

  // ✅ Load saved signatures from backend
  // loadSavedSignatures(): void {
  //   this.ipdservice.getUserSignatures(this.user).subscribe({
  //     next: (res: any) => {
  //       this.savedSignatures = res.data || [];
  //       console.log('✅ Loaded saved signatures:', this.savedSignatures.length);
  //     },
  //     error: (err: any) => {
  //       console.error('❌ Error loading signatures:', err);
  //       this.savedSignatures = [];
  //     }
  //   });
  // }

  // In your component
  // ✅ Enhanced loadSavedSignatures method with better debugging
loadSavedSignatures(): void {
  console.log('🔍 Loading signatures for user:', this.user);
  console.log('🔍 API endpoint will call:', `signatures/${this.user}`);

  if (!this.user) {
    console.error('❌ No user ID available');
    return;
  }

  this.ipdservice.getUserSignatures(this.user).subscribe({
    next: (res: any) => {
      console.log('✅ Full API response:', res);
      console.log('✅ Response data:', res.data);
      console.log('✅ Response success:', res.success);
      
      if (res.success && res.data) {
        this.savedSignatures = res.data;
        console.log('✅ Loaded saved signatures:', this.savedSignatures.length);
        console.log('✅ Signature details:', this.savedSignatures);
      } else {
        console.warn('⚠️ API returned success but no data');
        this.savedSignatures = [];
      }
    },
    error: (err: any) => {
      console.error('❌ Error loading signatures:', err);
      console.error('❌ Error status:', err.status);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error details:', err.error);
      this.savedSignatures = [];
    },
  });
}


  // In saveNewSignature method
  saveNewSignature(signatureData: any): void {
    console.log('🔍 Saving signature data:', signatureData);

    this.ipdservice.saveUserSignature(signatureData).subscribe({
      next: (res: any) => {
        console.log('✅ Signature saved response:', res);
        this.loadSavedSignatures(); // Reload signatures
        Swal.fire({
          icon: 'success',
          title: 'Signature Saved',
          text: `"${signatureData.name}" has been saved to your signature library.`,
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false,
        });
      },
      error: (err: any) => {
        console.error('❌ Error saving signature:', err);
        console.error('❌ Save error details:', err.error);
        Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: 'Error saving signature. Please try again.',
        });
      },
    });
  }

  // ✅ Check if showing input interface
  isShowingInput(): boolean {
    return (
      this.signatureType === 'draw' ||
      (this.signatureType === 'upload' && !this.signatureData) ||
      (this.signatureType === 'select' && !this.signatureData)
    );
  }

  initializePermissions(): void {
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'inward'
    );
    this.userPermissions = uhidModule?.permissions || {};
  }

  setupFormSubscriptions(): void {
    this.radioinward
      .get('patient_name')
      ?.valueChanges.pipe(
        debounceTime(300),
        filter(() => !this.manuallySelected),
        switchMap((name: string) => {
          return name && name.length > 2
            ? this.doctorservice.getPatientByNamedeptreq(name)
            : of({ res: [] });
        })
      )
      .subscribe((res: any) => {
        console.log('API response:', res);
        this.radioreq = res.data || [];
        this.showSuggestions = this.radioreq.length > 0;
      });

    this.radioinward
      .get('uhid')
      ?.valueChanges.pipe(
        debounceTime(3000),
        switchMap((name: string) => {
          if (this.manuallySelected) return of({ uhids: [] });
          return name && name.length > 2
            ? this.doctorservice.getPatientByUhiddeptreq(name)
            : of({ res: [] });
        })
      )
      .subscribe((res: any) => {
        if (this.manuallySelected) return;
        console.log('API response:', res);
        this.radioreq = res.data || [];
        this.showSuggestions = this.radioreq.length > 0;
      });

    this.radioinward.get('total')?.valueChanges.subscribe(() => {
      this.updateDueAmount();
    });

    this.radioinward.get('amountReceived')?.valueChanges.subscribe(() => {
      this.updateDueAmount();
    });
  }

  initializeSignatureCanvas(): void {
    if (this.signatureCanvas?.nativeElement) {
      try {
        const canvas = this.signatureCanvas.nativeElement;
        this.context = canvas.getContext('2d')!;

        if (this.context) {
          this.context.lineCap = 'round';
          this.context.lineWidth = 2;
          this.context.strokeStyle = '#000';
          this.context.fillStyle = '#ffffff';
          this.context.fillRect(0, 0, canvas.width, canvas.height);
          this.context.fillStyle = '#000000';
          console.log('✅ Signature canvas initialized successfully');
        }
      } catch (error) {
        console.error('❌ Error initializing signature canvas:', error);
      }
    } else {
      console.warn('⚠️ Signature canvas not found');
    }
  }

  loadUsers(): void {
    this.rolservice.getusers(1, 100, '').subscribe({
      next: (res: any) => {
        this.radiologists = res.data?.data || res.data || [];
        console.log(
          '✅ Loaded users for radiologist selection:',
          this.radiologists.length
        );

        if (this.currentUser && this.radiologists.length > 0) {
          const currentUserInList = this.radiologists.find(
            (u) => u._id === this.user
          );
          if (currentUserInList) {
            console.log(
              '✅ Current user found in radiologists list, setting as default'
            );
            this.radioinward.patchValue({
              consultantRadiologist: this.user,
            });
          }
        }
      },
      error: (err) => {
        console.error('❌ Error loading users:', err);
        this.radiologists = [];

        if (this.currentUser) {
          this.radiologists = [this.currentUser];
          console.log('✅ Using current user as fallback radiologist');
        }
      },
    });
  }

  loadTemplates(): void {
    this.ipdservice.getTemplatesByService().subscribe({
      next: (res: any) => {
        this.availableTemplates = res.data || [];
        console.log('✅ Loaded templates:', this.availableTemplates.length);
      },
      error: (err) => {
        console.error('❌ Error loading templates:', err);
        this.availableTemplates = [];
      },
    });
  }

  loadTemplate(): void {
    if (!this.selectedTemplateId) return;

    const template = this.availableTemplates.find(
      (t) => t._id === this.selectedTemplateId
    );
    if (template) {
      this.radioinward.patchValue({
        protocol: template.protocol || '',
        observation: template.observation || '',
        impression: template.impression || '',
        templateUsed: template._id,
      });

      Swal.fire({
        icon: 'success',
        title: 'Template Loaded',
        text: `Template "${template.templateName}" has been loaded successfully.`,
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }

  checkForSelectedRequest(): void {
    const selectedRequest = localStorage.getItem('selectedRadiologyRequest');
    if (selectedRequest) {
      try {
        const requestData = JSON.parse(selectedRequest);
        console.log('Found selected radiology request:', requestData);
        this.populateFormWithRequest(requestData);
        localStorage.removeItem('selectedRadiologyRequest');
      } catch (error) {
        console.error('Error parsing selected radiology request:', error);
      }
    }

    this.route.queryParams.subscribe((params) => {
      if (params['requestId']) {
        console.log('Received query params:', params);
      }
    });
  }

  populateFormWithRequest(requestData: any): void {
    this.manuallySelected = true;

    let patientGender = 'male';
    if (requestData.gender) {
      patientGender = requestData.gender.toLowerCase();
    } else if (requestData.patientGender) {
      patientGender = requestData.patientGender.toLowerCase();
    }

    if (!['male', 'female', 'other'].includes(patientGender)) {
      patientGender = 'male';
    }

    this.radioinward.patchValue({
      patient_name: requestData.patientName,
      uhid: requestData.patientUhid?.uhid || requestData.patientUhid || '',
      age: requestData.age,
      gender: patientGender,
      uniqueHealthIdentificationId:
        requestData.patientUhid?._id || requestData.patientUhid || '',
      inpatientDepartmentId: requestData.inpatientCaseId,
      requestNumber: requestData.requestNumber,
      bedNumber: requestData.bedNumber,
      ward: requestData.ward,
      sourceType: requestData.sourceType,
      total: requestData.totalAmount || 0,
      requestedDepartmentId: requestData._id,
      clinicalHistory: requestData.clinicalHistory || 'As per IPD request',
      clinicalIndication:
        requestData.clinicalIndication || 'Radiology services requested',
      urgency: requestData.urgency || 'routine',
      templateUsed: null,
      consultantRadiologist: this.user,
    });

    this.selectedRadiologyRequest = requestData;
    this.selectedTestGroupName =
      requestData.requestedServices
        ?.map((s: any) => s.serviceName)
        .join(', ') || 'Radiology Services';
    this.selectedRequestedServices = requestData.requestedServices || [];
    this.selectedDepartmentRequestId = requestData._id;
  }

  updateDueAmount() {
    const total = this.radioinward.get('total')?.value || 0;
    const amountReceived = this.radioinward.get('amountReceived')?.value || 0;
    const dueAmount = total - amountReceived;

    this.radioinward
      .get('dueAmount')
      ?.setValue(dueAmount, { emitEvent: false });
  }

  loadRadiologyRequests() {
    this.ipdservice.getradiologyreq().subscribe({
      next: (res: any) => {
        console.log('Radiology requests response:', res);

        const allRequests = res?.data || [];
        const ipdPendingRequests = allRequests.filter(
          (req: any) =>
            req.sourceType === 'ipd' &&
            req.overallStatus?.toLowerCase() === 'pending'
        );

        this.filteredRadiologyreq = ipdPendingRequests.map((req: any) => ({
          ...req,
          displayUhid: req.patientUhid?.uhid || 'N/A',
          displayDate: req.createdAt || req.requestDate,
          serviceNames:
            req.requestedServices?.map((s: any) => s.serviceName).join(', ') ||
            'N/A',
        }));

        this.updatePagination();
        console.log(
          '✅ Filtered IPD Radiology Requests:',
          this.filteredRadiologyreq
        );
      },
      error: (err) => {
        console.error('❌ Failed to load radiology requests:', err);
        this.filteredRadiologyreq = [];
      },
    });
  }

  selectPatient(patient: any): void {
    this.manuallySelected = true;
    this.selectedPatient = patient;
    this.selectedPatientDetails = patient;
    this.showSuggestions = false;

    let patientGender = 'male';
    if (
      patient.gender &&
      ['male', 'female', 'other'].includes(patient.gender.toLowerCase())
    ) {
      patientGender = patient.gender.toLowerCase();
    }

    this.radioinward.patchValue({
      age: patient.age,
      uhid: patient?.patientUhid?.uhid || patient?.uhid,
      patient_name: patient.patient_name || patient.patientName,
      uniqueHealthIdentificationId:
        patient?.patientUhid?._id ||
        patient?.uniqueHealthIdentificationId ||
        patient?._id,
      gender: patientGender,
    });

    this.cdr.detectChanges();
  }

  onPatientInput() {
    const searchTerm = this.radioinward.get('patient_name')?.value;

    if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
      this.manuallySelected = false;
      this.selectedPatientDetails = null;
    }

    if (!searchTerm || searchTerm.length <= 2) {
      this.radioreq = [];
      this.showSuggestions = false;
      return;
    }

    if (this.radioreq.length > 0) {
      this.showSuggestions = true;
    }
  }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  onRowSelect(item: any): void {
    this.manuallySelected = true;
    this.selectedRadiologyRequest = item;

    let itemGender = 'male';
    if (
      item.gender &&
      ['male', 'female', 'other'].includes(item.gender.toLowerCase())
    ) {
      itemGender = item.gender.toLowerCase();
    }

    this.radioinward.patchValue({
      age: item.age,
      uhid: item?.patientUhid?.uhid,
      patient_name: item.patientName,
      gender: itemGender,
      uniqueHealthIdentificationId: item.patientUhid?._id || '',
      inpatientDepartmentId: item.inpatientCaseId,
      requestNumber: item.requestNumber,
      bedNumber: item.bedNumber,
      ward: item.ward,
      total: item.totalAmount || 0,
      requestedDepartmentId: item._id,
      sourceType: item.sourceType,
      clinicalHistory: item.clinicalHistory || 'As per IPD request',
      clinicalIndication:
        item.clinicalIndication || 'Radiology services requested',
      urgency: item.urgency || 'routine',
      templateUsed: null,
      consultantRadiologist: this.user,
    });

    this.selectedDepartmentRequestId = item._id;
    this.selectedTestGroupName =
      item.requestedServices?.map((s: any) => s.serviceName).join(', ') ||
      'Radiology Services';
    this.selectedRequestedServices = item.requestedServices || [];

    console.log('Selected radiology request:', item);
  }

  loadSimilarReports(): void {
    if (!this.selectedRadiologyRequest) {
      Swal.fire({
        icon: 'warning',
        title: 'No Request Selected',
        text: 'Please select a radiology request first.',
      });
      return;
    }

    const criteria = {
      serviceName: this.selectedTestGroupName,
      patientAge: this.selectedRadiologyRequest.age,
      gender: this.selectedRadiologyRequest.gender,
    };

    this.ipdservice.searchSimilarReports(criteria).subscribe({
      next: (res: any) => {
        this.similarReports = res.data || [];
        console.log('Similar reports found:', this.similarReports);

        if (this.similarReports.length > 0) {
          this.showSimilarReportsModal();
        } else {
          Swal.fire({
            icon: 'info',
            title: 'No Similar Reports',
            text: 'No similar reports found for reference.',
          });
        }
      },
      error: (err) => {
        console.error('Error loading similar reports:', err);
        Swal.fire({
          icon: 'error',
          title: 'Search Failed',
          text: 'Error searching for similar reports.',
        });
      },
    });
  }

  showSimilarReportsModal(): void {
    let htmlContent =
      '<div class="similar-reports-container" style="max-height: 400px; overflow-y: auto;">';
    htmlContent +=
      '<h6 class="mb-3">Found ' +
      this.similarReports.length +
      ' similar reports:</h6>';

    this.similarReports.forEach((report, index) => {
      htmlContent += `
        <div class="card mb-2 border">
          <div class="card-body p-3">
            <h6 class="card-title text-primary">Report ${index + 1}</h6>
            <div class="row">
              <div class="col-12 mb-2">
                <strong>Protocol:</strong>
                <p class="mb-1 text-muted">${
                  report.protocol
                    ? report.protocol.substring(0, 100) + '...'
                    : 'Not specified'
                }</p>
              </div>
              <div class="col-12 mb-2">
                <strong>Observation:</strong>
                <p class="mb-1 text-muted">${
                  report.observation
                    ? report.observation.substring(0, 150) + '...'
                    : 'Not specified'
                }</p>
              </div>
              <div class="col-12 mb-2">
                <strong>Impression:</strong>
                <p class="mb-1 text-muted">${
                  report.impression
                    ? report.impression.substring(0, 100) + '...'
                    : 'Not specified'
                }</p>
              </div>
            </div>
            <button type="button" class="btn btn-sm btn-primary" onclick="window.useTemplate${index}()">
              <i class="fas fa-copy"></i> Use This Template
            </button>
          </div>
        </div>
      `;

      (window as any)[`useTemplate${index}`] = () => {
        this.radioinward.patchValue({
          protocol: report.protocol || '',
          observation: report.observation || '',
          impression: report.impression || '',
        });
        Swal.fire({
          icon: 'success',
          title: 'Template Applied',
          text: 'Similar report template has been applied successfully.',
          toast: true,
          position: 'top-end',
          timer: 2000,
          showConfirmButton: false,
        });
        Swal.close();
      };
    });

    htmlContent += '</div>';

    Swal.fire({
      title: 'Similar Reports Found',
      html: htmlContent,
      width: 900,
      showCancelButton: true,
      cancelButtonText: 'Close',
      showConfirmButton: false,
      customClass: {
        container: 'similar-reports-modal',
      },
    });
  }

  // ✅ Enhanced signature library modal
  openSignatureLibrary(): void {
    let htmlContent = `
      <div class="signature-library-container" style="max-height: 500px; overflow-y: auto;">
        <div class="mb-3">
          <button type="button" class="btn btn-success btn-sm" onclick="window.addNewSignature()">
            <i class="fas fa-plus"></i> Add New Signature
          </button>
        </div>
    `;

    if (this.savedSignatures.length === 0) {
      htmlContent += `
        <div class="text-center text-muted p-4">
          <i class="fas fa-signature fa-3x mb-3"></i>
          <p>No saved signatures found</p>
          <p>Create your first signature by clicking "Add New Signature"</p>
        </div>
      `;
    } else {
      htmlContent += '<div class="row">';
      this.savedSignatures.forEach((signature, index) => {
        htmlContent += `
          <div class="col-md-6 mb-3">
            <div class="card border">
              <div class="card-body p-3 text-center">
                <img src="${signature.signatureData}"
                     style="max-width: 150px; max-height: 80px; border: 1px solid #ddd; margin-bottom: 10px;"
                     alt="Signature">
                <h6 class="card-title">${
                  signature.name || 'Unnamed Signature'
                }</h6>
                <small class="text-muted d-block mb-2">
                  Created: ${new Date(signature.createdAt).toLocaleDateString()}
                </small>
                <div class="btn-group btn-group-sm w-100">
                  <button type="button" class="btn btn-primary" onclick="window.selectSignature${index}()">
                    <i class="fas fa-check"></i> Select
                  </button>
                  <button type="button" class="btn btn-outline-danger" onclick="window.deleteSignature${index}()">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;

        // Create dynamic functions for each signature
        (window as any)[`selectSignature${index}`] = () => {
          this.selectedLibrarySignature = signature;
          this.signatureData = signature.signatureData;
          this.signatureType = 'select';
          Swal.fire({
            icon: 'success',
            title: 'Signature Selected',
            text: `"${signature.name}" has been selected.`,
            toast: true,
            position: 'top-end',
            timer: 2000,
            showConfirmButton: false,
          });
          Swal.close();
        };

        (window as any)[`deleteSignature${index}`] = () => {
          Swal.fire({
            title: 'Delete Signature?',
            text: `Are you sure you want to delete "${signature.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
          }).then((result) => {
            if (result.isConfirmed) {
              this.deleteSignature(signature._id);
            }
          });
        };
      });
      htmlContent += '</div>';
    }

    htmlContent += '</div>';

    // Add new signature function
    (window as any).addNewSignature = () => {
      Swal.close();
      this.openAddSignatureModal();
    };

    Swal.fire({
      title: 'Signature Library',
      html: htmlContent,
      width: 800,
      showCancelButton: true,
      cancelButtonText: 'Close',
      showConfirmButton: false,
      customClass: {
        container: 'signature-library-modal',
      },
    });
  }

  // ✅ Add new signature modal
  openAddSignatureModal(): void {
    const modalHtml = `
      <div class="add-signature-container">
        <div class="form-group mb-3">
          <label class="form-label"><strong>Signature Name*</strong></label>
          <input type="text" id="signatureName" class="swal2-input" placeholder="e.g., Dr. John Smith - Main Signature">
        </div>

        <div class="form-group mb-3">
          <label class="form-label"><strong>Signature Type</strong></label>
          <div class="btn-group w-100" role="group">
            <input type="radio" class="btn-check" name="addSignatureType" id="addDrawType" value="draw" checked>
            <label class="btn btn-outline-primary" for="addDrawType">Draw</label>

            <input type="radio" class="btn-check" name="addSignatureType" id="addUploadType" value="upload">
            <label class="btn btn-outline-primary" for="addUploadType">Upload</label>
          </div>
        </div>

        <div id="drawSignatureArea" class="signature-area">
          <canvas id="addSignatureCanvas" width="400" height="150"
                  style="border: 2px solid #ddd; background: white; cursor: crosshair; display: block; margin: 0 auto;">
          </canvas>
          <div class="text-center mt-2">
            <button type="button" id="clearAddCanvas" class="btn btn-sm btn-secondary">
              <i class="fas fa-eraser"></i> Clear
            </button>
          </div>
        </div>

        <div id="uploadSignatureArea" class="signature-area" style="display: none;">
          <input type="file" id="addSignatureFile" accept="image/*" style="display: none;">
          <div id="uploadArea" class="upload-area text-center p-4"
               style="border: 2px dashed #ccc; cursor: pointer; background: #f9f9f9;"
               onclick="document.getElementById('addSignatureFile').click()">
            <i class="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
            <p>Click to upload signature image</p>
            <small class="text-muted">Supports: JPG, PNG, GIF (Max: 5MB)</small>
          </div>
          <div id="uploadPreview" style="display: none; text-align: center; margin-top: 10px;">
            <img id="previewImage" style="max-width: 300px; max-height: 120px; border: 1px solid #ddd;">
          </div>
        </div>
      </div>
    `;

    Swal.fire({
      title: 'Add New Signature',
      html: modalHtml,
      width: 600,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-save"></i> Save Signature',
      cancelButtonText: 'Cancel',
      didOpen: () => {
        this.initializeAddSignatureModal();
      },
      preConfirm: () => {
        const signatureName = (
          document.getElementById('signatureName') as HTMLInputElement
        )?.value;
        const signatureType = (
          document.querySelector(
            'input[name="addSignatureType"]:checked'
          ) as HTMLInputElement
        )?.value;

        if (!signatureName) {
          Swal.showValidationMessage('Signature name is required');
          return false;
        }

        let signatureData = '';
        if (signatureType === 'draw') {
          const canvas = document.getElementById(
            'addSignatureCanvas'
          ) as HTMLCanvasElement;
          signatureData = canvas.toDataURL('image/png');
        } else if (signatureType === 'upload') {
          const previewImg = document.getElementById(
            'previewImage'
          ) as HTMLImageElement;
          if (previewImg.src) {
            signatureData = previewImg.src;
          }
        }

        if (!signatureData) {
          Swal.showValidationMessage('Please create or upload a signature');
          return false;
        }

        return {
          name: signatureName,
          signatureData: signatureData,
          signatureType: signatureType,
          createdBy: this.user,
        };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.saveNewSignature(result.value);
      }
    });
  }

  // ✅ Initialize add signature modal functionality
  initializeAddSignatureModal(): void {
    const drawRadio = document.getElementById(
      'addDrawType'
    ) as HTMLInputElement;
    const uploadRadio = document.getElementById(
      'addUploadType'
    ) as HTMLInputElement;
    const drawArea = document.getElementById(
      'drawSignatureArea'
    ) as HTMLElement;
    const uploadArea = document.getElementById(
      'uploadSignatureArea'
    ) as HTMLElement;
    const canvas = document.getElementById(
      'addSignatureCanvas'
    ) as HTMLCanvasElement;
    const clearBtn = document.getElementById(
      'clearAddCanvas'
    ) as HTMLButtonElement;
    const fileInput = document.getElementById(
      'addSignatureFile'
    ) as HTMLInputElement;

    // Setup canvas for drawing
    if (canvas) {
      const context = canvas.getContext('2d')!;
      context.lineCap = 'round';
      context.lineWidth = 2;
      context.strokeStyle = '#000';

      let isDrawing = false;

      canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        context.beginPath();
        context.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      });

      canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        context.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        context.stroke();
      });

      canvas.addEventListener('mouseup', () => {
        isDrawing = false;
        context.closePath();
      });

      clearBtn.addEventListener('click', () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
      });
    }

    // Setup file upload
    if (fileInput) {
      fileInput.addEventListener('change', (e: any) => {
        const file = e.target.files[0];
        if (file && this.validateSignatureFile(file)) {
          const reader = new FileReader();
          reader.onload = (event: any) => {
            const previewImg = document.getElementById(
              'previewImage'
            ) as HTMLImageElement;
            const previewDiv = document.getElementById(
              'uploadPreview'
            ) as HTMLElement;
            previewImg.src = event.target.result;
            previewDiv.style.display = 'block';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Toggle between draw and upload
    drawRadio.addEventListener('change', () => {
      if (drawRadio.checked) {
        drawArea.style.display = 'block';
        uploadArea.style.display = 'none';
      }
    });

    uploadRadio.addEventListener('change', () => {
      if (uploadRadio.checked) {
        drawArea.style.display = 'none';
        uploadArea.style.display = 'block';
      }
    });
  }

  // ✅ Save new signature to backend
  // saveNewSignature(signatureData: any): void {
  //   this.ipdservice.saveUserSignature(signatureData).subscribe({
  //     next: (res: any) => {
  //       console.log('✅ Signature saved successfully:', res);
  //       this.loadSavedSignatures(); // Reload signatures
  //       Swal.fire({
  //         icon: 'success',
  //         title: 'Signature Saved',
  //         text: `"${signatureData.name}" has been saved to your signature library.`,
  //         toast: true,
  //         position: 'top-end',
  //         timer: 3000,
  //         showConfirmButton: false
  //       });
  //     },
  //     error: (err: any) => {
  //       console.error('❌ Error saving signature:', err);
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Save Failed',
  //         text: 'Error saving signature. Please try again.'
  //       });
  //     }
  //   });
  // }

  // ✅ Delete signature
  deleteSignature(signatureId: string): void {
    this.ipdservice.deleteUserSignature(signatureId).subscribe({
      next: (res: any) => {
        console.log('✅ Signature deleted successfully');
        this.loadSavedSignatures(); // Reload signatures
        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: 'Signature has been deleted.',
          toast: true,
          position: 'top-end',
          timer: 2000,
          showConfirmButton: false,
        });
      },
      error: (err: any) => {
        console.error('❌ Error deleting signature:', err);
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: 'Error deleting signature. Please try again.',
        });
      },
    });
  }

  // ✅ File handling methods
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && this.validateSignatureFile(file)) {
      this.handleSignatureFile(file);
    }
  }

  validateSignatureFile(file: File): boolean {
    if (!file.type.startsWith('image/')) {
      Swal.fire('Error', 'Please select an image file.', 'error');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Error', 'File size must be less than 5MB.', 'error');
      return false;
    }
    return true;
  }

  handleSignatureFile(file: File): void {
    this.uploadedSignatureFile = file;
    this.uploadedFileName = file.name;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.uploadedSignaturePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeUploadedSignature(): void {
    this.uploadedSignatureFile = null;
    this.uploadedSignaturePreview = '';
    this.uploadedFileName = '';
    this.signatureData = '';
  }

  // ✅ Enhanced clear signature method
  clearSignature(): void {
    if (this.signatureType === 'draw') {
      if (!this.signatureCanvas || !this.context) return;
      const canvas = this.signatureCanvas.nativeElement;
      this.context.clearRect(0, 0, canvas.width, canvas.height);
      this.context.fillStyle = '#ffffff';
      this.context.fillRect(0, 0, canvas.width, canvas.height);
      this.context.fillStyle = '#000000';
    } else if (this.signatureType === 'upload') {
      this.removeUploadedSignature();
    } else if (this.signatureType === 'select') {
      this.selectedLibrarySignature = null;
    }

    this.signatureData = '';
  }

  // ✅ Enhanced save signature method
  // ✅ Enhanced save signature method with library option
  saveSignature(): void {
    if (this.signatureType === 'draw') {
      if (!this.signatureCanvas || !this.context) {
        console.warn('⚠️ Signature canvas not available');
        return;
      }

      try {
        const canvas = this.signatureCanvas.nativeElement;
        this.signatureData = canvas.toDataURL('image/png');
      } catch (error) {
        console.error('❌ Error saving signature:', error);
        return;
      }
    } else if (this.signatureType === 'upload') {
      if (!this.uploadedSignaturePreview) {
        Swal.fire({
          icon: 'warning',
          title: 'No File Selected',
          text: 'Please select a signature image first.',
        });
        return;
      }
      this.signatureData = this.uploadedSignaturePreview;
    } else if (this.signatureType === 'select') {
      if (!this.selectedLibrarySignature) {
        Swal.fire({
          icon: 'warning',
          title: 'No Signature Selected',
          text: 'Please select a signature from the library.',
        });
        return;
      }
      this.signatureData = this.selectedLibrarySignature.signatureData;
    }

    if (this.signatureData) {
      // ✅ Ask user if they want to save to library
      Swal.fire({
        title: 'Signature Saved!',
        text: 'Would you like to save this signature to your library for future use?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-save"></i> Save to Library',
        cancelButtonText: 'Just Use for This Report',
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.saveSignatureToLibrary();
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Signature Applied',
            text: 'Signature has been applied to the report.',
            toast: true,
            position: 'top-end',
            timer: 2000,
            showConfirmButton: false,
          });
        }
      });
    }
  }

  // ✅ New method to save signature to library
  saveSignatureToLibrary(): void {
    if (!this.signatureData) {
      Swal.fire({
        icon: 'error',
        title: 'No Signature Data',
        text: 'Please create a signature first.',
      });
      return;
    }

    // Ask for signature name
    Swal.fire({
      title: 'Save to Signature Library',
      html: `
      <div class="form-group">
        <label class="form-label"><strong>Signature Name*</strong></label>
        <input type="text" id="librarySignatureName" class="swal2-input"
               placeholder="e.g., ${this.loggedUserName} - Main Signature"
               value="${this.loggedUserName} - Signature">
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-save"></i> Save to Library',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const signatureName = (
          document.getElementById('librarySignatureName') as HTMLInputElement
        )?.value;

        if (!signatureName || signatureName.trim() === '') {
          Swal.showValidationMessage('Signature name is required');
          return false;
        }

        return signatureName.trim();
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const signatureData = {
          name: result.value,
          signatureData: this.signatureData,
          signatureType: this.signatureType,
          createdBy: this.user,
        };

        console.log('🔄 Saving signature to library:', signatureData);
        this.saveNewSignature(signatureData);
      }
    });
  }

  // ✅ Enhanced template modal with HTML document generation instead of Word
  openTemplateModal(): void {
    const currentValues = this.radioinward.value;

    if (
      !currentValues.protocol &&
      !currentValues.observation &&
      !currentValues.impression
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'No Content to Save',
        text: 'Please fill in the report fields before saving as template.',
      });
      return;
    }

    this.templateForm.patchValue({
      serviceName: this.selectedTestGroupName || '',
      protocol: currentValues.protocol || '',
      observation: currentValues.observation || '',
      impression: currentValues.impression || '',
    });

    const modalHtml = `
      <div class="template-form-container">
        <div class="form-group mb-3">
          <label class="form-label"><strong>Template Name*</strong></label>
          <input type="text" id="templateName" class="swal2-input" placeholder="e.g., Normal MRI Brain" value="">
        </div>
        <div class="form-group mb-3">
          <label class="form-label"><strong>Service Name*</strong></label>
          <input type="text" id="serviceName" class="swal2-input" placeholder="e.g., MRI Brain" value="${
            this.selectedTestGroupName || ''
          }">
        </div>
        <div class="form-group mb-3">
          <label class="form-label"><strong>Protocol</strong></label>
          <textarea id="templateProtocol" class="swal2-textarea" rows="2" placeholder="Protocol details...">${
            currentValues.protocol || ''
          }</textarea>
        </div>
        <div class="form-group mb-3">
          <label class="form-label"><strong>Observation</strong></label>
          <textarea id="templateObservation" class="swal2-textarea" rows="4" placeholder="Observation details...">${
            currentValues.observation || ''
          }</textarea>
        </div>
        <div class="form-group mb-3">
          <label class="form-label"><strong>Impression</strong></label>
          <textarea id="templateImpression" class="swal2-textarea" rows="2" placeholder="Impression details...">${
            currentValues.impression || ''
          }</textarea>
        </div>
        <div class="form-group mb-3">
          <div class="form-check">
            <input type="checkbox" id="saveAsDocument" class="form-check-input" checked>
            <label class="form-check-label" for="saveAsDocument">
              <strong>Also save as HTML document</strong>
            </label>
          </div>
        </div>
      </div>
    `;

    Swal.fire({
      title: 'Save Finding Template',
      html: modalHtml,
      width: 600,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-save"></i> Save Template',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const templateName = (
          document.getElementById('templateName') as HTMLInputElement
        )?.value;
        const serviceName = (
          document.getElementById('serviceName') as HTMLInputElement
        )?.value;
        const protocol = (
          document.getElementById('templateProtocol') as HTMLTextAreaElement
        )?.value;
        const observation = (
          document.getElementById('templateObservation') as HTMLTextAreaElement
        )?.value;
        const impression = (
          document.getElementById('templateImpression') as HTMLTextAreaElement
        )?.value;
        const saveAsDocument = (
          document.getElementById('saveAsDocument') as HTMLInputElement
        )?.checked;

        if (!templateName || !serviceName) {
          Swal.showValidationMessage(
            'Template name and service name are required'
          );
          return false;
        }

        return {
          templateName,
          serviceName,
          protocol,
          observation,
          impression,
          saveAsDocument,
          createdBy: this.user || this.radioinward.value.pharmacistUserId,
        };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.saveTemplateData(result.value);
      }
    });
  }

  // ✅ Save template with HTML document generation
  saveTemplateData(templateData: any): void {
    console.log('🔄 Saving template:', templateData);

    this.ipdservice.createFindingTemplate(templateData).subscribe({
      next: (res: any) => {
        console.log('✅ Template saved successfully:', res);

        // ✅ Generate HTML document if requested
        if (templateData.saveAsDocument) {
          this.generateHTMLDocument(templateData);
        }

        Swal.fire({
          icon: 'success',
          title: 'Template Saved',
          text: templateData.saveAsDocument
            ? 'Template saved successfully! HTML document will be downloaded shortly.'
            : 'Finding template has been saved successfully.',
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false,
        });

        this.loadTemplates();
      },
      error: (err) => {
        console.error('❌ Error saving template:', err);
        Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text:
            err?.error?.message || 'Error saving template. Please try again.',
        });
      },
    });
  }

  // ✅ Generate HTML document for template (alternative to Word)
  generateHTMLDocument(templateData: any): void {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Radiology Report Template - ${templateData.templateName}</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: white;
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #000;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #000;
                font-size: 28px;
                margin: 0;
                text-transform: uppercase;
            }
            .header h2 {
                color: #333;
                font-size: 22px;
                margin: 10px 0 0 0;
                font-weight: normal;
            }
            .info-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            .info-table td {
                border: 1px solid #333;
                padding: 10px;
            }
            .info-table .label {
                background-color: #f0f0f0;
                font-weight: bold;
                width: 30%;
            }
            .section {
                margin-bottom: 30px;
            }
            .section h3 {
                color: #000;
                font-size: 18px;
                margin-bottom: 10px;
                text-transform: uppercase;
                border-bottom: 1px solid #ccc;
                padding-bottom: 5px;
            }
            .content {
                background-color: #fafafa;
                padding: 15px;
                border-left: 4px solid #007bff;
                min-height: 50px;
                line-height: 1.8;
            }
            .footer {
                margin-top: 50px;
                text-align: center;
                font-style: italic;
                color: #666;
                border-top: 1px solid #ccc;
                padding-top: 20px;
            }
            @media print {
                body { margin: 0; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Radiology Report Template</h1>
            <h2>${templateData.templateName}</h2>
        </div>

        <table class="info-table">
            <tr>
                <td class="label">Template Name:</td>
                <td>${templateData.templateName}</td>
            </tr>
            <tr>
                <td class="label">Service Name:</td>
                <td>${templateData.serviceName}</td>
            </tr>
            <tr>
                <td class="label">Created By:</td>
                <td>${this.loggedUserName}</td>
            </tr>
            <tr>
                <td class="label">Created Date:</td>
                <td>${new Date().toLocaleDateString(
                  'en-GB'
                )} ${new Date().toLocaleTimeString()}</td>
            </tr>
        </table>

        <div class="section">
            <h3>Protocol</h3>
            <div class="content">
                ${templateData.protocol || 'Not specified'}
            </div>
        </div>

        <div class="section">
            <h3>Observation</h3>
            <div class="content">
                ${templateData.observation || 'Not specified'}
            </div>
        </div>

        <div class="section">
            <h3>Impression</h3>
            <div class="content">
                ${templateData.impression || 'Not specified'}
            </div>
        </div>

        <div class="footer">
            <p>Generated by ${
              this.loggedUserName
            } - Hospital Management System</p>
            <p>This is a computer-generated template document</p>
        </div>

        <script>
            // Auto-print functionality
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 1000);
            }
        </script>
    </body>
    </html>
    `;

    // Create and download HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${templateData.templateName
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()}_template.html`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  clearReport(): void {
    Swal.fire({
      title: 'Clear Report Fields?',
      text: 'This will clear all report content. Continue?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, clear it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.radioinward.patchValue({
          protocol: '',
          observation: '',
          impression: '',
          remarks: '',
          templateUsed: null,
        });
        this.selectedTemplateId = '';
        this.clearSignature();

        Swal.fire({
          icon: 'success',
          title: 'Cleared',
          text: 'Report fields have been cleared.',
          toast: true,
          position: 'top-end',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }

  // Signature methods
  startDrawing(event: MouseEvent | TouchEvent): void {
    if (!this.context || !this.signatureCanvas) return;

    this.isDrawing = true;
    const rect = this.signatureCanvas.nativeElement.getBoundingClientRect();
    const clientX =
      event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY =
      event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    this.context.beginPath();
    this.context.moveTo(x, y);
    event.preventDefault();
  }

  draw(event: MouseEvent | TouchEvent): void {
    if (!this.isDrawing || !this.context || !this.signatureCanvas) return;

    const rect = this.signatureCanvas.nativeElement.getBoundingClientRect();
    const clientX =
      event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY =
      event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    this.context.lineTo(x, y);
    this.context.stroke();
    event.preventDefault();
  }

  stopDrawing(): void {
    if (!this.context) return;
    this.isDrawing = false;
    this.context.closePath();
  }

  previewReport(): void {
    if (!this.selectedRadiologyRequest) {
      Swal.fire({
        icon: 'warning',
        title: 'No Request Selected',
        text: 'Please select a radiology request first.',
      });
      return;
    }

    const formData = this.radioinward.value;
    const selectedRadiologist = this.radiologists.find(
      (r) => r._id === formData.consultantRadiologist
    );

    const reportHtml = this.generateReportHTML(formData, selectedRadiologist);

    Swal.fire({
      title: 'Report Preview',
      html: reportHtml,
      width: 900,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-print"></i> Print Report',
      cancelButtonText: 'Close',
      customClass: {
        container: 'report-preview-modal',
        htmlContainer: 'report-preview-content',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.printReport(reportHtml);
      }
    });
  }

  generateReportHTML(formData: any, selectedRadiologist: any): string {
    const radiologistName =
      selectedRadiologist?.name || this.loggedUserName || 'RADIOLOGIST NAME';

    return `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background: white;">
        ${
          this.letterheaderHtml ||
          '<div class="letterhead-placeholder" style="text-align: center; padding: 20px; border-bottom: 2px solid #000; margin-bottom: 20px;"><h2>HOSPITAL LETTERHEAD</h2></div>'
        }

        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="border: 1px solid #000; padding: 8px; background-color: #000; color: white; font-weight: bold;">Patient Name:</td>
              <td style="border: 1px solid #000; padding: 8px;">${
                this.selectedRadiologyRequest?.patientName || ''
              }</td>
              <td style="border: 1px solid #000; padding: 8px; background-color: #000; color: white; font-weight: bold;">Study:</td>
              <td style="border: 1px solid #000; padding: 8px;">${
                this.selectedTestGroupName
              }</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px; background-color: #000; color: white; font-weight: bold;">Age / Sex:</td>
              <td style="border: 1px solid #000; padding: 8px;">${
                this.selectedRadiologyRequest?.age || ''
              } / ${formData.gender || 'Not specified'}</td>
              <td style="border: 1px solid #000; padding: 8px; background-color: #000; color: white; font-weight: bold;">Date:</td>
              <td style="border: 1px solid #000; padding: 8px;">${new Date().toLocaleDateString(
                'en-GB'
              )}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px; background-color: #000; color: white; font-weight: bold;">Referred By:</td>
              <td style="border: 1px solid #000; padding: 8px;">Dr. ${
                formData.referredBy || ''
              }</td>
              <td colspan="2" style="border: 1px solid #000; padding: 8px;"></td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-bottom: 20px;">
          <h3 style="text-decoration: underline; margin: 0;">${this.selectedTestGroupName.toUpperCase()}</h3>
        </div>

        <div style="margin-bottom: 20px; text-align: justify;">
          <strong>PROTOCOL:</strong> ${formData.protocol || 'Not specified'}
        </div>

        <div style="margin-bottom: 20px; text-align: justify;">
          <strong>OBSERVATION:</strong><br><br>
          <div style="white-space: pre-line; line-height: 1.6;">${
            formData.observation || 'No observations recorded'
          }</div>
        </div>

        <div style="margin-bottom: 40px; text-align: justify;">
          <strong>IMPRESSION:</strong><br><br>
          <div style="line-height: 1.6;">${
            formData.impression || 'No impression recorded'
          }</div>
        </div>

        ${
          formData.remarks
            ? `
        <div style="margin-bottom: 40px; text-align: justify;">
          <strong>Additional Remarks:</strong><br><br>
          <div style="line-height: 1.6;">${formData.remarks}</div>
        </div>
        `
            : ''
        }

        <div style="margin-top: 60px; text-align: center;">
          ${
            this.signatureData
              ? `<img src="${this.signatureData}" style="max-width: 200px; height: auto; border: 1px solid #ccc; padding: 5px; margin-bottom: 10px;"><br>`
              : '<div style="height: 60px; border-bottom: 1px solid #000; width: 200px; margin: 0 auto 10px;"></div>'
          }
          <strong>Dr. ${radiologistName}</strong><br>
          ${selectedRadiologist?.role?.name || 'MBBS DMRD'}<br>
          CONSULTANT RADIOLOGIST
        </div>
      </div>
    `;
  }

  printReport(reportHtml: string): void {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Radiology Report - ${this.selectedRadiologyRequest?.patientName}</title>
            <style>
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
              body {
                font-family: Arial, sans-serif;
                line-height: 1.4;
              }
            </style>
          </head>
          <body>
            ${reportHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  // ✅ Submit form - Updated with correct navigation and enhanced signature handling
  onSubmit(): void {
    if (this.radioinward.invalid) {
      this.radioinward.markAllAsTouched();

      const errors = [];
      if (this.radioinward.get('protocol')?.invalid) errors.push('Protocol');
      if (this.radioinward.get('observation')?.invalid)
        errors.push('Observation');
      if (this.radioinward.get('impression')?.invalid)
        errors.push('Impression');
      if (this.radioinward.get('consultantRadiologist')?.invalid)
        errors.push('Consultant Radiologist');

      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        html: `Please fill in the following required fields:<br><br><strong>${errors.join(
          ', '
        )}</strong>`,
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
      return;
    }

    if (!this.selectedRadiologyRequest) {
      Swal.fire({
        icon: 'warning',
        title: 'No Request Selected',
        text: 'Please select a radiology request before submitting.',
      });
      return;
    }

    const formValues = this.radioinward.value;

    // ✅ Enhanced signature payload with proper typing
    let signaturePayload: any = null;
    if (this.signatureData) {
      signaturePayload = {
        signatureData: this.signatureData,
        signatureType: this.signatureType,
        createdAt: new Date(),
      };

      // Add additional metadata based on signature type
      if (this.signatureType === 'upload' && this.uploadedSignatureFile) {
        signaturePayload.fileName = this.uploadedFileName;
      } else if (
        this.signatureType === 'select' &&
        this.selectedLibrarySignature
      ) {
        signaturePayload.librarySignatureId = this.selectedLibrarySignature._id;
        signaturePayload.signatureName = this.selectedLibrarySignature.name;
      }
    }

    const payload = {
      radiologyRequestId: this.selectedDepartmentRequestId,
      patientUhid: formValues.uniqueHealthIdentificationId,
      patientName: formValues.patient_name,
      age: formValues.age,
      gender: formValues.gender,
      requestNumber: formValues.requestNumber,
      sourceType: formValues.sourceType,
      bedNumber: formValues.bedNumber,
      ward: formValues.ward,
      inpatientCaseId: formValues.inpatientDepartmentId,
      requestedServices: this.selectedRequestedServices,
      clinicalHistory: formValues.clinicalHistory || 'As per IPD request',
      clinicalIndication:
        formValues.clinicalIndication || 'As per billing request',
      protocol: formValues.protocol,
      observation: formValues.observation,
      impression: formValues.impression,
      findings: formValues.remarks,
      reportStatus: formValues.reportStatus,
      consultantRadiologist: formValues.consultantRadiologist,
      reportedBy: this.user || formValues.pharmacistUserId,
      radiologistSignature: signaturePayload,
      ...(formValues.templateUsed && formValues.templateUsed !== ''
        ? { templateUsed: formValues.templateUsed }
        : {}),
      studyDate: formValues.studyDate || new Date(),
      studyTime:
        formValues.studyTime || new Date().toLocaleTimeString().slice(0, 5),
      totalAmount: formValues.total,
      amountReceived: formValues.amountReceived || 0,
      dueAmount: formValues.dueAmount,
      paymentMode: formValues.PaymentMode,
      transactionId: formValues.transactionId,
      isPaid: (formValues.dueAmount || 0) <= 0,
      completedAt: formValues.reportStatus === 'final' ? new Date() : null,
      urgency: formValues.urgency || 'routine',
    };

    console.log('🔄 Submitting radiology inward payload:', payload);

    this.ipdservice.postRadioInward(payload).subscribe({
      next: (response) => {
        console.log(
          '✅ Radiology investigation submitted successfully:',
          response
        );

        Swal.fire({
          icon: 'success',
          title: 'Investigation Completed',
          text: 'Radiology investigation and report have been completed successfully.',
          showCancelButton: true,
          confirmButtonText: '<i class="fas fa-eye"></i> View Report',
          cancelButtonText:
            '<i class="fas fa-arrow-left"></i> Back to Dashboard',
          allowOutsideClick: false,
          customClass: {
            popup: 'hospital-swal-popup',
            title: 'hospital-swal-title',
            htmlContainer: 'hospital-swal-text',
            confirmButton: 'hospital-swal-button btn-success',
            cancelButton: 'hospital-swal-button btn-primary',
          },
        }).then((result) => {
          if (result.isConfirmed) {
            // User wants to view the report
            this.previewReport();

            // After closing preview, navigate to dashboard
            setTimeout(() => {
              this.clearFormAndNavigate();
            }, 1000);
          } else {
            // User wants to go back to dashboard immediately
            this.clearFormAndNavigate();
          }
        });
      },
      error: (err) => {
        console.error('❌ Error completing radiology investigation:', err);
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text:
            err?.error?.message ||
            'Something went wrong while completing the investigation.',
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

  // ✅ New method to clear form and navigate
  private clearFormAndNavigate(): void {
    // Show loading indicator
    Swal.fire({
      title: 'Clearing Form...',
      html: 'Redirecting to radiology dashboard...',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    // Clear form completely
    this.resetFormCompletely();

    // Navigate to the radiology dashboard
    setTimeout(() => {
      this.router
        .navigateByUrl('/radiologylayout/radiologylayoutipd')
        .then(() => {
          console.log('✅ Successfully navigated to radiology dashboard');
        })
        .catch((error) => {
          console.error('❌ Navigation error:', error);
          // Fallback navigation
          window.location.href = '/radiologylayout/radiologylayout';
        });
    }, 1500);
  }

  // ✅ Enhanced reset method - completely clears everything
  private resetFormCompletely(): void {
    console.log('🔄 Completely resetting form and data...');

    // Reset form to pristine state
    this.radioinward.reset();
    this.radioinward.markAsUntouched();
    this.radioinward.markAsPristine();

    // Clear all selected data
    this.selectedRadiologyRequest = null;
    this.selectedRequestedServices = [];
    this.selectedTestGroupName = '';
    this.selectedDepartmentRequestId = '';
    this.selectedTemplateId = '';
    this.selectedPatient = null;
    this.selectedPatientDetails = null;
    this.manuallySelected = false;
    this.showSuggestions = false;
    this.radioreq = [];

    // Clear signature
    this.clearSignature();

    // Reset pagination
    this.currentPage = 1;

    // Clear any localStorage items related to selected requests
    localStorage.removeItem('selectedRadiologyRequest');

    // Reset form with fresh default values
    this.radioinward.patchValue({
      consultantRadiologist: this.user,
      pharmacistUserId: this.user,
      reportedBy: this.user,
      reportStatus: 'draft',
      urgency: 'routine',
      studyDate: new Date().toISOString().split('T')[0],
      studyTime: new Date().toTimeString().slice(0, 5),
      PaymentMode: 'cash',
      gender: 'male',
      templateUsed: null,
      dueAmount: 0,
      amountReceived: 0,
      total: 0,
    });

    // Force change detection
    this.cdr.detectChanges();

    console.log('✅ Form completely reset and ready for new entry');
  }

  // ✅ Enhanced resetForm method (called when form needs to be reset but not navigating)
  resetForm(): void {
    console.log('🔄 Resetting form...');

    this.radioinward.reset();
    this.selectedRadiologyRequest = null;
    this.selectedRequestedServices = [];
    this.selectedTestGroupName = '';
    this.selectedDepartmentRequestId = '';
    this.selectedTemplateId = '';
    this.selectedPatient = null;
    this.selectedPatientDetails = null;
    this.manuallySelected = false;
    this.showSuggestions = false;
    this.radioreq = [];
    this.clearSignature();

    // Reload fresh data
    this.loadRadiologyRequests();

    // Reset with default values
    this.radioinward.patchValue({
      consultantRadiologist: this.user,
      pharmacistUserId: this.user,
      reportedBy: this.user,
      reportStatus: 'draft',
      urgency: 'routine',
      studyDate: new Date().toISOString().split('T')[0],
      studyTime: new Date().toTimeString().slice(0, 5),
      PaymentMode: 'cash',
      gender: 'male',
      templateUsed: null,
      dueAmount: 0,
      amountReceived: 0,
      total: 0,
    });

    this.cdr.detectChanges();
    console.log('✅ Form reset completed');
  }

  // Pagination methods
  updatePagination() {
    this.totalPages =
      Math.ceil(this.filteredRadiologyreq.length / this.itemsPerPage) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  get paginatedRadiologyreq(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredRadiologyreq.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  ngOnDestroy() {
    if (this.letterheaderRef) {
      this.letterheaderRef.destroy();
    }
  }
}
