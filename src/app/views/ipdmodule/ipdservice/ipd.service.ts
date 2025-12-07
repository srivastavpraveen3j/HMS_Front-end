import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../enviornment/env';
@Injectable({
  providedIn: 'root',
})
export class IpdService {
  constructor(private http: HttpClient) {}

  // ipdcase apis starts here
  private ipdCaseapis = `${environment.baseurl}/inpatientCase`;
  private companyipdUrl = `${environment.baseurl}/company`;

  getCompanyLockedRates(
    ipdcaseid: string,
    type: string = 'IPD'
  ): Observable<any> {
    console.log(
      `🔄 Loading company locked rates for: ${ipdcaseid}, type: ${type}`
    );

    const url = `${this.companyipdUrl}/locked-rates/${ipdcaseid}/IPD`;

    return this.http.get<any>(url).pipe(
      tap((response) => {
        console.log('✅ Company locked rates loaded:', response);
      }),
      catchError((error) => {
        console.error('❌ Error loading company locked rates:', error);
        return throwError(() => error);
      })
    );
  }

  getPatientByName(name: string): Observable<any[]> {
    const params = new HttpParams().set('patient_name', name);
    return this.http.get<any[]>(this.ipdCaseapis, { params });
  }
  getPatientByUhid(filters: { [key: string]: string }): Observable<any[]> {
    let params = new HttpParams();
    for (const key in filters) {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    }
    return this.http.get<any[]>(this.ipdCaseapis, { params });
  }

  // getIPDcaseById(ipdcaseid: string): Observable<any> {
  //   return this.http.get<any>(`${this.ipdCaseapis}`, {
  //     params: {
  //       _id: ipdcaseid
  //     }
  //   });
  // }

  getIPDcaseById(ipdcaseid: string): Observable<any> {
    return this.http.get<any>(`${this.ipdCaseapis}/${ipdcaseid}`);
  }

  getIPDcase(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.ipdCaseapis, { params });
  }

  postIPDcase(IPDcasesData: any): Observable<any> {
    return this.http.post<any>(this.ipdCaseapis, IPDcasesData);
  }

  postipdCasewithCompany(IPDcasesData: any): Observable<any> {
    return this.http.post<any>(
      `${this.companyipdUrl}/ipd/create-with-company`,
      IPDcasesData
    );
  }

  deleteIPDcase(ipdcaseid: any): Observable<any> {
    return this.http.delete<any>(`${this.ipdCaseapis}/${ipdcaseid}`);
  }

  updateIPDcase(ipdcaseid: any, IPDcasesData: any): Observable<any> {
    return this.http.put<any>(`${this.ipdCaseapis}/${ipdcaseid}`, IPDcasesData);
  }

  // ipdbill apis starts here
  private ipdBillapis = `${environment.baseurl}/inpatientBilling`;

  getipdBillapis(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.ipdBillapis, { params });
  }

  postipdBillapis(ipdBillapisData: any): Observable<any> {
    return this.http.post<any>(this.ipdBillapis, ipdBillapisData);
  }

  deleteipdBillapis(ipdBillapisid: any): Observable<any> {
    return this.http.delete<any>(`${this.ipdBillapis}/${ipdBillapisid}`);
  }

  updateipdBillapis(ipdBillapisid: any, ipdBillapisData: any): Observable<any> {
    return this.http.put<any>(
      `${this.ipdBillapis}/${ipdBillapisid}`,
      ipdBillapisData
    );
  }

  getIPDBillByCase(id: string = ''): Observable<any> {
    let params = new HttpParams();

    if (id) {
      params = params.set('inpatientCaseId', id);
    }

    return this.http.get<any>(`${this.ipdBillapis}/case`, { params });
  }

  // ipddeposit apis starts here
  private ipddepositapis = `${environment.baseurl}/inpatientDeposit`;

  getipddepositapis(
    page: number = 1,
    limit: number = 100,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.ipddepositapis, { params });
  }

  getIPDdepositById(_id: string): Observable<any> {
    return this.http.get<any>(`${this.ipddepositapis}/${_id}`);
  }

  postipddepositapis(ipddepositapisData: any): Observable<any> {
    return this.http.post<any>(this.ipddepositapis, ipddepositapisData);
  }

  deleteipddepositapis(ipddepositapisid: any): Observable<any> {
    return this.http.delete<any>(`${this.ipddepositapis}/${ipddepositapisid}`);
  }

  updateipddepositapis(
    ipddepositapisid: any,
    ipddepositapisData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.ipddepositapis}/${ipddepositapisid}`,
      ipddepositapisData
    );
  }

  getIPDdepositByCase(id: string = ''): Observable<any> {
    let params = new HttpParams();

    if (id) {
      params = params.set('inpatientCaseId', id);
    }
    return this.http.get<any>(`${this.ipddepositapis}/case`, { params });
  }

  // serch ipd data on patient name
  // const url = 'https://hims-rest-api-1.onrender.com/v1/inpatientBilling';
  private ipddata = `${environment.baseurl}/inpatientCase`;
  private ipdbilldata = `${environment.baseurl}/inpatientBilling`;

  getIPDCaseByPatientName(patient_name: string): Observable<any> {
    const params = new HttpParams().set('patient_name', patient_name);

    return this.http.get<any>(this.ipddata, { params });
  }

  getIPDCaseByUhid(uhid: string): Observable<any[]> {
    const params = new HttpParams().set('uhid', uhid);
    return this.http.get<any[]>(this.ipddata, { params });
  }

  getIPDBillByPatientName(patient_name: string): Observable<any> {
    const params = new HttpParams().set('patient_name', patient_name);

    return this.http.get<any>(this.ipdbilldata, { params });
  }

  // get ipd cse by doctor name

  private opdcasebydocname = `${environment.baseurl}/inpatientCase/getByDoctorFilter`;

  getOPDCasesByDoctorFilter(doctorName: string = ''): Observable<any> {
    let params = new HttpParams();

    if (doctorName.trim()) {
      params = params.set('name', doctorName); // Backend expects 'name'
    }

    return this.http.get<any>(this.opdcasebydocname, { params });
  }

  // room transfer starts here

  private roomtransferurl = `${environment.baseurl}/inpatientRoomTransfer`;

  getipdroomtransfer(
    page: number = 1,
    limit: number = 100,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.roomtransferurl, { params });
  }

  postipdroomtransfer(ipdroomtransferData: any): Observable<any> {
    return this.http.post<any>(this.roomtransferurl, ipdroomtransferData);
  }

  addNewTransfer(id: string, transfer: any) {
    return this.http.patch(`${this.roomtransferurl}/${id}/transfers`, transfer);
  }

  deleteipdroomtransfer(ipdroomtransferid: any): Observable<any> {
    return this.http.delete<any>(
      `${this.roomtransferurl}/${ipdroomtransferid}`
    );
  }

  updateipdroomtransfer(
    ipdroomtransferid: any,
    transferId: string,
    ipdroomtransferData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.roomtransferurl}/${ipdroomtransferid}/transfers/${transferId}`,
      ipdroomtransferData
    );
  }

  getIpdRoomTransferByCase(id: string): Observable<any> {
    let params = new HttpParams().set('inpatientCaseId', id);
    return this.http.get<any>(`${this.roomtransferurl}/case`, { params });
  }

  getIpdRoomTransferById(id: string): Observable<any> {
    return this.http.get<any>(`${this.roomtransferurl}/${id}`);
  }

  updateipdroomlog(
    ipdroomlogid: any,
    logId: string,
    ipdroomLogData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.roomtransferurl}/${ipdroomlogid}/logs/${logId}`,
      ipdroomLogData
    );
  }

  // OT Sheet api starts here

  private oprationTheatresheeturl = `${environment.baseurl}/oprationTheatresheet`;

  getoprationTheatresheet(
    page: number = 1,
    limit: number = 100,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.oprationTheatresheeturl, { params });
  }

  postoprationTheatresheet(ipdroomtransferData: any): Observable<any> {
    return this.http.post<any>(
      this.oprationTheatresheeturl,
      ipdroomtransferData
    );
  }

  deleteoprationTheatresheet(ipdroomtransferid: any): Observable<any> {
    return this.http.delete<any>(
      `${this.oprationTheatresheeturl}/${ipdroomtransferid}`
    );
  }

  getpatientoprationTheatresheet(patient_name: string): Observable<any> {
    return this.http.get<any>(`${this.oprationTheatresheeturl}`, {
      params: { patient_name },
    });
  }
  getpatientuhidoprationTheatresheet(uhid: string): Observable<any> {
    return this.http.get<any>(`${this.oprationTheatresheeturl}`, {
      params: { uhid },
    });
  }

  getOperationTheatreById(id: string = ''): Observable<any> {
    return this.http.get<any>(`${this.oprationTheatresheeturl}/${id}`);
  }

  getPatientOTByCase(id: string = ''): Observable<any> {
    let params = new HttpParams();
    if (id) {
      params = params.set('inpatientCaseId', id);
    }
    return this.http.get<any>(`${this.oprationTheatresheeturl}/case`, {
      params,
    });
  }

  updateoprationTheatresheet(
    ipdroomtransferid: any,
    ipdroomtransferData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.oprationTheatresheeturl}/${ipdroomtransferid}`,
      ipdroomtransferData
    );
  }

  private intermurl = `${environment.baseurl}/inpatientIntermBill`;
  private intermhistoryurl = `${environment.baseurl}/inpatientIntermBill/history`;

  getinpatientIntermBill(
    page: number = 1,
    limit: number = 100,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.intermurl, { params });
  }

  getinpatientIntermBillhistory(
    page: number = 1,
    limit: number = 100,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.intermhistoryurl, { params });
  }

  postinpatientIntermBill(ipdroomtransferData: any): Observable<any> {
    return this.http.post<any>(this.intermurl, ipdroomtransferData);
  }

  deleteinpatientIntermBill(ipdroomtransferid: any): Observable<any> {
    return this.http.delete<any>(
      `${this.oprationTheatresheeturl}/${ipdroomtransferid}`
    );
  }

  updateinpatientIntermBill(
    intermid: any,
    intermdata: any
  ): Observable<any> {
    return this.http.put<any>(`${this.intermurl}/${intermid}`, intermdata);
  }

  getPatientIntermByName(name: string): Observable<any[]> {
    const params = new HttpParams().set('patient_name', name);
    return this.http.get<any[]>(this.intermurl, { params });
  }
  getPatientIntermByUhid(name: string): Observable<any[]> {
    const params = new HttpParams().set('uhid', name);
    return this.http.get<any[]>(this.intermurl, { params });
  }

  getPatientIntermByCaseId(id: string): Observable<any[]> {
    const params = new HttpParams().set('inpatientCaseId', id);
    return this.http.get<any[]>(this.intermurl, { params });
  }

  getPatientIntermHistoryByCaseId(id: string): Observable<any[]> {
    const params = new HttpParams().set('inpatientCaseId', id);
    return this.http.get<any[]>(`${this.intermhistoryurl}/case`, { params });
  }

  // ipd dicharge apis

  private ipddischargeurl = `${environment.baseurl}/discharge`;

  getipddischargeurl(
    page: number = 1,
    limit: number = 100,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.ipddischargeurl, { params });
  }

  postipddischargeurl(ipdroomtransferData: any): Observable<any> {
    return this.http.post<any>(this.ipddischargeurl, ipdroomtransferData);
  }

  deleteipddischargeurl(ipdroomtransferid: any): Observable<any> {
    return this.http.delete<any>(
      `${this.ipddischargeurl}/${ipdroomtransferid}`
    );
  }

  updateipddischargeurl(
    ipdroomtransferid: any,
    ipdroomtransferData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.ipddischargeurl}/${ipdroomtransferid}`,
      ipdroomtransferData
    );
  }

  getDischargedPatientByName(name: string): Observable<any[]> {
    const params = new HttpParams().set('patient_name', name);
    return this.http.get<any[]>(this.ipddischargeurl, { params });
  }
  getDischargedPatientByUhid(name: string): Observable<any[]> {
    const params = new HttpParams().set('uhid', name);
    return this.http.get<any[]>(this.ipddischargeurl, { params });
  }
  //        getDischargedPatientById(name: string): Observable<any[]> {
  //   const params = new HttpParams().set('patient_name', name);
  //   return this.http.get<any[]>(this.ipddischargeurl, { params });
  // }

  getDischargedPatientById(ipdcaseid: string): Observable<any> {
    return this.http.get<any>(`${this.ipddischargeurl}`, {
      params: {
        _id: ipdcaseid,
      },
    });
  }

  getDischargeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.ipddischargeurl}/${id}`);
  }

  // tpa starts here

  private tpaurl = `${environment.baseurl}/thirdPartyAdministrator`;

  // gettpaurl(page: number = 1, limit: number = 100, search: string = ''): Observable<any> {
  //   let params = new HttpParams()
  //     .set('page', page.toString())
  //     .set('limit', limit.toString());

  //   if (search.trim()) {
  //     params = params.set('search', search);
  //   }

  //   return this.http.get<any>(this.tpaurl, { params });
  // }

  gettpaurl(
    page: number = 1,
    limit: number = 10,
    filterParam: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filterParam.trim()) {
      // filterParam is like: 'uhid=XXXX' OR 'patient_name=XXX'
      const [key, value] = filterParam.split('=');
      params = params.set(key, value);
    }

    return this.http.get<any>(this.tpaurl, { params });
  }

  posttpaurl(ipdroomtransferData: any): Observable<any> {
    return this.http.post<any>(this.tpaurl, ipdroomtransferData);
  }

  deletetpaurl(ipdroomtransferid: any): Observable<any> {
    return this.http.delete<any>(`${this.tpaurl}/${ipdroomtransferid}`);
  }

  updatetpaurl(
    ipdroomtransferid: any,
    ipdroomtransferData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.tpaurl}/${ipdroomtransferid}`,
      ipdroomtransferData
    );
  }

  // radioloogy
  private radiologyreq = `${environment.baseurl}/radiology-requests`;

  posttradiologyreq(ipdradiologyreqData: any): Observable<any> {
    return this.http.post<any>(this.radiologyreq, ipdradiologyreqData);
  }

  getradiologyreq(): Observable<any> {
    return this.http.get<any>(this.radiologyreq);
  }

  private radioinward = `${environment.baseurl}/radio-inward`;

  // Radio inward methods
  postRadioInward(data: any): Observable<any> {
    return this.http.post<any>(this.radioinward, data);
  }

  getRadioInwardRecords(
    page = 1,
    limit = 20,
    filters: any = {}
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    // Add filter params dynamically
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== null &&
        filters[key] !== undefined &&
        filters[key] !== ''
      ) {
        params = params.set(key, filters[key].toString());
      }
    });

    return this.http.get<any>(this.radioinward, { params });
  }

  getRadioInwardById(id: string): Observable<any> {
    return this.http.get<any>(`${this.radioinward}/${id}`);
  }

  updateRadioInward(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.radioinward}/${id}`, data);
  }

  uploadSignature(id: string, signatureData: FormData): Observable<any> {
    return this.http.post<any>(
      `${this.radioinward}/${id}/signature`,
      signatureData
    );
  }
  saveUserSignature(signatureData: any): Observable<any> {
    return this.http.post<any>(`${this.radioinward}/signatures`, signatureData);
  }

  // ✅ Delete user signature method
  deleteUserSignature(signatureId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.radioinward}/signatures/${signatureId}`
    );
  }

  // ✅ Fix the getUserSignatures method (if not properly implemented)
  getUserSignatures(userId: string): Observable<any> {
    return this.http.get<any>(`${this.radioinward}/signatures/${userId}`);
  }

  // ✅ Corrected Template methods
  createFindingTemplate(template: any): Observable<any> {
    return this.http.post<any>(`${this.radioinward}/templates`, template);
  }

  getTemplatesByService(serviceName?: string): Observable<any> {
    let params = new HttpParams();

    if (serviceName) {
      params = params.set('serviceName', serviceName);
    }

    return this.http.get<any>(`${this.radioinward}/templates/search`, {
      params,
    });
  }

  updateFindingTemplate(id: string, template: any): Observable<any> {
    return this.http.put<any>(`${this.radioinward}/templates/${id}`, template);
  }

  deleteFindingTemplate(id: string): Observable<any> {
    return this.http.delete<any>(`${this.radioinward}/templates/${id}`);
  }

  // ✅ Corrected Search similar reports method
  searchSimilarReports(criteria: {
    serviceName?: string;
    patientAge?: string | number;
    gender?: string;
  }): Observable<any> {
    let params = new HttpParams();

    if (criteria.serviceName) {
      params = params.set('serviceName', criteria.serviceName);
    }
    if (criteria.patientAge) {
      params = params.set('patientAge', criteria.patientAge.toString());
    }
    if (criteria.gender) {
      params = params.set('gender', criteria.gender);
    }

    return this.http.get<any>(`${this.radioinward}/search-similar`, { params });
  }

  // Additional utility methods
  getRadioInwardByStatus(status: string): Observable<any> {
    const params = new HttpParams().set('status', status);
    return this.http.get<any>(this.radioinward, { params });
  }

  getRadioInwardByDateRange(fromDate: string, toDate: string): Observable<any> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);

    return this.http.get<any>(this.radioinward, { params });
  }

  finalizeReport(id: string): Observable<any> {
    return this.http.put<any>(`${this.radioinward}/${id}`, {
      reportStatus: 'final',
      completedAt: new Date().toISOString(),
    });
  }

  // Treatment sheet api starts here
  private treatmentsheeturl = `${environment.baseurl}/treatmentSheet`;

  gettreatmentsheet(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (search.trim()) {
      params = params.set('search', search);
    }
    return this.http.get<any>(this.treatmentsheeturl, { params });
  }

  postTreatmentsheet(treatmentsheetData: any): Observable<any> {
    return this.http.post<any>(this.treatmentsheeturl, treatmentsheetData);
  }

  getTreatmentSheetById(id: string): Observable<any> {
    return this.http.get<any>(`${this.treatmentsheeturl}/${id}`);
  }

  updateTreatmentsheet(id: string, treatmentsheetData: any): Observable<any> {
    return this.http.put<any>(
      `${this.treatmentsheeturl}/${id}`,
      treatmentsheetData
    );
  }

  getTreatmentSheetByCase(id: string = ''): Observable<any> {
    let params = new HttpParams();
    if (id) {
      params = params.set('inpatientCaseId', id);
    }
    return this.http.get<any>(`${this.treatmentsheeturl}/case`, { params });
  }

  deleteTreatmentsheet(id: string): Observable<any> {
    return this.http.delete<any>(`${this.treatmentsheeturl}/${id}`);
  }

  // Progress report api starts here
  private dailyprogress = `${environment.baseurl}/progressReport`;

  getProgressReport(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (search.trim()) {
      params = params.set('search', search);
    }
    return this.http.get<any>(this.dailyprogress, { params });
  }

  postProgressReport(dailyProgressData: any): Observable<any> {
    return this.http.post<any>(this.dailyprogress, dailyProgressData);
  }

  getProgressReportById(id: string): Observable<any> {
    return this.http.get<any>(`${this.dailyprogress}/${id}`);
  }

  updateProgressReport(id: string, dailyProgressData: any): Observable<any> {
    return this.http.put<any>(`${this.dailyprogress}/${id}`, dailyProgressData);
  }

  getProgressReportByCase(id: string = ''): Observable<any> {
    let params = new HttpParams();
    if (id) {
      params = params.set('inpatientCaseId', id);
    }
    return this.http.get<any>(`${this.dailyprogress}/case`, { params });
  }

  deleteProgressReport(id: string): Observable<any> {
    return this.http.delete<any>(`${this.dailyprogress}/${id}`);
  }
}
