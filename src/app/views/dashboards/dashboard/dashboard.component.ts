import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

interface ModuleAction {
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  color: string;
  checkFunction?: () => void;
  accessCheck?: {
    module: string;
    action?: 'read' | 'create' | 'update' | 'delete';
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  // Dashboard statistics
  dashboardStats = {
    totalPatients: 1247,
    todayAppointments: 89,
    totalBeds: 150,
    availableBeds: 23,
    totalDoctors: 67,
    emergencyCases: 12,
  };

  // OPD Module Actions
  opdActions: ModuleAction[] = [
    {
      title: 'OPD Module',
      subtitle: 'Outpatients Management Que',
      icon: 'user-plus',
      route: '/opd/ui',
      color: '#dc2626',
      accessCheck: { module: 'outpatientCase', action: 'read' },
    },
    // {
    //   title: 'OPD Services',
    //   subtitle: 'Outpatient Services Bill List',
    //   icon: 'receipt',
    //   route: '/opd/listopbills',
    //   color: '#ca8a04',
    //   accessCheck: { module: 'outpatientBill', action: 'read' }
    // },
    // {
    //   title: 'Appointments',
    //   subtitle: 'Patient Appointments & Scheduling List',
    //   icon: 'calendar-alt',
    //   route: '/opd/opdappointmentlist',
    //   color: '#2563eb',
    //   accessCheck: { module: 'appointment', action: 'read' },
    // },
    // {
    //   title: 'Appointment Records',
    //   subtitle: 'Appointment History & Queue Management List',
    //   icon: 'calendar-check',
    //   route: '/opd/opdappointmentquelist',
    //   color: '#7c3aed',
    //   accessCheck: { module: 'appointment_record', action: 'read' },
    // },
    // {
    //   title: 'OPD Diagnosis',
    //   subtitle: 'Outpatient Diagnosis & Examination List',
    //   icon: 'stethoscope',
    //   route: '/opd/opddiagnosissheetlist',
    //   color: '#16a34a',
    //   accessCheck: { module: 'diagnosisSheet', action: 'read' }
    // },
    // {
    //   title: 'OPD Vitals',
    //   subtitle: 'Outpatient Vitals & Pulse Recording List',
    //   icon: 'lungs-virus',
    //   route: '/doctor/vitallist',
    //   color: '#9aac7dff',
    //   accessCheck: { module: 'vitals', action: 'read' }
    // },

    // ipd module
    {
      title: 'IPD Module',
      subtitle: 'Admitted Inpatients Management',
      icon: 'user-injured',
      route: '/ipd/ui',
      color: '#7c3aed',
      accessCheck: { module: 'inpatientCase', action: 'read' },
    },
    {
      title: 'Radiology Module',
      subtitle: 'Patients Radiology Management',
      icon: 'x-ray',
      route: '/radiologylayout/radiologydashboard',
      color: '#7c3aed',
      accessCheck: { module: 'radiologyRequestList', action: 'read' },
    },
    // pharmacy module
    {
      title: 'Pharmacy Module',
      subtitle: 'Pharmacy Management',
      icon: 'mortar-pestle',
      route: '/pharmalayout/pharmacydashboard',
      color: '#2b34adff',
      accessCheck: { module: 'pharmaceuticalInward', action: 'read' },
    },
    {
      title: 'Centeral Store Management',
      subtitle: 'Centeral Inventory  Management',
      icon: 'house-medical',
      route: '/inventorylayout/inventorylayout',
      color: '#3ab5caff',
      accessCheck: { module: 'inventoryItem', action: 'read' },
    },
    // {
    //   title: 'IPD Services',
    //   subtitle: 'Inpatient Services Bill List',
    //   icon: 'receipt',
    //   route: '/ipd/ipdbilllist',
    //   color: '#059669',
    //   accessCheck: { module: 'inpatientCase', action: 'read' }
    // },
    // {
    //   title: 'IPD Deposits',
    //   subtitle: 'Deposit Amount on Admission List',
    //   icon: 'cash-register',
    //   route: '/ipd/ipddepositlist',
    //   color: '#0891b2',
    //   accessCheck: { module: 'inpatientDeposit', action: 'read' }
    // },
    // {
    //   title: 'IPD Room Transfer',
    //   subtitle: 'Transfer of Patients from One Bed to Another when Need',
    //   icon: 'bed-pulse',
    //   route: '/ipd/ipdroomtransferlist',
    //   color: '#1332bbff',
    //   accessCheck: { module: 'inpatientRoomTransfer', action: 'read' }
    // },
    // {
    //   title: 'IPD Vitals',
    //   subtitle: 'Inpatient Vitals & Pulse Recording List',
    //   icon: 'lungs-virus',
    //   route: '/doctor/vitallist',
    //   color: '#9aac7dff',
    //   accessCheck: { module: 'vitals', action: 'read' }
    // },
    // {
    //   title: 'IPD Diagnosis',
    //   subtitle: 'Inpatient Diagnosis & Examination List',
    //   icon: 'pills',
    //   route: '/doctor/diagnosissheetlist',
    //   color: '#16a34a',
    //   accessCheck: { module: 'diagnosisSheet', action: 'read' }
    // },
    // {
    //   title: 'OT Entry',
    //   subtitle: 'Operation Documentation List',
    //   icon: 'pager',
    //   route: '/ipd/otsheetlist',
    //   color: '#6b7280',
    //   accessCheck: { module: 'oprationTheatresheet', action: 'read' }
    // },
    // {
    //   title: 'OT Sheet',
    //   subtitle: 'Operation Sheet List',
    //   icon: 'user-nurse',
    //   route: '/doctor/otnoteslist',
    //   color: '#4f46e5',
    //   accessCheck: { module: 'operationTheatreNotes', action: 'read' }
    // },
    // {
    //   title: 'IPD Discharge Summary',
    //   subtitle: 'Patients Summary List',
    //   icon: 'file-medical',
    //   route: '/ipd/ipddischargelist',
    //   color: '#bb8613ff',
    //   accessCheck: { module: 'dischargeSummary', action: 'read' }
    // },
    // {
    //   title: 'IPD Discharge',
    //   subtitle: 'Discharge Patients List',
    //   icon: 'id-card-clip',
    //   route: '/ipd/ipddischargelist',
    //   color: '#bb8613ff',
    //   accessCheck: { module: 'discharge', action: 'read' }
    // },
    // user mdoule
    {
      title: 'User Management',
      subtitle: 'Staff & user accounts',
      icon: 'users',
      route: '/master/usermasterlist',
      color: '#374151',
      accessCheck: { module: 'user', action: 'create' },
    },
    {
      title: 'Role Management',
      subtitle: 'User roles & permissions',
      icon: 'user-shield',
      route: '/setting/roleslist',
      color: '#1f2937',
      accessCheck: { module: 'roles', action: 'read' },
    },
    {
      title: 'Permission Control',
      subtitle: 'Access control management',
      icon: 'lock',
      route: '/setting/permissionlist',
      color: '#4b5563',
      accessCheck: { module: 'permissions', action: 'read' },
    },
    {
      title: 'Discount Management',
      subtitle: 'Pricing & discount control',
      icon: 'percent',
      route: '/ipd/discount',
      color: '#6b7280',
      accessCheck: { module: 'discountDashboard', action: 'read' },
    },
  ];

  // IPD Module Actions
  ipdActions: ModuleAction[] = [];

  // User Management Actions
  userActions: ModuleAction[] = [];

  isLoading = false;

  constructor(private router: Router) {}

  // Navigate to module
  navigateToModule(route: string): void {
    console.log(`Navigating to: ${route}`);
    this.router.navigate([route]);
  }

  // Refresh dashboard
  refreshDashboard(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      console.log('Dashboard refreshed');
    }, 1500);
  }

  // Get bed occupancy percentage
  getBedOccupancy(): number {
    return Math.round(
      ((this.dashboardStats.totalBeds - this.dashboardStats.availableBeds) /
        this.dashboardStats.totalBeds) *
        100
    );
  }

  // Check if user has module access
  hasModuleAccess(
    module: string,
    action: 'read' | 'create' | 'update' | 'delete' = 'read'
  ): boolean {
    try {
      const permissions = JSON.parse(
        localStorage.getItem('permissions') || '[]'
      );
      return permissions.some(
        (perm: any) =>
          perm.moduleName === module && perm.permissions?.[action] === 1
      );
    } catch (error) {
      console.error('Error parsing permissions from localStorage:', error);
      return false;
    }
  }

  // Get filtered OPD actions based on permissions
  getVisibleOpdActions(): ModuleAction[] {
    return this.opdActions.filter((action) => {
      if (!action.accessCheck) {
        return true; // Show if no access check defined
      }
      return this.hasModuleAccess(
        action.accessCheck.module,
        action.accessCheck.action || 'read'
      );
    });
  }

  // Get filtered IPD actions based on permissions
  getVisibleIpdActions(): ModuleAction[] {
    return this.ipdActions.filter((action) => {
      if (!action.accessCheck) {
        return true; // Show if no access check defined
      }
      return this.hasModuleAccess(
        action.accessCheck.module,
        action.accessCheck.action || 'read'
      );
    });
  }

  // Get filtered User actions based on permissions
  getVisibleUserActions(): ModuleAction[] {
    return this.userActions.filter((action) => {
      if (!action.accessCheck) {
        return true; // Show if no access check defined
      }
      return this.hasModuleAccess(
        action.accessCheck.module,
        action.accessCheck.action || 'read'
      );
    });
  }
}
