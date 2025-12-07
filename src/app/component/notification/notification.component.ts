import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { DoctorService } from '../../views/doctormodule/doctorservice/doctor.service';
import { MasterService } from '../../views/mastermodule/masterservice/master.service';
import { IpdService } from '../../views/ipdmodule/ipdservice/ipd.service'; // Add your IPD service
import { CommonModule, NgIf } from '@angular/common';
import { DoctorreferralService } from '../../viewsdoctorreferral/doctorreferral.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit {

  currentRoute = '';
  filteredPharmareq: any[] = [];
  filteredRadiologyreq: any[] = []; // Add radiology requests
  previousRequestIds = new Set<string>();
  previousRadiologyIds = new Set<string>(); // Add for radiology
  toastPatientMap = new Map<string, any>();
  radiologyToastMap = new Map<string, any>(); // Add for radiology

  lowstock: any[] = [];
  shownLowStockIds = new Set<string>();

  allData: any[] = [];
  pendingPayouts: any[] = [];

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private doctorservice: DoctorService,
    private masterservice: MasterService,
    private ipdservice: IpdService, // Add IPD service
    private doctor: DoctorreferralService
  ) {}

  ngOnInit(): void {
    this.currentRoute = this.router.url;
    this.checkAndLoad();

    // ✅ Track route changes dynamically
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        this.checkAndLoad(); // ⬅️ Load notifications for new route
      });
  }

  checkAndLoad() {
    if (this.currentRoute === '/pharmalayout/pharmacydashboard') {
      this.loadPharmareq();
    }

    if (this.currentRoute === '/inventorylayout/inventorylayout') {
      this.loadlowstock();
    }

    if (this.currentRoute === '/doctorreferrallayout/doctorreferrallayout') {
      this.loadData();
    }

    // ✅ Add radiology dashboard route check
    if (this.currentRoute === '/radiologylayout/radiologydashboard') {
      this.loadRadiologyRequests();
    }
  }

  // ✅ New method to load radiology requests
 // ✅ Updated loadRadiologyRequests with better notification details
loadRadiologyRequests() {
  this.ipdservice.getradiologyreq().subscribe({
    next: (res: any) => {
      console.log('Radiology requests response:', res);

      const allRequests = res?.data || [];

      // Filter pending requests only
      const pendingRequests = allRequests.filter((req: any) =>
        req.overallStatus?.toLowerCase() === 'pending'
      );

      // Process new requests for notifications
      pendingRequests.forEach((req: any) => {
        if (!this.previousRadiologyIds.has(req._id)) {
          // Determine notification title and routing info based on source type
          let toastTitle = 'New Radiology Request';
          let patientInfo = '';
          let routingInfo = '';

          if (req.sourceType === 'ipd') {
            toastTitle = 'New IPD Radiology Request';
            patientInfo = req.bedNumber ? ` (Bed: ${req.bedNumber})` : '';
            // routingInfo = ' → Click to manage inward';
          } else if (req.sourceType === 'opd') {
            toastTitle = 'New OPD Radiology Request';
            // routingInfo = ' → Click for interim billing';
          }

          // Get service names
          const serviceNames = req.requestedServices?.map((service: any) =>
            service.serviceName
          ).join(', ') || 'Multiple Services';

          // Create enhanced toast notification
          const toastRef = this.toastr.info(
            `<b>${req.patientName}</b>${patientInfo}<br>
             <small>Services: ${serviceNames}</small><br>
             <small>Request: ${req.requestNumber || 'N/A'}</small>
             `,
            toastTitle,
            {
              enableHtml: true,
              closeButton: true,
              timeOut: 15000, // Longer time for more detailed info
              positionClass: 'toast-bottom-left',
              tapToDismiss: true,
            }
          );

          // Handle toast click
          if (toastRef) {
            toastRef.onTap.subscribe(() => {
              console.log('Radiology toast tapped for:', req.sourceType, 'request');
              this.navigateToRadiologyPage(req);
            });
          }

          this.previousRadiologyIds.add(req._id);
        }
      });

      this.filteredRadiologyreq = pendingRequests;
      console.log(`Loaded ${pendingRequests.length} pending radiology requests`);
    },
    error: (err) => {
      console.error('Error loading radiology requests:', err);
      this.filteredRadiologyreq = [];
    },
  });
}


  // ✅ Navigation method for radiology requests// ✅ Updated navigation method for radiology requests
navigateToRadiologyPage(radiologyData: any) {
  console.log('Navigating to radiology with data:', radiologyData);

  try {
    // Store radiology data for the target component to use
    localStorage.setItem('selectedRadiologyRequest', JSON.stringify(radiologyData));
    console.log('Radiology data stored in localStorage');

    // Close toasts before navigation
    this.toastr.clear();

    // ✅ Determine route based on sourceType (opd vs ipd)
    let targetRoute: string;
    const sourceType = radiologyData?.sourceType?.toLowerCase();

    if (sourceType === 'ipd') {
      // IPD radiology requests go to manage radio inward
      targetRoute = '/radiologylayout/manageradioinward';
      console.log('Navigating to IPD radiology inward for inpatient request');
    } else if (sourceType === 'opd') {
      // OPD radiology requests go to radio interim bill
      targetRoute = '/radiologylayout/radiointermbill';
      console.log('Navigating to OPD radiology interim bill for outpatient request');
    } else {
      // Fallback to general radiology dashboard
      targetRoute = '/radiologylayout/radiologydashboard';
      console.log('Navigating to general radiology dashboard - unknown source type');
    }

    // Navigate to the appropriate page with query params
    this.router.navigate([targetRoute], {
      queryParams: {
        requestId: radiologyData._id,
        patientName: radiologyData.patientName,
        requestNumber: radiologyData.requestNumber,
        sourceType: radiologyData.sourceType,
        // Add additional params based on source type
        ...(sourceType === 'ipd' ? {
          bedNumber: radiologyData.bedNumber,
          ward: radiologyData.ward,
          inpatientCaseId: radiologyData.inpatientCaseId
        } : {}),
        ...(sourceType === 'opd' ? {
          outpatientCaseId: radiologyData.outpatientCaseId
        } : {})
      }
    }).then(
      (success) => {
        if (success) {
          console.log('Navigation successful to:', targetRoute);
        } else {
          console.error('Navigation failed to:', targetRoute);
        }
      }
    ).catch(error => {
      console.error('Navigation error:', error);
    });

  } catch (error) {
    console.error('Error in navigateToRadiologyPage:', error);
  }
}


  // Your existing methods remain the same
  loadPharmareq() {
    this.doctorservice.getPharmareq(1, 1000).subscribe({
      next: (res: any[] | undefined) => {
        const flat: any[] = [];
        res?.forEach((patient: any) => {
          patient?.pharmaceuticalrequestlists?.forEach((req: any) => {
            if (req.status?.toLowerCase() === 'pending') {
              const uniqueId = req._id;
              flat.push({
                patient_name: patient.patient_name,
                uhid: patient.uhid,
                patientType: req.patientType,
                status: req.status,
                packages: req.packages,
                request: req,
                fullPatient: patient,
              });

              if (!this.previousRequestIds.has(uniqueId)) {
                const patientData = { ...patient, request: req };

                // ✅ Determine correct title based on patientType
                let toastTitle: string;
                const patientType = req.patientType?.toLowerCase();

                if (patientType === 'inpatientdepartment') {
                  toastTitle = 'Pending IPD Pharma Requests';
                } else if (patientType === 'outpatientdepartment') {
                  toastTitle = 'Pending OPD Pharma Requests';
                } else if (patientType === 'operationtheatre') {
                  toastTitle = 'Pending OT Pharma Requests';
                } else {
                  toastTitle = 'Pending Pharma Requests'; // fallback
                }

                // ✅ Create toast with dynamic title
                const toastRef = this.toastr.info(
                  `${patient.patient_name} (${patient.uhid}) {${req.patientType}} - Click to view`,
                  toastTitle, // ✅ Use dynamic title here
                  {
                    closeButton: true,
                    timeOut: 15000,
                    positionClass: 'toast-bottom-left',
                    tapToDismiss: true,
                  }
                );

                // ✅ Handle toast click via onTap
                if (toastRef) {
                  toastRef.onTap.subscribe(() => {
                    console.log('Toast tapped!');
                    this.navigateToRequestPage(patientData);
                  });
                }

                this.previousRequestIds.add(uniqueId);
              }
            }
          });
        });

        this.filteredPharmareq = flat;
      },
      error: (err) => {
        console.error('Error loading pharmareq:', err);
        this.filteredPharmareq = [];
      },
    });
  }

  // ... rest of your existing methods remain the same ...
  loadlowstock() {
    this.masterservice.getlowstockmedicine().subscribe({
      next: (res) => {
        if (res?.medicines?.length) {
          this.lowstock = res.medicines;
          this.lowstock = res.medicines.filter((med: any) => !this.isExpired(med));
          res.medicines.forEach((med: any) => {
            if (!this.shownLowStockIds.has(med._id)) {
              this.toastr.warning(
                `${med.medicine_name} is low in stock (${med.stock} units left)`,
                'Low Stock Alert',
                {
                  closeButton: true,
                  timeOut: 8000,
                  positionClass: 'toast-bottom-right',
                }
              );
              this.shownLowStockIds.add(med._id);
            }
          });
        } else {
          this.lowstock = [];
        }
      },
      error: (err) => {
        console.error('Error loading low stock:', err);
        this.lowstock = [];
      },
    });
  }

  isExpired(medicine: any): boolean {
    console.log('Checking medicine:', medicine.medicine_name, 'Expiry:', medicine.expiry_date);

    if (!medicine.expiry_date) return false;

    try {
      const expiryDate = new Date(medicine.expiry_date);
      const today = new Date();

      console.log('Parsed expiry date:', expiryDate);
      console.log('Today:', today);
      console.log('Is expired:', expiryDate < today);

      return expiryDate < today;
    } catch (error) {
      console.error('Error parsing date:', error);
      return false;
    }
  }

  isNearExpiry(medicine: any, daysThreshold: number = 30): boolean {
    if (!medicine.expiry_date) return false;

    try {
      const expiryDate = new Date(medicine.expiry_date);
      const today = new Date();
      const timeDiff = expiryDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      return daysDiff <= daysThreshold && daysDiff > 0;
    } catch (error) {
      return false;
    }
  }

  loadData() {
    this.doctor.getReferralData().subscribe((res) => {
      this.allData = res.rules || res.data || [];

      // ✅ Always get all pending payouts
      const pending = this.allData.filter(
        (p: any) => p.payoutApproved === false || p.payoutApproved === 'false'
      );

      // ✅ Show toast for NEW ones only (not previously notified)
      const newPending = pending.filter(
        (p: any) => !this.previousRequestIds.has(p._id)
      );

      for (const payout of newPending) {
        const toastId = `payout-toast-${payout._id}`;
        this.toastPatientMap.set(toastId, payout);

        this.toastr.warning(
          `<a href="#" id="${toastId}">Pending payout for ${
            payout.patient?.patient_name || 'a patient'
          } - ₹${payout.calculatedShare || '...'}</a>`,
          'Doctor Referral Payout Pending',
          {
            enableHtml: true,
            closeButton: true,
            timeOut: 10000,
            positionClass: 'toast-bottom-right',
          }
        );

        this.previousRequestIds.add(payout._id); // ✅ Mark as shown
      }

      // ✅ Always update this so bell shows full count
      this.pendingPayouts = pending;
      console.log("pending payouts", this.pendingPayouts);
    });
  }

  // ✅ Updated toggle method to handle radiology requests
 // ✅ Updated toggle method to handle radiology requests with proper routing
toggleRequestPanel() {
  // Handle radiology requests for radiology dashboard
  if (this.currentRoute === '/radiologylayout/radiologydashboard') {
    if (this.filteredRadiologyreq.length > 0) {
      // If multiple requests, show selection or navigate to first one
      if (this.filteredRadiologyreq.length === 1) {
        // Single request - navigate directly
        const request = this.filteredRadiologyreq[0];
        this.navigateToRadiologyPage(request);
      } else {
        // Multiple requests - show summary and navigate to first OPD, then IPD
        const opdRequests = this.filteredRadiologyreq.filter(req => req.sourceType === 'opd');
        const ipdRequests = this.filteredRadiologyreq.filter(req => req.sourceType === 'ipd');

        let message = '<b>Pending Radiology Requests:</b><br>';

        if (opdRequests.length > 0) {
          message += `<br><b>OPD Requests (${opdRequests.length}):</b><br>`;
          message += opdRequests.slice(0, 3).map((req: any, i: number) =>
            `${i + 1}. ${req.patientName} - ${req.requestedServices?.map((s: any) => s.serviceName).join(', ')}`
          ).join('<br>');
          if (opdRequests.length > 3) {
            message += `<br>... and ${opdRequests.length - 3} more OPD requests`;
          }
        }

        if (ipdRequests.length > 0) {
          message += `<br><br><b>IPD Requests (${ipdRequests.length}):</b><br>`;
          message += ipdRequests.slice(0, 3).map((req: any, i: number) =>
            `${i + 1}. ${req.patientName} (${req.bedNumber || 'No Bed'}) - ${req.requestedServices?.map((s: any) => s.serviceName).join(', ')}`
          ).join('<br>');
          if (ipdRequests.length > 3) {
            message += `<br>... and ${ipdRequests.length - 3} more IPD requests`;
          }
        }

        message += '<br><br>Click OK to view the first request.';

        this.toastr.info(message, 'Multiple Radiology Requests', {
          enableHtml: true,
          timeOut: 8000,
          positionClass: 'toast-top-center'
        });

        // Navigate to the first request (prioritize OPD, then IPD)
        const firstRequest = opdRequests.length > 0 ? opdRequests[0] : ipdRequests[0];
        if (firstRequest) {
          setTimeout(() => {
            this.navigateToRadiologyPage(firstRequest);
          }, 2000); // Give user time to read the message
        }
      }
      return;
    } else {
      this.toastr.info('No pending radiology requests.', 'Notification');
      return;
    }
  }

  // Handle pharmacy requests (existing logic)
  if (this.filteredPharmareq.length > 0) {
    const firstRequest = this.filteredPharmareq[0];
    this.navigateToRequestPage({
      ...firstRequest.fullPatient,
      request: firstRequest.request
    });
    return;
  }

  // Show alert if no requests
  const allCount = this.filteredPharmareq.length;
  const lowStockCount = this.lowstock.length;
  const radiologyCount = this.filteredRadiologyreq.length;

  if (allCount === 0 && lowStockCount === 0 && radiologyCount === 0) {
    this.toastr.info(
      'No pending requests or alerts.',
      'Notification'
    );
  }
}


  togglePayoutPanel() {
    const payoutCount = this.pendingPayouts.length;

    if (payoutCount === 0) {
      this.toastr.info('No pending payouts.', 'Notification');
      return;
    }

    let message = '';

    if (payoutCount > 0) {
      message = `<b>Pending Payouts alert:</b><br>`;
      message += this.pendingPayouts
        .map(
          (p, i) =>
            `${i + 1}. ${p.referredBy?.name || 'Patient'} - ₹${
              p.calculatedShare || '...'
            }`
        )
        .join('<br>');
    }

    this.toastr.info(message, '', {
      enableHtml: true,
      timeOut: 10000,
    });
  }

  // ... rest of your existing methods remain the same ...

  setupToastClickHandlers() {
    console.log('Setting up toast click handlers...'); // Debug log

    // Remove existing listeners to prevent duplicates
    document.removeEventListener('click', this.handleToastClick);

    // Add new listener with capture phase
    document.addEventListener('click', this.handleToastClick.bind(this), true);
  }

  handleToastClick = (event: Event) => {
    console.log('Click detected:', event.target); // Debug log

    const target = event.target as HTMLElement;

    if (target && target.classList.contains('toast-link')) {
      console.log('Toast link clicked!'); // Debug log

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      try {
        // ✅ Get toast ID and find patient data from map
        const toastId = target.getAttribute('data-toast-id');
        console.log('Toast ID:', toastId); // Debug log

        if (toastId && this.toastPatientMap.has(toastId)) {
          const patientData = this.toastPatientMap.get(toastId);
          console.log('Found patient data:', patientData); // Debug log

          // ✅ Navigate to the request page with patient data
          this.navigateToRequestPage(patientData);
        } else {
          console.error('No patient data found for toast ID:', toastId);
        }
      } catch (error) {
        console.error('Error handling toast click:', error);
      }
    }
  }

  navigateToRequestPage(patientData: any) {
    console.log('Navigating with patient data:', patientData);

    try {
      // ✅ Store patient data for the target component to use
      localStorage.setItem('selectedPatientRequest', JSON.stringify(patientData));
      console.log('Data stored in localStorage');

      // ✅ Close toasts before navigation
      this.toastr.clear();

      // ✅ Determine route based on patientType
      let targetRoute: string;

      // Check patientType from the request object
      const patientType = patientData?.request?.patientType?.toLowerCase();

      if (patientType === 'inpatientdepartment') {
        targetRoute = '/pharmalayout/ipdpharmainward';
        console.log('Navigating to IPD pharma inward for inpatient');
      } else {
        // Default to outpatient route for 'outpatientdepartment' or any other value
        targetRoute = '/pharmalayout/managepharmainward';
        console.log('Navigating to OPD pharma inward for outpatient');
      }

      // ✅ Navigate to the appropriate page
      this.router.navigate([targetRoute]).then(
        (success) => {
          if (success) {
            console.log('Navigation successful to:', targetRoute);
          } else {
            console.error('Navigation failed to:', targetRoute);
          }
        }
      ).catch(error => {
        console.error('Navigation error:', error);
      });

    } catch (error) {
      console.error('Error in navigateToRequestPage:', error);
    }
  }

  ngOnDestroy() {
    // ✅ Remove event listener when component is destroyed
    document.removeEventListener('click', this.handleToastClick, true);

    // Clear maps
    this.toastPatientMap.clear();
    this.radiologyToastMap.clear(); // Clear radiology map
    this.previousRequestIds.clear();
    this.previousRadiologyIds.clear(); // Clear radiology IDs
    this.shownLowStockIds.clear();
  }


  // ✅ Helper methods to get request counts by type
getOpdRequestCount(): number {
  return this.filteredRadiologyreq.filter(req => req.sourceType === 'opd').length;
}

getIpdRequestCount(): number {
  return this.filteredRadiologyreq.filter(req => req.sourceType === 'ipd').length;
}

// ✅ Method to get requests by type
getRequestsByType(type: 'opd' | 'ipd'): any[] {
  return this.filteredRadiologyreq.filter(req => req.sourceType === type);
}

}
