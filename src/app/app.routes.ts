import { OpdpharmadashboardComponent } from './viewspharma/opdpharmadashboard/opdpharmadashboard.component';
import { OpddashboardComponent } from './views/dashboards/opddashboard/opddashboard.component';
import { Routes } from '@angular/router';
import { AdminlayoutComponent } from './layout/adminlayout/adminlayout/adminlayout.component';
import { LoginComponent } from './authentication/login/login.component';
import { DashboardComponent } from './views/dashboards/dashboard/dashboard.component';
import { UhidComponent } from './views/uhid/uhid/uhid.component';
import { AddopdComponent } from './views/opdmodule/opd/addopd/addopd.component';
import { OpdcasesComponent } from './views/opdmodule/opd/opdcases/opdcases.component';
import { DaignonsissheetComponent } from './views/doctormodule/doctorsheets/daignonsissheet/daignonsissheet.component';
import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OpdbillComponent } from './views/opdmodule/opdbills/opdbill/opdbill.component';
import { OpdbilllistComponent } from './views/opdmodule/opdbills/opdbilllist/opdbilllist.component';
import { OpdmasterComponent } from './views/mastermodule/opdmastermodule/opdmaster/opdmaster.component';
import { OpdmasterserviceComponent } from './views/mastermodule/opdmastermodule/opdmasterservice/opdmasterservice.component';
import { OpdreportComponent } from './views/reports/opdreport/opdreport.component';
import { IpdreportComponent } from './views/reports/ipdreport/ipdreport.component';
import { PatholayoutComponent } from './layout/patholayout/patholayout.component';
import { PathodashboardComponent } from './viewspatho/pathodashboard/pathodashboard.component';
import { DoctormasterComponent } from './views/mastermodule/doctormaster/doctormaster/doctormaster.component';
import { DoctorlistComponent } from './views/mastermodule/doctormaster/doctorlist/doctorlist.component';
import { MrdComponent } from './views/opdmodule/mrd/mrd/mrd.component';
import { MrdlistComponent } from './views/opdmodule/mrd/mrdlist/mrdlist.component';
import { ReturnlistComponent } from './views/opdmodule/return/returnlist/returnlist.component';
import { MakereturnComponent } from './views/opdmodule/return/makereturn/makereturn.component';
import { DepositComponent } from './views/opdmodule/opddeposit/deposit/deposit.component';
import { DepositlistComponent } from './views/opdmodule/opddeposit/depositlist/depositlist.component';
import { OpdappointmentComponent } from './views/opdmodule/opdappointment/opdappointment/opdappointment.component';
import { OpdappointmentlistComponent } from './views/opdmodule/opdappointment/opdappointmentlist/opdappointmentlist.component';
import { IpdreturnComponent } from './views/ipdmodule/ipdreturn/ipdreturn/ipdreturn.component';
import { IpdreturnlistComponent } from './views/ipdmodule/ipdreturn/ipdreturnlist/ipdreturnlist.component';
import { IpddepositComponent } from './views/ipdmodule/ipddeposit/ipddeposit/ipddeposit.component';
import { IpddepositlistComponent } from './views/ipdmodule/ipddeposit/ipddepositlist/ipddepositlist.component';
import { IpdadmissionComponent } from './views/ipdmodule/ipdadmission/ipdadmission/ipdadmission.component';
import { AdmissionlistComponent } from './views/ipdmodule/ipdadmission/admissionlist/admissionlist.component';
import { IpdbillComponent } from './views/ipdmodule/ipdbill/ipdbill/ipdbill.component';
import { IpdbilllistComponent } from './views/ipdmodule/ipdbill/ipdbilllist/ipdbilllist.component';
import { RoomtransferComponent } from './views/ipdmodule/ipdroomtransfer/roomtransfer/roomtransfer.component';
import { RoomtransferlistComponent } from './views/ipdmodule/ipdroomtransfer/roomtransferlist/roomtransferlist.component';
import { IntermbillComponent } from './views/ipdmodule/intermbill/intermbill/intermbill.component';
import { FinalbillComponent } from './views/ipdmodule/finalbill/finalbill/finalbill.component';
import { MasteripdserviceComponent } from './views/mastermodule/ipdservicemaster/masteripdservice/masteripdservice.component';
import { MasteripdservicelistComponent } from './views/mastermodule/ipdservicemaster/masteripdservicelist/masteripdservicelist.component';
import { IpddischargeComponent } from './views/ipdmodule/ipddischarge/ipddischarge/ipddischarge.component';
import { IpddischargelistComponent } from './views/ipdmodule/ipddischarge/ipddischargelist/ipddischargelist.component';
import { OtsheetComponent } from './views/ipdmodule/otsheetmodule/otsheet/otsheet.component';
import { OtsheetlistComponent } from './views/ipdmodule/otsheetmodule/otsheetlist/otsheetlist.component';
import { OtnotesComponent } from './views/doctormodule/otnotes/otnotes/otnotes.component';
import { OtnoteslistComponent } from './views/doctormodule/otnotes/otnoteslist/otnoteslist.component';
import { VitalsComponent } from './views/doctormodule/vitalsmodule/vitals/vitals.component';
import { VitalslistComponent } from './views/doctormodule/vitalsmodule/vitalslist/vitalslist.component';
import { PharmacyreqComponent } from './views/doctormodule/pharmacymodule/pharmacyreq/pharmacyreq.component';
import { MedpackageeComponent } from './views/doctormodule/pharmacymodule/medpackagee/medpackagee.component';
import { PharmareqlistComponent } from './views/doctormodule/pharmacymodule/pharmareqlist/pharmareqlist.component';
import { RadiologyreqComponent } from './views/doctormodule/radiologymodule/radiologyreq/radiologyreq.component';
import { RadiologyreqlistComponent } from './views/doctormodule/radiologymodule/radiologyreqlist/radiologyreqlist.component';
import { PathologyreqComponent } from './views/doctormodule/pathologymodule/pathologyreq/pathologyreq.component';
import { PathologyreqlistComponent } from './views/doctormodule/pathologymodule/pathologyreqlist/pathologyreqlist.component';
import { PathologyresultComponent } from './views/doctormodule/pathologymodule/pathologyresult/pathologyresult.component';
import { TreatmentordersheetComponent } from './views/doctormodule/treatmentordermodule/treatmentordersheet/treatmentordersheet.component';
import { TreatmentlistComponent } from './views/doctormodule/treatmentordermodule/treatmentlist/treatmentlist.component';
import { PharmalayoutComponent } from './layout/pharmalayout/pharmalayout.component';
import { PharmadashboardComponent } from './viewspharma/pharmadashboard/pharmadashboard.component';
import { RadiolayoutComponent } from './layout/radiolayout/radiolayout.component';
import { RadiodashboardComponent } from './viewsradio/radiodashboard/radiodashboard.component';
import { ReportsComponent } from './views/reports/reports/reports.component';
import { UsermasterComponent } from './views/mastermodule/usermaster/usermaster/usermaster.component';
import { UsermasterlistComponent } from './views/mastermodule/usermaster/usermasterlist/usermasterlist.component';
import { IpdmasterserviceComponent } from './views/mastermodule/ipdservicemaster/ipdmasterservice/ipdmasterservice.component';

import { ServicegroupComponent } from './views/mastermodule/servicegroup/servicegroup/servicegroup.component';
import { ServicegrouplistComponent } from './views/mastermodule/servicegroup/servicegrouplist/servicegrouplist.component';
import { OpdmasterchargeComponent } from './views/mastermodule/opdmastermodule/opdmastercharge/opdmastercharge.component';
import { OpdmasterchargelistComponent } from './views/mastermodule/opdmastermodule/opdmasterchargelist/opdmasterchargelist.component';
import { MasteripdchargrComponent } from './views/mastermodule/ipdservicemaster/ipdchargemodule/masteripdchargr/masteripdchargr.component';
import { MasteripdchargelistComponent } from './views/mastermodule/ipdservicemaster/ipdchargemodule/masteripdchargelist/masteripdchargelist.component';
import { RadiationlayoutComponent } from './layout/radiationlayout/radiationlayout.component';
import { RadiationdashboardComponent } from './viewsradiation/radiationdashboard/radiationdashboard.component';
import { ManageinwardComponent } from './viewspatho/manageinward/manageinward.component';
import { SuperadminlayoutComponent } from './layout/superadminlayout/superadminlayout.component';
import { HospitaladminComponent } from './layout/hospitaladmin/hospitaladmin.component';
import { PatientInfoComponentComponent } from './component/opdcustomfiles/patient-info-component/patient-info-component.component';
import { OpdpharmareqComponent } from './views/doctormodule/pharmacymodule/opdpharmacyreq/opdpharmareq/opdpharmareq.component';
import { OpdpharmareqlistComponent } from './views/doctormodule/pharmacymodule/opdpharmacyreq/opdpharmareqlist/opdpharmareqlist.component';
import { authGuard } from './authentication/authguard/auth.guard';
import { loginGuard } from './authentication/loginguard/login.guard';
import { OpdappointmentfollowupComponent } from './views/opdmodule/opdappointment/opdappointmentfollowup/opdappointmentfollowup.component';
import { InventorydashboardComponent } from './viewspharma/purchase order management/inventorydashboard/inventorydashboard.component';
import { StockmanagementlayoutComponent } from './layout/stockmanagementlayout/stockmanagementlayout.component';
import { VendorquotationComponent } from './viewspharma/purchase order management/vendor/vendorquotation/vendorquotation.component';
import { DiscountpolicyComponent } from './views/mastermodule/discountpolicy/discountpolicy.component';
import { DiscountpolicylistComponent } from './views/mastermodule/discountpolicylist/discountpolicylist.component';
import { superadminGuard } from './authentication/superadmin.guard';
import { hospitaladminGuard } from './authentication/hospitaladminguard/hospitaladmin.guard';
import { ApikeymanagmentComponent } from './superadminviews/apikeymanagment/apikeymanagment.component';
import { PharmacydashboardComponent } from './viewspharma/apharmacydashboard/pharmacydashboard/pharmacydashboard.component';
import { AradiologydashboardComponent } from './viewsradio/aradiologydashboard/aradiologydashboard.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'vendorquotation/:rfqId/:vendorId',
    loadComponent: () =>
      import(
        './viewspharma/purchase order management/vendor/vendorquotation/vendorquotation.component'
      ).then((m) => m.VendorquotationComponent),
  },

  {
    path: '',
    component: AdminlayoutComponent,
    children: [
      {
        path: 'dashboard',
        canActivate: [loginGuard], // ✅ Only checks login
        loadComponent: () =>
          import('./views/dashboards/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        data: {
          title: 'Dashboard',
        },
      },
      {
        path: 'opddashboard',
        canActivate: [loginGuard], // ✅ Same here
        loadComponent: () =>
          import('./views/dashboards/opddashboard/opddashboard.component').then(
            (m) => m.OpddashboardComponent
          ),
        data: {
          title: 'Dashboard',
        },
      },

      // {path: 'userrolemanagement',loadComponent : () => import('./superadminviews/userrolemanagement/userrole/userrole.component').then( m => m.UserroleComponent)},

      { path: 'patient-info', component: PatientInfoComponentComponent },
      {
        path: 'uhid',
        loadComponent: () =>
          import('./views/uhid/uhid/uhid.component').then(
            (m) => m.UhidComponent
          ),
        data: { module: 'uhid' },
        canActivate: [authGuard],
        // component: UhidComponent
      },
      {
        path: 'adduhid',
        loadComponent: () =>
          import('./views/uhid/adduhid/adduhid.component').then(
            (m) => m.AdduhidComponent
          ),
        data: { module: 'uhid' },
        canActivate: [authGuard],
      },
      {
        path: 'patientsummary',
        loadComponent: () =>
          import(
            './views/opdmodule/patientsummary/patientsummary.component'
          ).then((m) => m.PatientsummaryComponent),
        data: { module: 'outpatientCase' },
        canActivate: [authGuard],
      },
      {
        path: 'ipdpatientsummary',
        loadComponent: () =>
          import(
            './views/ipdmodule/ipdpatientsummary/ipdpatientsummary.component'
          ).then((m) => m.IpdpatientsummaryComponent),
      },
      {
        path: 'ipdpatientsummarychart',
        loadComponent: () =>
          import(
            './views/ipdmodule/indoordischargesummary/indoordischargesummary.component'
          ).then((m) => m.IndoordischargesummaryComponent),
      },
      {
        path: 'opd',
        children: [
          {
            path: 'ui',
            loadComponent: () =>
              import('./views/opdmodule/aopdui/aopdui.component').then(
                (m) => m.AopduiComponent
              ),
            // component: AddopdComponent
            data: { module: 'outpatientCase' },
            canActivate: [authGuard],
          },
          {
            path: 'opd',
            loadComponent: () =>
              import('./views/opdmodule/opd/addopd/addopd.component').then(
                (m) => m.AddopdComponent
              ),
            // component: AddopdComponent
            data: { module: 'outpatientCase' },
            canActivate: [authGuard],
          },
          {
            path: 'opdmedicolegalcase',
            loadComponent: () =>
              import(
                './views/medicolegalcase/opd-medico-legal-case/opd-medico-legal-case.component'
              ).then((m) => m.OpdMedicoLegalCaseComponent),
          },
          {
            path: 'opdcases',
            loadComponent: () =>
              import('./views/opdmodule/opd/opdcases/opdcases.component').then(
                (m) => m.OpdcasesComponent
              ),
            // component : OpdcasesComponent
            data: { module: 'outpatientCase' },
            canActivate: [authGuard],
          },
          {
            path: 'opdcases/patientdetails',
            loadComponent: () =>
              import(
                './component/opdcustomfiles/patientdeatails/patientdeatails.component'
              ).then((M) => M.PatientdeatailsComponent),
          },
          {
            path: 'opdcases/patientsummary',
            loadComponent: () =>
              import(
                './component/opdcustomfiles/patientsummary/patientsummary.component'
              ).then((m) => m.PatientsummaryComponent),
          },
          {
            path: 'opdbill',
            loadComponent: () =>
              import(
                './views/opdmodule/opdbills/opdbill/opdbill.component'
              ).then((m) => m.OpdbillComponent),
            // component: OpdbillComponent
            data: { module: 'outpatientBill' },
            canActivate: [authGuard],
          },
          {
            path: 'case',
            loadComponent: () =>
              import(
                './views/opdmodule/opdbills/opdbill/opdbill.component'
              ).then((m) => m.OpdbillComponent),
            // component: OpdbillComponent
            data: { module: 'outpatientBill' },
            canActivate: [authGuard],
          },
          { path: 'opdbill/:id', component: OpdbillComponent },
          {
            path: 'listopbills',
            component: OpdbilllistComponent,
            data: { module: 'outpatientBill' },
            canActivate: [authGuard],
          },
          {
            path: 'mrd',
            component: MrdComponent,
          },
          {
            path: 'mrdlist',
            component: MrdlistComponent,
          },
          {
            path: 'return',
            component: MakereturnComponent,
          },
          {
            path: 'returnlist',
            component: ReturnlistComponent,
          },
          {
            path: 'deposit',
            component: DepositComponent,
            data: { module: 'outpatientDeposit' },
            canActivate: [authGuard],
          },
          {
            path: 'depositlist',
            component: DepositlistComponent,
            data: { module: 'outpatientDeposit' },
            canActivate: [authGuard],
          },
          {
            path: 'opdappointment',
            component: OpdappointmentComponent,
            data: { module: 'appointment' },
            canActivate: [authGuard],
          },
          {
            path: 'opdappointmentlist',
            component: OpdappointmentlistComponent,
            data: { module: 'appointment' },
            canActivate: [authGuard],
          },
          {
            path: 'opdappointmentfollowup',
            component: OpdappointmentfollowupComponent,
            data: { module: 'appointment' },
            canActivate: [authGuard],
          },
          {
            path: 'opdappointmentquelist',
            loadComponent: () =>
              import(
                './views/opdmodule/opdappointment/opdappointmentquelist/opdappointmentquelist.component'
              ).then((m) => m.OpdappointmentquelistComponent),
          },
          {
            path: 'opddiagnosissheet',
            loadComponent: () =>
              import(
                './views/opdmodule/diagnosis/diagnosis/diagnosis.component'
              ).then((m) => m.DiagnosisComponent),
          },
          {
            path: 'opddiagnosissheetlist',
            loadComponent: () =>
              import(
                './views/opdmodule/diagnosis/diagnosislist/diagnosislist.component'
              ).then((m) => m.DiagnosislistComponent),
          },
        ],
      },
      {
        path: 'ipd',
        children: [
          {
            path: 'ui',
            loadComponent: () =>
              import('./views/ipdmodule/ipdui/ipdui.component').then(
                (m) => m.IpduiComponent
              ),
          },
          {
            path: 'ipdreturn',
            component: IpdreturnComponent,
          },
          {
            path: 'ipdreturnlist',
            component: IpdreturnlistComponent,
          },
          {
            path: 'ipddeposit',
            component: IpddepositComponent,
            data: { module: 'inpatientDeposit' },
            canActivate: [authGuard],
          },
          {
            path: 'ipddepositlist',
            component: IpddepositlistComponent,
            data: { module: 'inpatientDeposit' },
            canActivate: [authGuard],
          },
          {
            path: 'ipdadmission',
            component: IpdadmissionComponent,
            data: { module: 'inpatientCase' },
            canActivate: [authGuard],
          },
          {
            path: 'inpatientsummarychart',
            loadComponent: () =>
              import(
                './views/ipdmodule/indoorpatientsummary/indoorpatientsummary.component'
              ).then((m) => m.IndoorpatientsummaryComponent),
          },
          {
            path: 'drwiseadmission',
            loadComponent: () =>
              import(
                './views/ipdmodule/drwiseadmission/drwiseadmission.component'
              ).then((m) => m.DrwiseadmissionComponent),
          },
          {
            path: 'patientaccountinfo',
            loadComponent: () =>
              import(
                './views/ipdmodule/patientaccountinfo/patientaccountinfo.component'
              ).then((m) => m.PatientaccountinfoComponent),
          },
          {
            path: 'patientdietchart',
            loadComponent: () =>
              import(
                './views/ipdmodule/bedwisedietchart/bedwisedietchart.component'
              ).then((m) => m.BedwisedietchartComponent),
          },
          {
            path: 'dietchart',
            loadComponent: () =>
              import(
                './views/ipdmodule/dietchart/dietchart/dietchart.component'
              ).then((m) => m.DietchartComponent),
          },
          {
            path: 'ipdmedicolegalcase',
            loadComponent: () =>
              import(
                './views/medicolegalcase/ipd-medico-legal-case/ipd-medico-legal-case.component'
              ).then((m) => m.IpdMedicoLegalCaseComponent),
          },
          {
            path: 'ipdadmissionlist',
            component: AdmissionlistComponent,
            data: { module: 'inpatientCase' },
            canActivate: [authGuard],
          },
          {
            path: 'ipdbill',
            component: IpdbillComponent,
            data: { module: 'inpatientBilling' },
            canActivate: [authGuard],
          },
          {
            path: 'ipdbilllist',
            component: IpdbilllistComponent,
            data: { module: 'inpatientBilling' },
            canActivate: [authGuard],
          },
          {
            path: 'ipdroomtransfer',
            component: RoomtransferComponent,
          },
          {
            path: 'ipdroomtransferlist',
            component: RoomtransferlistComponent,
          },
          {
            path: 'treatmentsheet',
            loadComponent: () =>
              import(
                './views/ipdmodule/treatmentsheet/treatmentsheet/treatmentsheet.component'
              ).then((m) => m.TreatmentsheetComponent),
            data: { module: 'treatmentSheet' },
            canActivate: [authGuard],
          },
          {
            path: 'treatmentsheetlist',
            loadComponent: () =>
              import(
                './views/ipdmodule/treatmentsheet/treatmentsheetlist/treatmentsheetlist.component'
              ).then((m) => m.TreatmentsheetlistComponent),
            data: { module: 'treatmentSheet' },
            canActivate: [authGuard],
          },
          {
            path: 'dailyprogressreport',
            loadComponent: () =>
              import(
                './views/ipdmodule/dailyProgressReport/dailyprogressreport/dailyprogressreport.component'
              ).then((m) => m.DailyprogressreportComponent),
            data: { module: 'dailyProgressReport' },
            canActivate: [authGuard],
          },
          {
            path: 'ipddischarge',
            component: IpddischargeComponent,
            data: { module: 'discharge' },
            canActivate: [authGuard],
          },
          {
            path: 'ipddischargelist',
            component: IpddischargelistComponent,
            data: { module: 'discharge' },
            canActivate: [authGuard],
          },
          {
            path: 'intermbill',
            component: IntermbillComponent,
            data: { module: 'inpatientIntermBill' },
            canActivate: [authGuard],
          },
          {
            path: 'finalbill',
            component: FinalbillComponent,
          },
          {
            path: 'otsheet',
            component: OtsheetComponent,
            data: { module: 'oprationTheatresheet' },
            canActivate: [authGuard],
          },
          {
            path: 'otcharge',
            loadComponent : () => import('./views/ipdmodule/otsheetmodule/operationcharge/operationcharge.component').then( m => m.OperationchargeComponent),
            data: { module: 'oprationTheatresheet' },
            canActivate: [authGuard],
          },
          {
            path: 'otsheetlist',
            component: OtsheetlistComponent,
            data: { module: 'oprationTheatresheet' },
            canActivate: [authGuard],
          },
          {
            path: 'discount',
            loadComponent: () =>
              import('./views/discount/discount.component').then(
                (M) => M.DiscountComponent
              ),
          },
          {
            path: 'tpa',
            loadComponent: () =>
              import('./views/ipdmodule/tpa/tpa.component').then(
                (m) => m.TpaComponent
              ),
            data: { module: 'thirdPartyAdministrator' },
            canActivate: [authGuard],
          },
          {
            path: 'tpalist',
            loadComponent: () =>
              import(
                './views/ipdmodule/tpa/tpalist/tpalist/tpalist.component'
              ).then((m) => m.TpalistComponent),
            data: { module: 'thirdPartyAdministrator' },
            canActivate: [authGuard],
          },
        ],
      },
      {
        path: 'doctor',
        children: [
          {
            path: 'ui',
            loadComponent: () =>
              import('./views/doctormodule/doctorui/doctorui.component').then(
                (m) => m.DoctoruiComponent
              ),
          },
          {
            path: 'daignosissheet',
            component: DaignonsissheetComponent,
            data: { module: 'diagnosisSheet' },
            canActivate: [authGuard],
          },
          {
            path: 'diagnosissheetlist',
            loadComponent: () =>
              import(
                './views/doctormodule/doctorsheets/diagnosissheetlist/diagnosissheetlist.component'
              ).then((m) => m.DiagnosissheetlistComponent),
            data: { module: 'diagnosisSheet' },
            canActivate: [authGuard],
          },
          {
            path: 'dischargesummaryreport',
            loadComponent: () =>
              import(
                './views/doctormodule/dischargesummaryreport/dischargesummaryreport.component'
              ).then((m) => m.DischargesummaryreportComponent),
          },
          {
            path: 'doctordischarge',
            loadComponent: () =>
              import(
                './views/doctormodule/doctordischargesummary/doctordischargesummary.component'
              ).then((m) => m.DoctordischargesummaryComponent),
            data: { module: 'dischargeSummary' },
            canActivate: [authGuard],
          },
          {
            path: 'doctordischargelist',
            loadComponent: () =>
              import(
                './views/doctormodule/doctordischargesummarylist/doctordischargesummarylist.component'
              ).then((m) => m.DoctordischargesummarylistComponent),
            data: { module: 'dischargeSummary' },
            canActivate: [authGuard],
          },
          {
            path: 'otnotes',
            component: OtnotesComponent,
            data: { module: 'operationTheatreNotes' },
            canActivate: [authGuard],
          },
          {
            path: 'otnoteslist',
            component: OtnoteslistComponent,
            data: { module: 'operationTheatreNotes' },
            canActivate: [authGuard],
          },
          {
            path: 'vitals',
            component: VitalsComponent,
            data: { module: 'vitals' },
            canActivate: [authGuard],
          },
          {
            path: 'vitallist',
            component: VitalslistComponent,
          },
          {
            path: 'pharmareq',
            component: PharmacyreqComponent,
            data: { module: 'pharmaceuticalRequestList' },
            canActivate: [authGuard],
          },
          {
            path: 'opdpharmareq',
            component: OpdpharmareqComponent,
            data: { module: 'pharmaceuticalRequestList' },
            canActivate: [authGuard],
          },
          {
            path: 'opdpharmareqlist',
            component: OpdpharmareqlistComponent,
            data: { module: 'pharmaceuticalRequestList' },
            canActivate: [authGuard],
          },
          {
            path: 'pharmareqlist',
            component: PharmareqlistComponent,
            data: { module: 'pharmaceuticalRequestList' },
            canActivate: [authGuard],
          },
          {
            path: 'medpackage',
            component: MedpackageeComponent,
          },
          {
            path: 'medpackagelist',
            loadComponent: () =>
              import(
                './views/doctormodule/pharmacymodule/medpackagelist/medpackagelist.component'
              ).then((m) => m.MedpackagelistComponent),
          },
          {
            path: 'radiologyreq',
            component: RadiologyreqComponent,
            data: { module: 'departmentRequestList' },
            canActivate: [authGuard],
          },
          {
            path: 'radiologyreqlist',
            component: RadiologyreqlistComponent,
            data: { module: 'departmentRequestList' },
            canActivate: [authGuard],
          },
          {
            path: 'opdradiologyreq',
            loadComponent: () =>
              import(
                './views/doctormodule/radiologymodule/radiologyreqopd/radiologyreqopd/radiologyreqopd.component'
              ).then((m) => m.RadiologyreqopdComponent),
            data: { module: 'departmentRequestList' },
            canActivate: [authGuard],
          },
          {
            path: 'opdradiologyreqlist',
            loadComponent: () =>
              import(
                './views/doctormodule/radiologymodule/radiologyreqopd/radiologyreqopdlist/radiologyreqopdlist.component'
              ).then((m) => m.RadiologyreqopdlistComponent),
            data: { module: 'departmentRequestList' },
            canActivate: [authGuard],
          },
          {
            path: 'pathologyreq',
            component: PathologyreqComponent,
            data: { module: 'departmentRequestList' },
            canActivate: [authGuard],
          },
          {
            path: 'pathologyreqlist',
            component: PathologyreqlistComponent,
            data: { module: 'departmentRequestList' },
            canActivate: [authGuard],
          },
          {
            path: 'opdpathologyreq',
            loadComponent: () =>
              import(
                './views/doctormodule/pathologymodule/opdpathoreq/opdpathologyreq/opdpathologyreq.component'
              ).then((m) => m.OpdpathologyreqComponent),
            data: { module: 'departmentRequestList' },
            canActivate: [authGuard],
          },
          {
            path: 'opdpathologyreqlist',
            loadComponent: () =>
              import(
                './views/doctormodule/pathologymodule/opdpathoreq/opdpathologyreqlist/opdpathologyreqlist.component'
              ).then((m) => m.OpdpathologyreqlistComponent),
            data: { module: 'departmentRequestList' },
            canActivate: [authGuard],
          },
          {
            path: 'pathologyresult',
            component: PathologyresultComponent,
            data: { module: 'departmentRequestList' },
            canActivate: [authGuard],
          },
          {
            path: 'tretmentordersheet',
            component: TreatmentordersheetComponent,
            data: { module: 'treatmentHistorySheet' },
            canActivate: [authGuard],
          },
          {
            path: 'treatmentlist',
            component: TreatmentlistComponent,
            data: { module: 'treatmentHistorySheet' },
            canActivate: [authGuard],
          },
          {
            path: 'radiationreq',
            loadComponent: () =>
              import(
                './views/doctormodule/radiation/radiationreq/radiationreq.component'
              ).then((m) => m.RadiationreqComponent),
            data: { module: 'departmentRequestList' },
            canActivate: [authGuard],
          },
          {
            path: 'radiationreqlist',
            loadComponent: () =>
              import(
                './views/doctormodule/radiation/radiationreqlist/radiationreqlist.component'
              ).then((m) => m.RadiationreqlistComponent),
            data: { module: 'departmentRequestList' },
            canActivate: [authGuard],
          },
          {
            path: 'chemotherapy',
            loadComponent: () =>
              import(
                './views/doctormodule/chemotherapymodule/chemotherapy/chemotherapy.component'
              ).then((m) => m.ChemotherapyComponent),
          },
          {
            path: 'chemotherapylist',
            loadComponent: () =>
              import(
                './views/doctormodule/chemotherapymodule/chemotherapylist/chemotherapylist.component'
              ).then((m) => m.ChemotherapylistComponent),
          },
          {
            path: 'radiationdischarge',
            loadComponent: () =>
              import(
                './views/doctormodule/radiation/raidationdischarge/raidationdischarge.component'
              ).then((m) => m.RaidationdischargeComponent),
          },
          {
            path: 'radiationdischargelist',
            loadComponent: () =>
              import(
                './views/doctormodule/radiation/raidationdischargelist/raidationdischargelist.component'
              ).then((m) => m.RaidationdischargelistComponent),
          },
        ],
      },
      {
        path: 'master',
        children: [
          {
            path: 'ui',
            loadComponent: () =>
              import(
                './views/mastermodule/masteruipage/masteruipage.component'
              ).then((m) => m.MasteruipageComponent),
            // canActivate: [authGuard],
          },
          {
            path: 'opdservice',
            component: OpdmasterComponent,
            canActivate: [authGuard],
            data: { module: 'service' },
          },
          {
            path: 'opdmasterservice',
            component: OpdmasterserviceComponent,
            canActivate: [authGuard],
            data: { module: 'service' },
          },
          {
            path: 'masteropdcharge',
            component: OpdmasterchargeComponent,
            canActivate: [authGuard],
            data: { module: 'serviceGroup' },
          },
          {
            path: 'masteropdchargelist',
            component: OpdmasterchargelistComponent,
            canActivate: [authGuard],
            data: { module: 'serviceGroup' },
          },
          {
            path: 'doctormaster',
            component: DoctormasterComponent,
            canActivate: [authGuard],
            data: { module: 'doctor' },
          },
          {
            path: 'doctorlist',
            component: DoctorlistComponent,
            canActivate: [authGuard],
            data: { module: 'doctor' },
          },
          {
            path: 'masteripdservice',
            component: IpdmasterserviceComponent,
          },
          {
            path: 'masteripdservicelist',
            component: MasteripdservicelistComponent,
          },
          {
            path: 'masteripdcharge',
            component: MasteripdchargrComponent,
          },
          {
            path: 'masteripdchargelist',
            component: MasteripdchargelistComponent,
          },
          {
            path: 'usermaster',
            component: UsermasterComponent,
            canActivate: [authGuard],
            data: { module: 'user' },
          },
          {
            path: 'usermasterlist',
            component: UsermasterlistComponent,
            canActivate: [authGuard],
            data: { module: 'user' },
          },

          // bed management starts here:
          {
            path: 'bedtypemaster',
            loadComponent: () =>
              import(
                './views/mastermodule/bedmanagement/bedtypemaster/bedtypemaster/bedtypemaster.component'
              ).then((m) => m.BedtypemasterComponent),
            canActivate: [authGuard],
            data: { module: 'bedType' },
          },
          {
            path: 'bedtypemasterlist',
            loadComponent: () =>
              import(
                './views/mastermodule/bedmanagement/bedtypemaster/bedtypemasterlist/bedtypemasterlist.component'
              ).then((m) => m.BedtypemasterlistComponent),
            canActivate: [authGuard],
            data: { module: 'bedType' },
          },
          {
            path: 'bedmaster',
            loadComponent: () =>
              import(
                './views/mastermodule/bedmanagement/bedmaster/bedmaster/bedmaster.component'
              ).then((m) => m.BedmasterComponent),
            canActivate: [authGuard],
            data: { module: 'bed' },
          },
          {
            path: 'bedmasterlist',
            loadComponent: () =>
              import(
                './views/mastermodule/bedmanagement/bedmaster/bedmasterlist/bedmasterlist.component'
              ).then((m) => m.BedmasterlistComponent),
            canActivate: [authGuard],
            data: { module: 'bed' },
          },
          {
            path: 'roomtypemaster',
            loadComponent: () =>
              import(
                './views/mastermodule/bedmanagement/roomtypemaster/roomtypemaster/roomtypemaster.component'
              ).then((m) => m.RoomtypemasterComponent),
            canActivate: [authGuard],
            data: { module: 'roomType' },
          },
          {
            path: 'roomtypemasterlist',
            loadComponent: () =>
              import(
                './views/mastermodule/bedmanagement/roomtypemaster/roomtypemasterlist/roomtypemasterlist.component'
              ).then((m) => m.RoomtypemasterlistComponent),
            canActivate: [authGuard],
            data: { module: 'roomType' },
          },

          {
            path: 'roommaster',
            loadComponent: () =>
              import(
                './views/mastermodule/bedmanagement/roommaster/roommaster/roommaster.component'
              ).then((m) => m.RoommasterComponent),
            // component: RoommasterComponent
            canActivate: [authGuard],
            data: { module: 'room' },
          },
          {
            path: 'roommasterlist',
            // component: RoommasterlistComponent
            loadComponent: () =>
              import(
                './views/mastermodule/bedmanagement/roommaster/roommasterlist/roommasterlist.component'
              ).then((m) => m.RoommasterlistComponent),
            canActivate: [authGuard],
            data: { module: 'room' },
          },
          {
            path: 'wardmaster',
            loadComponent: () =>
              import(
                './views/mastermodule/bedmanagement/wardmaster/wardmaster/wardmaster.component'
              ).then((m) => m.WardmasterComponent),
            // component: RoommasterComponent
            canActivate: [authGuard],
            data: { module: 'wardMaster' },
          },
          {
            path: 'wardmasterlist',
            // component: RoommasterlistComponent
            loadComponent: () =>
              import(
                './views/mastermodule/bedmanagement/wardmaster/wardmasterlist/wardmasterlist.component'
              ).then((m) => m.WardmasterlistComponent),
            canActivate: [authGuard],
            data: { module: 'wardMaster' },
          },
          {
            path: 'company',
            loadComponent: () =>
              import(
                './views/mastermodule/companymaster/companymaster/companymaster.component'
              ).then((m) => m.CompanymasterComponent),
          },

          {
            path: 'servicegroupmaster',
            component: ServicegroupComponent,
          },
          {
            path: 'servicegroupmasterlist',
            component: ServicegrouplistComponent,
          },
          {
            path: 'visittypemaster',
            loadComponent : () => import ('./views/mastermodule/visitmaster/visittypemaster/visittypemaster.component').then( m => m.VisittypemasterComponent),
            canActivate: [authGuard],
            data: {module: 'visittypemaster'}
          },
          {
            path: 'visittypemasterlist',
            loadComponent : () => import ('./views/mastermodule/visitmaster/visitmasterlist/visitmasterlist.component').then( m => m.VisitmasterlistComponent),
            canActivate: [authGuard],
            data: {module: 'visittypemaster'}
          },
          {
            path: 'visitmaster',
            loadComponent : () => import ('./views/mastermodule/visitmaster/visit-master-modal/visit-master-modal.component').then( m => m.VisitMasterModalComponent),
            canActivate: [authGuard],
            data: {module: 'visittypemaster'}
          },

          {
            path: 'medicinemaster',
            loadComponent: () =>
              import(
                './views/mastermodule/medicinemaster/medicinemaster/medicinemaster.component'
              ).then((m) => m.MedicinemasterComponent),
            canActivate: [authGuard],
            data: { module: 'medicine' },
          },
          {
            path: 'medicinemasterlist',
            loadComponent: () =>
              import(
                './views/mastermodule/medicinemaster/medicinemasterlist/medicinemasterlist.component'
              ).then((m) => m.MedicinemasterlistComponent),
            canActivate: [authGuard],
            data: { module: 'medicine' },
          },
          {
            path: 'medicaltestgroup',
            loadComponent: () =>
              import(
                './views/mastermodule/medicaltestmodule/medicaltestgroup/medicaltestgroup/medicaltestgroup.component'
              ).then((m) => m.MedicaltestgroupComponent),
            canActivate: [authGuard],
            data: { module: 'testGroup' },
          },
          {
            path: 'medicaltestgrouplist',
            loadComponent: () =>
              import(
                './views/mastermodule/medicaltestmodule/medicaltestgroup/medicaltestgrouplist/medicaltestgrouplist.component'
              ).then((m) => m.MedicaltestgrouplistComponent),
            canActivate: [authGuard],
            data: { module: 'testGroup' },
          },
          {
            path: 'medicaltest',
            loadComponent: () =>
              import(
                './views/mastermodule/medicaltestmodule/medicaltest/medicaltest.component'
              ).then((m) => m.MedicaltestComponent),
            canActivate: [authGuard],
            data: { module: 'testParameter' },
          },

          {
            path: 'medicaltestlist',
            loadComponent: () =>
              import(
                './views/mastermodule/medicaltestmodule/medicaltestlist/medicaltestlist.component'
              ).then((m) => m.MedicaltestlistComponent),
            canActivate: [authGuard],
            data: { module: 'testParameter' },
          },
          {
            path: 'symptoms',
            loadComponent: () =>
              import(
                './views/mastermodule/symptomsmaster/symptoms/symptoms.component'
              ).then((m) => m.SymptomsComponent),
            canActivate: [authGuard],
            data: { module: 'symptoms' },
          },
          {
            path: 'symptomslist',
            loadComponent: () =>
              import(
                './views/mastermodule/symptomsmaster/symptomslist/symptomslist.component'
              ).then((m) => m.SymptomslistComponent),
            canActivate: [authGuard],
            data: { module: 'symptoms' },
          },
          {
            path: 'symptomsgroup',
            loadComponent: () =>
              import(
                './views/mastermodule/symptomsmaster/symptomsgroup/symptomsgroup.component'
              ).then((m) => m.SymptomsgroupComponent),
            canActivate: [authGuard],
            data: { module: 'symptomGroup' },
          },
          {
            path: 'symptomsgrouplist',
            loadComponent: () =>
              import(
                './views/mastermodule/symptomsmaster/symptomsgrouplist/symptomsgrouplist.component'
              ).then((m) => m.SymptomsgrouplistComponent),
            canActivate: [authGuard],
            data: { module: 'symptomGroup' },
          },
          {
            path: 'packagemaster',
            loadComponent: () =>
              import(
                './views/mastermodule/packagemaster/addpackage/addpackage.component'
              ).then((m) => m.AddpackageComponent),
            canActivate: [authGuard],
            data: { module: 'packages' },
          },
          {
            path: 'packagemasterlist',
            loadComponent: () =>
              import(
                './views/mastermodule/packagemaster/packagelist/packagelist.component'
              ).then((m) => m.PackagelistComponent),
            canActivate: [authGuard],
            data: { module: 'packages' },
          },
          {
            path: 'doctorreferralrule',
            loadComponent: () =>
              import(
                './views/mastermodule/doctorreferral/doctorreferralrule/doctorreferralrule.component'
              ).then((m) => m.DoctorreferralruleComponent),
            canActivate: [authGuard],
            data: { module: 'referralRule' },
          },
          {
            path: 'doctorreferralrulelist',
            loadComponent: () =>
              import(
                './views/mastermodule/doctorreferral/doctorreferralrulelist/doctorreferralrulelist.component'
              ).then((m) => m.DoctorreferralrulelistComponent),
          },
          {
            path: 'surgerymaster',
            canActivate: [authGuard],
            data: { module: 'surgeryService' },
            loadComponent: () =>
              import(
                './views/mastermodule/surgerymaster/surgerymaster/surgerymaster.component'
              ).then((m) => m.SurgerymasterComponent),
          },
          {
            path: 'surgerypackagemaster',
            canActivate: [authGuard],
            data: { module: 'surgeryService' },
            loadComponent: () =>
              import(
                './views/mastermodule/surgerymaster/operation/surgerypackagemaster/surgerypackagemaster/surgerypackagemaster.component'
              ).then((m) => m.SurgerypackagemasterComponent),
          },
          {
            path: 'surgerypackagemasterlist',
            canActivate: [authGuard],
            data: { module: 'surgeryService' },
            loadComponent: () =>
              import(
                './views/mastermodule/surgerymaster/operation/surgerypackagemaster/surgerypackagemasterlist/surgerypackagemasterlist.component'
              ).then((m) => m.SurgerypackagemasterlistComponent),
          },
          {
            path: 'surgerymasterlist',
            loadComponent: () =>
              import(
                './views/mastermodule/surgerymaster/surgerymasterlist/surgerymasterlist.component'
              ).then((m) => m.SurgerymasterlistComponent),
            canActivate: [authGuard],
            data: { module: 'surgeryService' },
          },
          {
            path: 'slotmaster',
            loadComponent: () =>
              import(
                './views/mastermodule/appointmentslotmaster/slotmaster/slotmaster.component'
              ).then((m) => m.SlotmasterComponent),
            canActivate: [authGuard],
            data: { module: 'slotMaster' },
          },
          {
            path: 'slotmasterlist',
            loadComponent: () =>
              import(
                './views/mastermodule/appointmentslotmaster/slotmasterlist/slotmasterlist.component'
              ).then((m) => m.SlotmasterlistComponent),
            canActivate: [authGuard],
            data: { module: 'slotMaster' },
          },
          {
            path: 'discountpolicy',
            loadComponent: () =>
              import(
                './views/mastermodule/discountpolicy/discountpolicy.component'
              ).then((m) => m.DiscountpolicyComponent),
          },
          {
            path: 'discountpolicylist',
            loadComponent: () =>
              import(
                './views/mastermodule/discountpolicy/discountpolicy.component'
              ).then((m) => m.DiscountpolicyComponent),
          },
        ],
      },
      {
        path: 'report',
        children: [
          {
            path: 'opdreport',
            component: OpdreportComponent,
            data: { module: 'outpatientCase' },
            canActivate: [authGuard],
          },
          {
            path: 'ipdreport',
            component: IpdreportComponent,
            data: { module: 'inpatientCase' },
            canActivate: [authGuard],
          },
          {
            path: 'reports',
            component: ReportsComponent,
          },
          {
            path: 'opduhid',
            loadComponent: () =>
              import(
                './views/reports/opdreport/opdreports/opd-uhid/opd-uhid.component'
              ).then((m) => m.OpdUhidComponent),
          },
          {
            path: 'opdbill',
            loadComponent: () =>
              import(
                './views/reports/opdreport/opdreports/opd-bill/opd-bill.component'
              ).then((m) => m.OpdBillComponent),
          },
          {
            path: 'servicewisecollection',
            loadComponent: () =>
              import(
                './views/reports/opdreport/opdreports/service-wise-collection/service-wise-collection.component'
              ).then((m) => m.ServiceWiseCollectionComponent),
          },
          {
            path: 'patientledgersummary',
            loadComponent: () =>
              import(
                './views/reports/opdreport/opdreports/patient-ledger-summary/patient-ledger-summary.component'
              ).then((m) => m.PatientLedgerSummaryComponent),
          },
          {
            path: 'ipdcase',
            loadComponent: () =>
              import(
                './views/reports/ipdreport/ipdreports/ipd-case/ipd-case.component'
              ).then((m) => m.IpdCaseComponent),
          },
          {
            path: 'ipdadmissiondischarge',
            loadComponent: () =>
              import(
                './views/reports/ipdreport/ipdreports/ipd-admission-discharge/ipd-admission-discharge.component'
              ).then((m) => m.IpdAdmissionDischargeComponent),
          },
          {
            path: 'bedmaster',
            loadComponent: () =>
              import(
                './views/reports/ipdreport/ipdreports/bed-master/bed-master.component'
              ).then((m) => m.BedMasterComponent),
          },
          {
            path: 'roomwiseoccupancy',
            loadComponent: () =>
              import(
                './views/reports/ipdreport/ipdreports/room-wise-occupancy/room-wise-occupancy.component'
              ).then((m) => m.RoomWiseOccupancyComponent),
          },
          {
            path: 'patientbalancereport',
            loadComponent: () =>
              import(
                './views/reports/ipdreport/ipdreports/patient-balance-report/patient-balance-report.component'
              ).then((m) => m.PatientBalanceReportComponent),
          },
          {
            path: 'servicewiseincome',
            loadComponent: () =>
              import(
                './views/reports/ipdreport/ipdreports/service-wise-income/service-wise-income.component'
              ).then((m) => m.ServiceWiseIncomeComponent),
          },
        ],
      },
      {
        path: 'setting',
        children: [
          {
            path: 'general',
            loadComponent: () =>
              import(
                './views/settingsmodule/generalsetting/generalsetting.component'
              ).then((m) => m.GeneralsettingComponent),
          },
          {
            path: 'administrative',
            loadComponent: () =>
              import(
                './views/settingsmodule/administrativesetting/administrativesetting.component'
              ).then((m) => m.AdministrativesettingComponent),
          },
          {
            path: 'rolemanagement',
            loadComponent: () =>
              import(
                './views/settingsmodule/rolesetting/rolesetting.component'
              ).then((m) => m.RolesettingComponent),
          },
          {
            path: 'roles',
            loadComponent: () =>
              import('./superadminviews/rbac/roles/roles/roles.component').then(
                (m) => m.RolesComponent
              ),
            canActivate: [authGuard],
            data: { module: 'roles' },
          },
          {
            path: 'roleslist',
            loadComponent: () =>
              import(
                './superadminviews/rbac/roles/rolelist/rolelist.component'
              ).then((m) => m.RolelistComponent),
            canActivate: [authGuard],
            data: { module: 'roles' },
          },
          {
            path: 'permission',
            loadComponent: () =>
              import(
                './superadminviews/rbac/permission/permission/permission.component'
              ).then((m) => m.PermissionComponent),
            canActivate: [authGuard],
            data: { module: 'permissions' },
          },
          {
            path: 'permissionlist',
            loadComponent: () =>
              import(
                './superadminviews/rbac/permission/permissionlist/permissionlist.component'
              ).then((m) => m.PermissionlistComponent),
            canActivate: [authGuard],
            data: { module: 'permissions' },
          },
          {
            path: 'logo',
            loadComponent: () =>
              import('./views/settingsmodule/logo/logo/logo.component').then(
                (m) => m.LogoComponent
              ),
          },
          {
            path: 'theme',
            loadComponent: () =>
              import(
                './views/settingsmodule/themes/theme/theme.component'
              ).then((m) => m.ThemeComponent),
          },
          {
            path: 'letterheader',
            loadComponent: () =>
              import(
                './views/settingsmodule/letterhead/header-settings/header-settings.component'
              ).then((m) => m.HeaderSettingsComponent),
          },
        ],
      },

      {
        path: 'profilesetting',
        loadComponent: () =>
          import('./views/profilesetting/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
    ],
  },

  {
    path: 'pathologylayout',
    component: PatholayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'pathologylayout',
        pathMatch: 'full',
      },
      {
        path: 'pathologydashboard',
        loadComponent: () =>
          import(
            './viewspatho/apthologydashboard/apthologydashboard.component'
          ).then((m) => m.ApthologydashboardComponent),
      },
      {
        path: 'pathologylayout',
        component: PathodashboardComponent,
        canActivate: [authGuard],
        data: { module: 'inward' },
      },
      {
        path: 'opdpathologylayout',
        loadComponent: () =>
          import(
            './viewspatho/pathodashboardopd/pathodashboardopd.component'
          ).then((m) => m.PathodashboardopdComponent),
        canActivate: [authGuard],
        data: { module: 'inward' },
      },
      {
        path: 'manageinward',
        loadComponent: () =>
          import('./viewspatho/manageinward/manageinward.component').then(
            (m) => m.ManageinwardComponent
          ),
        canActivate: [authGuard],
        data: { module: 'inward' },
      },
      {
        path: 'pathointermbill',
        loadComponent: () =>
          import('./viewspatho/pathointermbill/pathointermbill.component').then(
            (m) => m.PathointermbillComponent
          ),
      },
      {
        path: 'walkinpathoinward',
        loadComponent: () =>
          import(
            './viewspatho/walkinpathoinward/walkinpathoinward.component'
          ).then((m) => m.WalkinpathoinwardComponent),
      },
      {
        path: 'walkinpathoinwardtest',
        loadComponent: () =>
          import(
            './viewspatho/walkinpathologytest/walkinpathologytest.component'
          ).then((m) => m.WalkinpathologytestComponent),
      },
      {
        path: 'pathoreport',
        loadComponent: () =>
          import('./viewspatho/pathoreport/pathoreport.component').then(
            (m) => m.PathoreportComponent
          ),
      },
      {
        path: 'pathologyreports',
        loadComponent: () =>
          import('./viewspatho/pathoreports/pathoreports.component').then(
            (m) => m.PathoreportsComponent
          ),
      },
      {
        path: 'deptpathoreports',
        loadComponent: () =>
          import(
            './viewspatho/pathoreportdepartmentwise/pathoreportdepartmentwise.component'
          ).then((m) => m.PathoreportdepartmentwiseComponent),
      },
      {
        path: 'opdpathoreports',
        loadComponent: () =>
          import(
            './viewspatho/pathoreportdepartmentwiseopdreport/pathoreportdepartmentwiseopdreport.component'
          ).then((m) => m.PathoreportdepartmentwiseopdreportComponent),
      },
      {
        path: 'ipdpathoreports',
        loadComponent: () =>
          import(
            './viewspatho/pathoreportdepartmentwiseopdreportipdreport/pathoreportdepartmentwiseopdreportipdreport.component'
          ).then((m) => m.PathoreportdepartmentwiseopdreportipdreportComponent),
      },
      {
        path: 'walkinpathoreports',
        loadComponent: () =>
          import(
            './viewspatho/pathoreportdepartmentwiseshow/pathoreportdepartmentwiseshow.component'
          ).then((m) => m.PathoreportdepartmentwiseshowComponent),
      },
      {
        path: 'testmaster',
        loadComponent: () =>
          import(
            './testmodule/testmaster/pathotestmaster/pathotestmaster.component'
          ).then((m) => m.PathotestmasterComponent),
      },
      {
        path: 'testmasterlist',
        loadComponent: () =>
          import(
            './testmodule/testmaster/pathotestmasterlist/pathotestmasterlist.component'
          ).then((m) => m.PathotestmasterlistComponent),
      },
      {
        path: 'testgroup',
        loadComponent: () =>
          import(
            './testmodule/testgroup/testmastergroup/testmastergroup.component'
          ).then((m) => m.TestmastergroupComponent),
        canActivate: [authGuard],
        data: { module: 'testGroup' },
      },
      {
        path: 'testgrouplist',
        loadComponent: () =>
          import(
            './testmodule/testgroup/testmastergrouplist/testmastergrouplist.component'
          ).then((m) => m.TestmastergrouplistComponent),
        canActivate: [authGuard],
        data: { module: 'testGroup' },
      },
      {
        path: 'testparameter',
        loadComponent: () =>
          import(
            './testmodule/testparameter/testmasterparameter/testmasterparameter.component'
          ).then((m) => m.TestmasterparameterComponent),
        canActivate: [authGuard],
        data: { module: 'testParameter' },
      },
      {
        path: 'testparameterlist',
        loadComponent: () =>
          import(
            './testmodule/testparameter/testmasterparameterlist/testmasterparameterlist.component'
          ).then((m) => m.TestmasterparameterlistComponent),
        canActivate: [authGuard],
        data: { module: 'testParameter' },
      },
    ],
  },
  {
    path: 'pharmalayout',
    component: PharmalayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'pharmalayout',
        pathMatch: 'full',
      },
      {
        path: 'pharmalayout',
        component: PharmadashboardComponent,
        canActivate: [authGuard],
        data: { module: 'pharmaceuticalInward' },
      },
      {
        path: 'opdpharmalayout',
        component: OpdpharmadashboardComponent,
        canActivate: [authGuard],
        data: { module: 'pharmaceuticalInward' },
      },
      {
        path: 'pharmacydashboard',
        loadComponent: () =>
          import(
            './viewspharma/apharmacydashboard/pharmacydashboard/pharmacydashboard.component'
          ).then((m) => m.PharmacydashboardComponent),
      },
      {
        path: 'pharmapartpayment',
        loadComponent : () => import('./viewspharma/pharmapaymentmodule/pharmapartpayment/pharmapartpayment.component').then( m => m.PharmapartpaymentComponent)
      },
      {
        path: 'walkinpharma',
        loadComponent: () =>
          import(
            './viewspharma/awalkinpharmadashboard/awalkinpharmadashboard.component'
          ).then((m) => m.AwalkinpharmadashboardComponent),
        canActivate: [authGuard],
        data: { module: 'pharmaceuticalInward' },
      },
      {
        path: 'managepharmainward',
        loadComponent: () =>
          import(
            './viewspharma/pharmamanageinward/pharmamanageinward.component'
          ).then((m) => m.PharmamanageinwardComponent),
        canActivate: [authGuard],
        data: { module: 'pharmaceuticalInward' },
      },
      {
        path: 'returnmedicine',
        loadComponent: () =>
          import(
            './viewspharma/returnmedicinemanagment/returnmedicine/returnmedicine.component'
          ).then((m) => m.ReturnmedicineComponent),
      },
      {
        path: 'returnmedicinereport',
        loadComponent: () =>
          import(
            './viewspharma/pharmanagement/returnpharmareports/returnpharmareports.component'
          ).then((m) => m.ReturnpharmareportsComponent),
      },
      {
        path: 'returnmedicinelist',
        loadComponent: () =>
          import(
            './viewspharma/returnmedicinemanagment/returnmedicinelist/returnmedicinelist.component'
          ).then((m) => m.ReturnmedicinelistComponent),
      },
      {
        path: 'expiredmedicines',
        loadComponent: () =>
          import(
            './viewspharma/expiredmedicines/expiredmedicines/expiredmedicines.component'
          ).then((m) => m.ExpiredmedicinesComponent),
      },
      {
        path: 'ipdpharmainward',
        loadComponent: () =>
          import(
            './viewspharma/pharmaintermbill/pharmaintermbill.component'
          ).then((m) => m.PharmaintermbillComponent),
        canActivate: [authGuard],
        data: { module: 'pharmaceuticalInward' },
      },

      {
        path: 'walkininward',
        loadComponent: () =>
          import('./viewspharma/walkinpharma/walkinpharma.component').then(
            (m) => m.WalkinpharmaComponent
          ),
      },
      {
        path: 'pharmareport',
        loadComponent: () =>
          import('./viewspharma/pharmareport/pharmareport.component').then(
            (m) => m.PharmareportComponent
          ),
      },
      {
        path: 'pharmareports',
        loadComponent: () =>
          import('./viewspharma/pharmareports/pharmareports.component').then(
            (m) => m.PharmareportsComponent
          ),
      },
      {
        path: 'pharmareportsipd',
        loadComponent: () =>
          import(
            './viewspharma/pharmareportsipd/pharmareportsipd.component'
          ).then((m) => m.PharmareportsipdComponent),
      },
      {
        path: 'pharmareportswalkin',
        loadComponent: () =>
          import(
            './viewspharma/pharmareportswalkin/pharmareportswalkin.component'
          ).then((m) => m.PharmareportswalkinComponent),
      },
      {
        path: 'pharmareportscenteralstoreallot',
        loadComponent: () =>
          import(
            './viewspharma/centeral-storeallotedreport/centeral-storeallotedreport.component'
          ).then((m) => m.CenteralStoreallotedreportComponent),
      },
      {
        path: 'pharmareportexpired',
        loadComponent: () =>
          import(
            './viewspharma/pahrmareportsexpired/pahrmareportsexpired.component'
          ).then((m) => m.PahrmareportsexpiredComponent),
      },
      {
        path: 'pharmareportscentralreq',
        loadComponent: () =>
          import(
            './viewspharma/stockreq-centeral-store/stockreq-centeral-store.component'
          ).then((m) => m.StockreqCenteralStoreComponent),
      },
      {
        path: 'pharmareportsmedicinestock',

        loadComponent: () =>
          import(
            './viewspharma/pharmareportsmedicinestock/pharmareportsmedicinestock.component'
          ).then((m) => m.PharmareportsmedicinestockComponent),
      },
      {
        path: 'pharmamanagement',
        loadComponent: () =>
          import(
            './viewspharma/pharmanagement/pharmamanagement/pharmamanagement.component'
          ).then((m) => m.PharmamanagementComponent),
      },
      {
        path: 'pharmamanagementlist',
        loadComponent: () =>
          import(
            './viewspharma/pharmanagement/pharmamanagementlist/pharmamanagementlist.component'
          ).then((m) => m.PharmamanagementlistComponent),
      },
      {
        path: 'subpharmaexpired',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/distributionmanagement/subpharmaciesexpired/subphamracyexpiredmed/subphamracyexpiredmed.component'
          ).then((m) => m.SubphamracyexpiredmedComponent),
      },
      {
        path: 'pharmamaterialreq',
        loadComponent: () =>
          import(
            './viewspharma/pharmamaterialrequest/pharmamaterialrequest.component'
          ).then((m) => m.PharmamaterialrequestComponent),
      },
    ],
  },

  {
    path: 'inventorylayout',
    loadComponent: () =>
      import(
        './layout/stockmanagementlayout/stockmanagementlayout.component'
      ).then((m) => m.StockmanagementlayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'inventorylayout',
        pathMatch: 'full',
      },
      {
        path: 'inventorylayout', // <-- default child route
        // component: InventorydashboardComponent
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/inventorydashboard/inventorydashboard.component'
          ).then((m) => m.InventorydashboardComponent),
      },
      {
        path: 'expiredmedicines',
        loadComponent: () =>
          import(
            './viewspharma/expiredmedicines/expiredmedicines/expiredmedicines.component'
          ).then((m) => m.ExpiredmedicinesComponent),
      },
      {
        path: 'inventorystock',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/inventory/inventory.component'
          ).then((m) => m.InventoryComponent),
      },
      {
        path: 'inventorystocklist',
        // loadComponent: () => import('./viewspharma/purchase order management/inventory/inventory.component').then(m => m.InventoryComponent)
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/inventory/inventorylist/inventorylist.component'
          ).then((m) => m.InventorylistComponent),
      },

      {
        path: 'lowinventorystocklist',
        // loadComponent: () => import('./viewspharma/purchase order management/inventory/inventory.component').then(m => m.InventoryComponent)
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/inventory/inventory-lowstock/inventory-lowstock.component'
          ).then((m) => m.InventoryLowstockComponent),
      },

      {
        path: 'pharmamanagementlist/:pharmacyId',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/distributionmanagement/subpharmaciesstocks/subpharmaciesstocks.component'
          ).then((m) => m.SubpharmaciesstocksComponent),
      },

      {
        path: 'vendor',
        // loadComponent: () => import('./viewspharma/purchase order management/inventory/inventory.component').then(m => m.InventoryComponent)
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/vendor management/vendor/vendor.component'
          ).then((m) => m.VendorComponent),
      },
      {
        path: 'vendorlist',
        // loadComponent: () => import('./viewspharma/purchase order management/inventory/inventory.component').then(m => m.InventoryComponent)
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/vendor management/vendorlist/vendorlist.component'
          ).then((m) => m.VendorlistComponent),
      },
      {
        path: 'purchaserequest',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/purchaserequest/purchaserequest/purchaserequest.component'
          ).then((m) => m.PurchaserequestComponent),
        canActivate: [authGuard],
        data: { module: 'materialRequestList' },
      },
      {
        path: 'purchaserequestlist',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/purchaserequest/purchaserequestlist/purchaserequestlist.component'
          ).then((m) => m.PurchaserequestlistComponent),
        canActivate: [authGuard],
        data: { module: 'materialRequestList' },
      },
      {
        path: 'purchaseindentlist',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/purchase-indent/purchase-indentlist/purchase-indentlist.component'
          ).then((m) => m.PurchaseIndentlistComponent),
        canActivate: [authGuard],
        data: { module: 'purchaseIntend' },
      },
      {
        path: 'purchaseindent',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/purchase-indent/purchase-indent/purchase-indent.component'
          ).then((m) => m.PurchaseIndentComponent),
        canActivate: [authGuard],
        data: { module: 'purchaseIntend' },
      },
      {
        path: 'requestquotation',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/rfq/request-for-quotation-component/request-for-quotation-component.component'
          ).then((m) => m.RequestForQuotationComponentComponent),
      },
      {
        path: 'requestquotationlist',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/rfq/request-for-quotationlist/request-for-quotationlist.component'
          ).then((m) => m.RequestForQuotationlistComponent),
      },
      {
        path: 'requestquotationdetail',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/rfq/request-quotation-detail/request-quotation-detail.component'
          ).then((m) => m.RequestQuotationDetailComponent),
      },
      {
        path: 'requestquotationcomparison',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/rfq/request-for-quotation-comparison/request-for-quotation-comparison.component'
          ).then((m) => m.RequestForQuotationComparisonComponent),
      },
      {
        path: 'quotation-comparison/:rfqId',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/rfq/request-for-quotation-comparison/request-for-quotation-comparison.component'
          ).then((m) => m.RequestForQuotationComparisonComponent),
      },

      {
        path: 'purchaseordergeneration',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/po/purchase-order-generation/purchase-order-generation.component'
          ).then((m) => m.PurchaseOrderGenerationComponent),
      },
      {
        path: 'purchaseordergenerationlist',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/po/purchase-order-generationlist/purchase-order-generationlist.component'
          ).then((m) => m.PurchaseOrderGenerationlistComponent),
      },
      {
        path: 'purchaseordergeneration/view/:poId',
        loadComponent: () =>
          import(
            './component/po/purchase-order-generation-view/purchase-order-generation-view.component'
          ).then((m) => m.PurchaseOrderGenerationViewComponent),
      },
      {
        path: 'goodreceivenote',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/grn/goods-receive-note/goods-receive-note.component'
          ).then((m) => m.GoodsReceiveNoteComponent),
      },
      {
        path: 'goodreceivenote/:grnId/quality-control',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/grn/goods-receive-note/goods-receive-note.component'
          ).then((m) => m.GoodsReceiveNoteComponent),
      },
      // Add this to your app routes
      {
        path: 'goodreceivenote/:grnId/quality-control',

        loadComponent: () =>
          import(
            './viewspharma/purchase order management/grn/goods-receive-note/goods-receive-note.component'
          ).then((m) => m.GoodsReceiveNoteComponent),
      },

      {
        path: 'goodreceivenote/view/:poId',

        loadComponent: () =>
          import(
            './component/grn/goodreceivenoteview/goodreceivenoteview.component'
          ).then((m) => m.GoodreceivenoteviewComponent),
      },
      {
        path: 'goodreceivenotelist',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/grn/goods-receive-note-list/goods-receive-note-list.component'
          ).then((m) => m.GoodsReceiveNoteListComponent),
      },
      {
        path: 'invoiceverification',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/po/invoice-verification/invoice-verification.component'
          ).then((m) => m.InvoiceVerificationComponent),
      },
      {
        path: 'invoiceverificationlist',

        loadComponent: () =>
          import(
            './viewspharma/purchase order management/po/invoice-verification/list/invoice-verificationlist/invoice-verificationlist.component'
          ).then((m) => m.InvoiceVerificationlistComponent),
      },
      {
        path: 'paymentproccessing',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/po/payment-proccessing/payment-proccessing.component'
          ).then((m) => m.PaymentProcessingComponent),
      },
      {
        path: 'paymentproccessinglist',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/po/payment-proccessing/list/payment-processinglist/payment-processinglist.component'
          ).then((m) => m.PaymentProcessinglistComponent),
      },
      {
        path: 'paymentproccessinghistory',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/po/payment-proccessing/history/paymentprocessinghistory/paymentprocessinghistory.component'
          ).then((m) => m.PaymentprocessinghistoryComponent),
      },
      {
        path: 'purchaseledger',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/po/purchase-ledger/purchase-ledger.component'
          ).then((m) => m.PurchaseLedgerComponent),
      },
      {
        path: 'distribution',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/distributionmanagement/distribution/distribution.component'
          ).then((m) => m.DistributionComponent),
      },
      {
        path: 'disposedexpiredmed',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/distributionmanagement/disposedexpiredmed/disposedexpiredmed.component'
          ).then((m) => m.DisposedexpiredmedComponent),
      },
      {
        path: 'lowstock',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/distributionmanagement/lowstocklist/lowstocklist.component'
          ).then((m) => m.LowstocklistComponent),
      },
      {
        path: 'subPharmacy',

        loadComponent: () =>
          import(
            './viewspharma/purchase order management/distributionmanagement/subpharmacy/subpharmacy.component'
          ).then((m) => m.SubpharmacyComponent),
      },

      {
        path: 'transfer',
        loadComponent: () =>
          import(
            './viewspharma/purchase order management/distributionmanagement/distribution/transferrequest/transferrequest/transferrequest.component'
          ).then((m) => m.TransferrequestComponent),
      },
    ],
  },

  {
    path: 'radiologylayout',
    component: RadiolayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'radiologylayout',
        pathMatch: 'full',
      },

      {
        path: 'radiologylayout',
        component: AradiologydashboardComponent,
        canActivate: [authGuard],
        data: { module: 'radiologyRequestList' },
      },
      {
        path: 'radiologydashboard',
        loadComponent: () =>
          import(
            './viewsradio/aradiologydashboard/aradiologydashboard.component'
          ).then((m) => m.AradiologydashboardComponent),
      },
      {
        path: 'radiologylayoutopd',
        loadComponent: () =>
          import(
            './viewsradio/radiodashboardopd/radiodashboardopd.component'
          ).then((matchMedia) => matchMedia.RadiodashboardopdComponent),
        canActivate: [authGuard],
        data: { module: 'inward' },
      },
      {
        path: 'radiologylayoutipd',
        loadComponent: () =>
          import('./viewsradio/radiodashboard/radiodashboard.component').then(
            (matchMedia) => matchMedia.RadiodashboardComponent
          ),
        canActivate: [authGuard],
        data: { module: 'inward' },
      },
      {
        path: 'radiologylayoutwalkin',
        loadComponent: () =>
          import(
            './viewsradio/radiodashboardwalkin/radiodashboardwalkin.component'
          ).then((matchMedia) => matchMedia.RadiodashboardwalkinComponent),
        canActivate: [authGuard],
        data: { module: 'inward' },
      },
      {
        path: 'manageradioinward',
        loadComponent: () =>
          import(
            './viewsradio/manageradioinward/manageradioinward.component'
          ).then((m) => m.ManageradioinwardComponent),
        canActivate: [authGuard],
        data: { module: 'inward' },
      },
      {
        path: 'radiointermbill',
        loadComponent: () =>
          import('./viewsradio/radiointermbill/radiointermbill.component').then(
            (m) => m.RadiointermbillComponent
          ),
        canActivate: [authGuard],
        data: { module: 'inward' },
      },
      {
        path: 'radiowalkintest',
        loadComponent: () =>
          import('./viewsradio/walkinradiotest/walkinradiotest.component').then(
            (m) => m.WalkinradiotestComponent
          ),
        canActivate: [authGuard],
        data: { module: 'inward' },
      },
      {
        path: 'radioreport',
        loadComponent: () =>
          import('./viewsradio/radioreport/radioreport.component').then(
            (m) => m.RadioreportComponent
          ),
        canActivate: [authGuard],
        data: { module: 'inward' },
      },
      {
        path: 'radioreports',
        loadComponent: () =>
          import('./viewsradio/radioreports/radioreports.component').then(
            (m) => m.RadioreportsComponent
          ),
        canActivate: [authGuard],
        data: { module: 'inward' },
      },
      {
        path: 'radiodeptreport',
        loadComponent: () =>
          import(
            './viewsradio/departmentwisereport/departmentwisereport.component'
          ).then((m) => m.DepartmentwisereportComponent),
      },
      {
        path: 'radioopddeptreport',
        loadComponent: () =>
          import('./viewsradio/deptreport/opdreport/opdreport.component').then(
            (m) => m.OpdreportComponent
          ),
      },
      {
        path: 'radioipddeptreport',
        loadComponent: () =>
          import('./viewsradio/deptreport/ipdreport/ipdreport.component').then(
            (m) => m.IpdreportComponent
          ),
      },
      {
        path: 'radiowalkindeptreport',
        loadComponent: () =>
          import(
            './viewsradio/deptreport/walkinreport/walkinreport.component'
          ).then((m) => m.WalkinreportComponent),
      },
      {
        path: 'radiotestgroupmaster',
        loadComponent: () =>
          import(
            './viewsradio/radiologytestmodule/radiologytestmastergroup/radiotestmastergroup/radiotestmastergroup.component'
          ).then((m) => m.RadiotestmastergroupComponent),
        canActivate: [authGuard],
        data: { module: 'testGroup' },
      },
      {
        path: 'radiotestgroupmasterlist',
        loadComponent: () =>
          import(
            './viewsradio/radiologytestmodule/radiologytestmastergroup/radiotestmastergrouplist/radiotestmastergrouplist.component'
          ).then((m) => m.RadiotestmastergrouplistComponent),
        canActivate: [authGuard],
        data: { module: 'testGroup' },
      },
      {
        path: 'radiotestparametermaster',
        loadComponent: () =>
          import(
            './viewsradio/radiologytestmodule/radiologytestmasterparamter/radiotestmasterparameter/radiotestmasterparameter.component'
          ).then((m) => m.RadiotestmasterparameterComponent),
        canActivate: [authGuard],
        data: { module: 'testParameter' },
      },
      {
        path: 'radiotestparametermasterlist',
        loadComponent: () =>
          import(
            './viewsradio/radiologytestmodule/radiologytestmasterparamter/radiotestmasterparameterlist/radiotestmasterparameterlist.component'
          ).then((m) => m.RadiotestmasterparameterlistComponent),
        canActivate: [authGuard],
        data: { module: 'testParameter' },
      },
    ],
  },
  {
    path: 'doctorsharinglayout',
    loadComponent: () =>
      import('./layout/doctorsharinglayout/doctorsharinglayout.component').then(
        (m) => m.DoctorsharinglayoutComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'doctorsharinglayout',
        pathMatch: 'full',
      },
      {
        path: 'doctorsharinglayout',
        loadComponent: () =>
          import(
            './viewsdoctorsharing/doctorsharingdashboard/doctorsharingdashboard.component'
          ).then((m) => m.DoctorsharingdashboardComponent),
        canActivate: [authGuard],
        data: { module: 'sharedPatientCases' },
      },
      {
        path: 'ipddatasharing',
        loadComponent: () =>
          import(
            './viewsdoctorsharing/ipddatasharing/ipddatasharing.component'
          ).then((m) => m.IpddatasharingComponent),
        canActivate: [authGuard],
        data: { module: 'sharedPatientCases' },
      },
      {
        path: 'opddatasharing',
        loadComponent: () =>
          import(
            './viewsdoctorsharing/opddatasharing/opddatasharing.component'
          ).then((m) => m.OpddatasharingComponent),
        canActivate: [authGuard],
        data: { module: 'sharedPatientCases' },
      },
      {
        path: 'patientlist',
        loadComponent: () =>
          import('./viewsdoctorsharing/patientlist/patientlist.component').then(
            (m) => m.PatientlistComponent
          ),
        canActivate: [authGuard],
        data: { module: 'sharedPatientCases' },
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./viewsdoctorsharing/reports/reports.component').then(
            (m) => m.ReportsComponent
          ),
        canActivate: [authGuard],
        data: { module: 'sharedPatientCases' },
      },
      {
        path: 'treatmentsheet',
        loadComponent: () =>
          import(
            './viewsdoctorsharing/treatmentsheet/treatmentsheet.component'
          ).then((m) => m.TreatmentsheetComponent),
        canActivate: [authGuard],
        data: { module: 'sharedPatientCases' },
      },
    ],
  },
  {
    path: 'doctorreferrallayout',
    loadComponent: () =>
      import(
        './layout/doctorreferrallayout/doctorreferrallayout.component'
      ).then((m) => m.DoctorreferrallayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'doctorreferrallayout',
        pathMatch: 'full',
      },
      {
        path: 'doctorreferrallayout',
        loadComponent: () =>
          import(
            './viewsdoctorreferral/doctorreferraldashboard/doctorreferraldashboard.component'
          ).then((m) => m.DoctorreferraldashboardComponent),
        canActivate: [authGuard],
        data: { module: 'sharedPatientCases' },
      },
      {
        path: 'referraldatalist',
        loadComponent: () =>
          import(
            './viewsdoctorreferral/referraldatalist/referraldatalist.component'
          ).then((m) => m.ReferraldatalistComponent),
      },
      {
        path: 'referralapprovalpage',
        loadComponent: () =>
          import(
            './viewsdoctorreferral/referralapprovalpage/referralapprovalpage.component'
          ).then((m) => m.ReferralapprovalpageComponent),
      },
    ],
  },

  {
    path: 'radiationlayout',
    component: RadiationlayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'radiationlayout',
        pathMatch: 'full',
      },
      {
        path: 'radiationlayout',
        loadComponent: () =>
          import(
            './viewsradiation/radiationdashboard/radiationdashboard.component'
          ).then((m) => m.RadiationdashboardComponent),
        canActivate: [authGuard],
        data: { module: 'inward' },
      },
      {
        path: 'manageradiationinward',
        loadComponent: () =>
          import(
            './viewsradiation/manageradiationinward/manageradiationinward.component'
          ).then((m) => m.ManageradiationinwardComponent),
        canActivate: [authGuard],
        data: { module: 'inward' },
      },
      {
        path: 'radiationintermbill',
        loadComponent: () =>
          import(
            './viewsradiation/radiationintermbill/radiationintermbill.component'
          ).then((m) => m.RadiationintermbillComponent),
        canActivate: [authGuard],
        data: { module: 'inward' },
      },
      {
        path: 'radaitionreport',
        loadComponent: () =>
          import(
            './viewsradiation/radiationreport/radiationreport.component'
          ).then((m) => m.RadiationreportComponent),
        canActivate: [authGuard],
        data: { module: 'inward' },
      },
      {
        path: 'radiationreports',
        loadComponent: () =>
          import(
            './viewsradiation/radiationreports/radiationreports.component'
          ).then((m) => m.RadiationreportsComponent),
        canActivate: [authGuard],
        data: { module: 'inward' },
      },
      {
        path: 'radiationtestmaster',
        loadComponent: () =>
          import(
            './viewsradiation/radiationtestmodule/radiationtestmaster/radaitiontestmaster/radaitiontestmaster.component'
          ).then((m) => m.RadaitiontestmasterComponent),
      },
      {
        path: 'radiationtestmasterlist',
        loadComponent: () =>
          import(
            './viewsradiation/radiationtestmodule/radiationtestmaster/radaitiontestmasterlist/radaitiontestmasterlist.component'
          ).then((m) => m.RadaitiontestmasterlistComponent),
      },
      {
        path: 'radiationtestgroup',
        loadComponent: () =>
          import(
            './viewsradiation/radiationtestmodule/radiationtestgroupmaster/radaitiontestgroupmaster/radaitiontestgroupmaster.component'
          ).then((m) => m.RadaitiontestgroupmasterComponent),
        canActivate: [authGuard],
        data: { module: 'testGroup' },
      },
      {
        path: 'radiationtestgrouplist',
        loadComponent: () =>
          import(
            './viewsradiation/radiationtestmodule/radiationtestgroupmaster/radaitiontestgroupmasterlist/radaitiontestgroupmasterlist.component'
          ).then((m) => m.RadaitiontestgroupmasterlistComponent),
        canActivate: [authGuard],
        data: { module: 'testGroup' },
      },
      {
        path: 'radiationtestparameter',
        loadComponent: () =>
          import(
            './viewsradiation/radiationtestmodule/radiationtestparametermaster/radaitiontestparameter/radaitiontestparameter.component'
          ).then((m) => m.RadaitiontestparameterComponent),
        canActivate: [authGuard],
        data: { module: 'testParameter' },
      },
      {
        path: 'radiationtestparameterlist',
        loadComponent: () =>
          import(
            './viewsradiation/radiationtestmodule/radiationtestparametermaster/radaitiontestparameterlist/radaitiontestparameterlist.component'
          ).then((m) => m.RadaitiontestparameterlistComponent),
        canActivate: [authGuard],
        data: { module: 'testParameter' },
      },
    ],
  },
  {
    path: 'hospitaladmin',
    component: HospitaladminComponent,
    canActivate: [hospitaladminGuard],
    children: [
      { path: '', redirectTo: 'hospitaladmin', pathMatch: 'full' },
      {
        path: 'hospitaladmin',
        loadComponent: () =>
          import(
            './hospitaladminviews/hspadmindashboard/hspadmindashboard.component'
          ).then((m) => m.HspadmindashboardComponent),
      },
      {
        path: 'urm',
        children: [
          {
            path: 'patientmanagement',
            loadComponent: () =>
              import(
                './hospitaladminviews/urm/patientmanagement/patientmanagement.component'
              ).then((m) => m.PatientmanagementComponent),
          },
          // {
          //   path: 'ui',
          //   loadComponent: () => import('./hospitaladminviews/hospitaladminui/hospitaladminui.component').then(m => m.HospitaladminuiComponent),
          // },
          {
            path: 'doctormanagement',
            loadComponent: () =>
              import(
                './hospitaladminviews/urm/doctormanagement/doctormanagement.component'
              ).then((m) => m.DoctormanagementComponent),
          },
          {
            path: 'staffmanagement',
            loadComponent: () =>
              import(
                './hospitaladminviews/urm/staffmanagement/staffmanagement.component'
              ).then((m) => m.StaffmanagementComponent),
          },
        ],
      },
      {
        path: 'appointmentmanagement',
        loadComponent: () =>
          import(
            './hospitaladminviews/appointmentmanagement/appointmentmanagement.component'
          ).then((m) => m.AppointmentmanagementComponent),
      },
      {
        path: 'labmanagement',
        loadComponent: () =>
          import(
            './hospitaladminviews/labmanagement/labmanagement.component'
          ).then((m) => m.LabmanagementComponent),
      },
      {
        path: 'pharmacymanagement',
        loadComponent: () =>
          import(
            './hospitaladminviews/pharmacymanagemnet/pharmacymanagemnet.component'
          ).then((m) => m.PharmacymanagemnetComponent),
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./superadminviews/rbac/roles/roles/roles.component').then(
            (m) => m.RolesComponent
          ),
      },
      {
        path: 'roleslist',
        loadComponent: () =>
          import(
            './superadminviews/rbac/roles/rolelist/rolelist.component'
          ).then((m) => m.RolelistComponent),
      },
      {
        path: 'permission',
        loadComponent: () =>
          import(
            './superadminviews/rbac/permission/permission/permission.component'
          ).then((m) => m.PermissionComponent),
      },
      {
        path: 'permissionlist',
        loadComponent: () =>
          import(
            './superadminviews/rbac/permission/permissionlist/permissionlist.component'
          ).then((m) => m.PermissionlistComponent),
      },
      {
        path: 'userrolemanagement',
        loadComponent: () =>
          import(
            './superadminviews/userrolemanagement/userrole/userrole.component'
          ).then((m) => m.UserroleComponent),
      },
      {
        path: 'userrolemanagementlist',
        loadComponent: () =>
          import(
            './superadminviews/userrolemanagement/userrolelist/userrolelist.component'
          ).then((m) => m.UserrolelistComponent),
      },
      {
        path: 'billingfinance',
        loadComponent: () =>
          import(
            './superadminviews/billingfinance/billingfinance.component'
          ).then((m) => m.BillingfinanceComponent),
      },
      {
        path: 'hospitalmanagement',
        loadComponent: () =>
          import(
            './hospitaladminviews/hms/hospitalmanagement/hospitalmanagement.component'
          ).then((m) => m.HospitalmanagementComponent),
      },
      {
        path: 'adduserroles',
        loadComponent: () =>
          import(
            './superadminviews/userrolemanagement/addusersroles/addusersroles.component'
          ).then((m) => m.AddusersrolesComponent),
      },
      {
        path: 'subscription',
        loadComponent: () =>
          import(
            './hospitaladminviews/subscriptionmanagement/subscription/subscription.component'
          ).then((m) => m.SubscriptionComponent),
      },
      {
        path: 'notification',
        loadComponent: () =>
          import(
            './hospitaladminviews/notification/notification/notification.component'
          ).then((m) => m.NotificationComponent),
      },
    ],
  },

  {
    path: 'superadmin',
    component: SuperadminlayoutComponent,
    canActivate: [superadminGuard],

    children: [
      { path: '', redirectTo: 'superadmin', pathMatch: 'full' },
      {
        path: 'superadmin',
        loadComponent: () =>
          import(
            './superadminviews/suepradmindashboard/suepradmindashboard.component'
          ).then((m) => m.SuepradmindashboardComponent),
      },
      {
        path: 'userrolemanagement',
        loadComponent: () =>
          import(
            './superadminviews/userrolemanagement/userrole/userrole.component'
          ).then((m) => m.UserroleComponent),
      },
      {
        path: 'userrolemanagementlist',
        loadComponent: () =>
          import(
            './superadminviews/userrolemanagement/userrolelist/userrolelist.component'
          ).then((m) => m.UserrolelistComponent),
      },
      {
        path: 'superadminrolemanagement',
        loadComponent: () =>
          import(
            './superadminviews/superadminrolemanagement/superadminrolemanagement.component'
          ).then((m) => m.SuperadminrolemanagementComponent),
      },
      {
        path: 'superadminrolelist',
        loadComponent: () =>
          import(
            './superadminviews/superadminrolelist/superadminrolelist.component'
          ).then((m) => m.SuperadminrolelistComponent),
      },
      {
        path: 'superadminpermission',
        loadComponent: () =>
          import(
            './superadminviews/superadminpermission/superadminpermission.component'
          ).then((m) => m.SuperadminpermissionComponent),
      },
      {
        path: 'superadminpermissionlist',
        loadComponent: () =>
          import(
            './superadminviews/superadminpermissionlist/superadminpermissionlist.component'
          ).then((m) => m.SuperadminpermissionlistComponent),
      },
      {
        path: 'superadminplatformusers',
        loadComponent: () =>
          import(
            './superadminviews/superadminplatformusers/superadminplatformusers.component'
          ).then((m) => m.SuperadminplatformusersComponent),
      },
      {
        path: 'apikeymanagment',
        loadComponent: () =>
          import(
            './superadminviews/apikeymanagment/apikeymanagment.component'
          ).then((m) => m.ApikeymanagmentComponent),
      },
      {
        path: 'billingfinance',
        loadComponent: () =>
          import(
            './superadminviews/billingfinance/billingfinance.component'
          ).then((m) => m.BillingfinanceComponent),
      },
      {
        path: 'logoutsecurity',
        loadComponent: () =>
          import(
            './superadminviews/logoutsecurity/logoutsecurity.component'
          ).then((m) => m.LogoutsecurityComponent),
      },
      {
        path: 'accesscontrol',
        loadComponent: () =>
          import(
            './superadminviews/accesscontrol/accesscontrol/accesscontrol.component'
          ).then((m) => m.AccesscontrolComponent),
      },
      {
        path: 'accesscontrollist',
        loadComponent: () =>
          import(
            './superadminviews/accesscontrol/accesscontrollist/accesscontrollist.component'
          ).then((m) => m.AccesscontrollistComponent),
      },
      {
        path: 'braodcastingmessage',
        loadComponent: () =>
          import(
            './superadminviews/broadcastmessaging/broadcastmessaging/broadcastmessaging.component'
          ).then((m) => m.BroadcastmessagingComponent),
      },
      {
        path: 'braodcastingmessagelist',
        loadComponent: () =>
          import(
            './superadminviews/broadcastmessaging/broadcastmessaginglist/broadcastmessaginglist.component'
          ).then((m) => m.BroadcastmessaginglistComponent),
      },
      {
        path: 'security',
        loadComponent: () =>
          import(
            './superadminviews/securitycompilance/security/security.component'
          ).then((m) => m.SecurityComponent),
      },
      {
        path: 'userlogs',
        loadComponent: () =>
          import(
            './superadminviews/securitycompilance/userlogs/userlog/userlog.component'
          ).then((m) => m.UserlogComponent),
      },
      {
        path: 'compilancescertificates',
        loadComponent: () =>
          import(
            './superadminviews/securitycompilance/compilancescertificates/certificates/certificates.component'
          ).then((m) => m.CertificatesComponent),
      },
      {
        path: 'compilancescertificateslist',
        loadComponent: () =>
          import(
            './superadminviews/securitycompilance/compilancescertificates/certificateslist/certificateslist.component'
          ).then((m) => m.CertificateslistComponent),
      },

      // support & management
      {
        path: 'hospitalsreports',
        loadComponent: () =>
          import(
            './superadminviews/analyticsreports/hospitalreports/hospitalreports.component'
          ).then((m) => m.HospitalreportsComponent),
      },
      {
        path: 'systemmanagement',
        children: [
          {
            path: 'versioncontrol',
            loadComponent: () =>
              import(
                './superadminviews/systemmanagement/versioncontrol/versioncontrol.component'
              ).then((m) => m.VersioncontrolComponent),
          },
          {
            path: 'serverstatus',
            loadComponent: () =>
              import(
                './superadminviews/systemmanagement/serverstatus/serverstatus.component'
              ).then((m) => m.ServerstatusComponent),
          },
          {
            path: 'backupmanagement',
            loadComponent: () =>
              import(
                './superadminviews/systemmanagement/backupmanagement/backupmanagement.component'
              ).then((m) => m.BackupmanagementComponent),
          },
        ],
      },
      {
        path: 'supportticekting',
        loadComponent: () =>
          import(
            './superadminviews/supportticketing/support/support.component'
          ).then((m) => m.SupportComponent),
      },
    ],
  },

  {
    path: 'hrms',
    loadComponent: () =>
      import('./layout/hrmslayout/hrmslayout.component').then(
        (m) => m.HrmslayoutComponent
      ),
    children: [
      { path: '', redirectTo: 'hrms', pathMatch: 'full' },
      {
        path: 'hrms',
        loadComponent: () =>
          import('./hrmsviews/hrmsdashboard/hrmsdashboard.component').then(
            (m) => m.HrmsdashboardComponent
          ),
      },
      {
        path: 'employee',
        children: [
          {
            path: 'employee',
            loadComponent: () =>
              import(
                './hrmsviews/employeemodule/employeemaster/employee/employee.component'
              ).then((m) => m.EmployeeComponent),
          },
          {
            path: 'employeelist',
            loadComponent: () =>
              import(
                './hrmsviews/employeemodule/employeemaster/employeelist/employeelist.component'
              ).then((m) => m.EmployeelistComponent),
          },
          {
            path: 'employeecard/:id', // ✅ Added :id parameter
            loadComponent: () =>
              import(
                './hrmsviews/employeemodule/employeecard/employeecard.component'
              ).then((m) => m.EmployeecardComponent),
          },
        ],
      },
    ],
  },

  {
    path: 'quemanagement',
    loadComponent: () =>
      import(
        './views/queuemanagement/quemanagement/quemanagement.component'
      ).then((m) => m.QuemanagementComponent),
  },

  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'digitalks',
    loadComponent: () =>
      import(
        './superadminviews/superadminlogin/superadminlogin/superadminlogin.component'
      ).then((m) => m.SuperadminloginComponent),
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
