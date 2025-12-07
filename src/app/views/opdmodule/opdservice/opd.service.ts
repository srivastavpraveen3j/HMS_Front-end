import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../enviornment/env';

@Injectable({
  providedIn: 'root',
})
export class OpdService {
  constructor(private http: HttpClient) { }

  // opdcase apis starts here
  private opdCaseapis = `${environment.baseurl}/OutpatientCase`;

  // getOPDcase(){
  //   return this.http.get<any>(this.opdCaseapis)
  // }

  // getOPDcase(params: { page: number, limit: number, search: string }) {
  //   const { page, limit, search } = params;
  //   return this.http.get<any>(`/api/opd-cases?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
  // }

  getOPDcase(
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

    return this.http.get<any>(this.opdCaseapis, { params });
  }

  getOPDcaseByDoctorId(
    doctorId: string,
  ): Observable<any> {
    return this.http.get<any>(`${this.opdCaseapis}/getByDoctorFilter?doctorId=${doctorId}`);
  }

  searchOPDcase(
    searchText: string,
  ): Observable<any> {
    return this.http.get<any>(`${this.opdCaseapis}/search?searchText=${searchText}&searchType=text`);
  }

  searchOPDcasebyUHID(
    searchText: string,
  ): Observable<any> {
    return this.http.get<any>(`${this.opdCaseapis}/search?searchText=${searchText}&searchType=UHID`);
  }

  // getOPDcaseById(opdcaseid: string): Observable<any> {
  //   return this.http.get<any>(`${this.opdCaseapis}`, {
  //     params: {
  //       _id: opdcaseid,
  //     },
  //   });
  // }

  getOPDcaseById(opdcaseid: string): Observable<any> {
    return this.http.get<any>(`${this.opdCaseapis}/${opdcaseid}`);
  }

  postOPDcase(OPDcasesData: any): Observable<any> {
    return this.http.post<any>(this.opdCaseapis, OPDcasesData);
  }

  deleteOPDcase(opdcaseid: any): Observable<any> {
    return this.http.delete<any>(`${this.opdCaseapis}/${opdcaseid}`);
  }

  updateOPDcase(opdcaseid: any, OPDcasesData: any): Observable<any> {
    return this.http.put<any>(`${this.opdCaseapis}/${opdcaseid}`, OPDcasesData);
  }

  getOPDCaseByUhid(uhid: string): Observable<any[]> {
    const params = new HttpParams().set('uhid', uhid);
    return this.http.get<any[]>(this.opdCaseapis, { params });
  }

  // opd bill apis starts here

  private outpatientBillapis = `${environment.baseurl}/outpatientBill`;

  getOPDbill(
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

    return this.http.get<any>(this.outpatientBillapis, { params });
  }

  getOPDbillByCaseId(outpatientCaseId: string): Observable<any> {
    console.log("case id", outpatientCaseId)
    let params = new HttpParams().set('outpatientCaseId', outpatientCaseId);

    return this.http.get<any>(`${this.outpatientBillapis}/case`, { params });
  }

  postOPDbill(outpatientBillapisData: any): Observable<any> {
    return this.http.post<any>(this.outpatientBillapis, outpatientBillapisData);
  }

  getOPDbillById(opdbillid: string): Observable<any> {
    return this.http.get<any>(`${this.outpatientBillapis}/${opdbillid}`);
  }

  deleteOPDbill(outpatientBillapisid: any): Observable<any> {
    return this.http.delete<any>(
      `${this.outpatientBillapis}/${outpatientBillapisid}`
    );
  }

  updateOPDbill(
    outpatientBillapisid: any,
    outpatientBillapisData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.outpatientBillapis}/${outpatientBillapisid}`,
      outpatientBillapisData
    );
  }

  getOPDbillbyPatientName(name: string): Observable<any[]> {
    const params = new HttpParams().set('patient_name', name);
    return this.http.get<any[]>(`${this.outpatientBillapis}`, { params });
  }

  //  opd visting history

  private outpatienthistoryapis = `${environment.baseurl}/outpatientVisitingHistory`;

  getOPDhistory(
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

    return this.http.get<any>(this.outpatienthistoryapis, { params });
  }

  postOPDhistory(outpatientBillapisData: any): Observable<any> {
    return this.http.post<any>(
      this.outpatienthistoryapis,
      outpatientBillapisData
    );
  }

  deleteOPDhistory(outpatientBillapisid: any): Observable<any> {
    return this.http.delete<any>(
      `${this.outpatienthistoryapis}/${outpatientBillapisid}`
    );
  }

  updateOPDhistory(
    outpatientBillapisid: any,
    outpatientBillapisData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.outpatienthistoryapis}/${outpatientBillapisid}`,
      outpatientBillapisData
    );
  }

  // medical record data

  private opdmrdapis = `${environment.baseurl}/medicalRecordDocument`;

  getopdmrd(
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

    return this.http.get<any>(this.opdmrdapis, { params });
  }

  postopdmrd(outpatientBillapisData: any): Observable<any> {
    return this.http.post<any>(this.opdmrdapis, outpatientBillapisData);
  }

  deleteopdmrd(outpatientBillapisid: any): Observable<any> {
    return this.http.delete<any>(`${this.opdmrdapis}/${outpatientBillapisid}`);
  }

  updateopdmrd(
    outpatientBillapisid: any,
    outpatientBillapisData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.opdmrdapis}/${outpatientBillapisid}`,
      outpatientBillapisData
    );
  }

  // opd deposit starts here

  private opdreturnapis = `${environment.baseurl}/outpatientReturn`;

  getopdreturnapis(
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

    return this.http.get<any>(this.opdreturnapis, { params });
  }

  postopdreturnapis(opdreturnapisData: any): Observable<any> {
    return this.http.post<any>(this.opdreturnapis, opdreturnapisData);
  }

  deleteopdreturnapis(opdreturnapisid: any): Observable<any> {
    return this.http.delete<any>(`${this.opdreturnapis}/${opdreturnapisid}`);
  }

  updateopdreturnapis(
    opdreturnapisid: any,
    opdreturnapisData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.opdreturnapis}/${opdreturnapisid}`,
      opdreturnapisData
    );
  }

  // opd return starts here

  private opddepositapis = `${environment.baseurl}/outpatientDeposit`;

  getopdopddepositapis(
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

    return this.http.get<any>(this.opddepositapis, { params });
  }

  postopdopddepositapis(outpatientdepositData: any): Observable<any> {
    return this.http.post<any>(this.opddepositapis, outpatientdepositData);
  }

  deleteopdopddepositapis(outpatientdepositid: any): Observable<any> {
    return this.http.delete<any>(
      `${this.opddepositapis}/${outpatientdepositid}`
    );
  }

  updateopdopddepositapis(
    outpatientdepositid: any,
    outpatientdepositData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.opddepositapis}/${outpatientdepositid}`,
      outpatientdepositData
    );
  }

  // opd appointment starts here

  private opdappointmentapis = `${environment.baseurl}/appointment`;

  getopdappointmentapis(
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

    return this.http.get<any>(this.opdappointmentapis, { params });
  }

  getAppointmentByFilters(filters: {
    [key: string]: string;
  }): Observable<any[]> {
    let params = new HttpParams();
    for (const key in filters) {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    }
    return this.http.get<any[]>(this.opdappointmentapis, { params });
  }

  getOpdAppointmentApis(): Observable<any> {
    return this.http.get<any>(this.opdappointmentapis);
  }

  postopdappointmentapis(opdappointmentapisData: any): Observable<any> {
    return this.http.post<any>(this.opdappointmentapis, opdappointmentapisData);
  }

  getOpdAppointmentbyid(opdappointmentid: string): Observable<any> {
    return this.http.get<any>(`${this.opdappointmentapis}/${opdappointmentid}`);
  }

  deleteopdappointmentapis(opdappointmentapisid: any): Observable<any> {
    return this.http.delete<any>(
      `${this.opdappointmentapis}/${opdappointmentapisid}`
    );
  }

  updateopdappointmentapis(
    opdappointmentapisid: any,
    opdappointmentapisData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.opdappointmentapis}/${opdappointmentapisid}`,
      opdappointmentapisData
    );
  }

  // opd history is here

  private Opdhistoryapis = `${environment.baseurl}/outpatientVisitingHistory`;

  getOPDhistoryById(opdcaseid: string): Observable<any> {
    return this.http.get<any>(this.Opdhistoryapis, {
      params: {
        _id: opdcaseid,
      },
    });
  }

  //opd by bill number
  private outpatientBillApi = `${environment.baseurl}/outpatientBill`;

  getOPDBillByBillNumber(billnumber: number): Observable<any> {
    return this.http.get<any>(this.outpatientBillApi, {
      params: {
        billnumber: billnumber.toString(),
      },
    });
  }

  getOPDBillById(_id: string): Observable<any> {
    return this.http.get<any>(`${this.outpatientBillApi}/${_id}`);
  }

  // medical legal emergency starts here

  private outpatientmedicoLegalCaseApi = `${environment.baseurl}/medicoLegalCase`;

  getopdedicoLegalCaseapis(
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

    return this.http.get<any>(this.outpatientmedicoLegalCaseApi, { params });
  }

  getMedicalCaseById(_id: string): Observable<any> {
    return this.http.get<any>(`${this.outpatientmedicoLegalCaseApi}/${_id}`);
  }

  postopdedicoLegalCaseapis(opdData: any): Observable<any> {
    return this.http.post<any>(this.outpatientmedicoLegalCaseApi, opdData);
  }

  deleteopdedicoLegalCaseapis(opdid: any): Observable<any> {
    return this.http.delete<any>(
      `${this.outpatientmedicoLegalCaseApi}/${opdid}`
    );
  }

  updateopdedicoLegalCaseapis(opdid: any, opdData: any): Observable<any> {
    return this.http.put<any>(
      `${this.outpatientmedicoLegalCaseApi}/${opdid}`,
      opdData
    );
  }

  // get opd case by doctor name

  private opdcasebydocname = `${environment.baseurl}/outpatientCase/getByDoctorFilter`;

  getOPDCasesByDoctorFilter(doctorName: string = ''): Observable<any> {
    let params = new HttpParams();

    if (doctorName.trim()) {
      params = params.set('name', doctorName); // Backend expects 'name'
    }

    return this.http.get<any>(this.opdcasebydocname, { params });
  }

  private sessionApi = `${environment.baseurl}/session`;

  startSession(doctorId: string): Observable<any> {
    return this.http.post<any>(`${this.sessionApi}/start`, { doctorId });
  }

  endSession(doctorId: string): Observable<any> {
    return this.http.post<any>(`${this.sessionApi}/stop`, { doctorId });
  }

  addPatientToQueue(patientData: any): Observable<any> {
    return this.http.post<any>(`${this.sessionApi}/patient/add`, patientData);
  }

  getQueues(doctorId: string): Observable<any> {
    return this.http.get<any>(
      `${this.sessionApi}/queue/${doctorId}`
    );
  }

  updateQueue(queueData: any): Observable<any> {
    return this.http.put<any>(
      `${this.sessionApi}/patient/update`,
      queueData
    );
  }

  checkForActiveDoctor(): Observable<any> {
    return this.http.get<any>(`${this.sessionApi}/active`);
  }

  // procedure services

  private procedure = `${environment.baseurl}/procedure`;

  getprocedure(
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

    return this.http.get<any>(this.procedure, { params });
  }

  getprocedureById(_id: string): Observable<any> {
    return this.http.get<any>(`${this.procedure}/${_id}`);
  }

  postprocedureapis(opdData: any): Observable<any> {
    return this.http.post<any>(this.procedure, opdData);
  }

  deleteprocedureapis(opdid: any): Observable<any> {
    return this.http.delete<any>(
      `${this.procedure}/${opdid}`
    );
  }

  getProcedureByCaseId(outpatientCaseId: string): Observable<any> {
    let params = new HttpParams().set('outpatientCaseId', outpatientCaseId);

    return this.http.get<any>(`${this.procedure}`, { params });
  }

  updateprocedureapis(opdid: any, opdData: any): Observable<any> {
    return this.http.put<any>(
      `${this.procedure}/${opdid}`,
      opdData
    );
  }

}
