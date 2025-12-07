import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../enviornment/env';
@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  constructor(private http: HttpClient) {}

  // pharmareq apis starts here
  private pharmareqapis = `${environment.baseurl}/pharmaceuticalRequestList`;

  //  getPatientByName(name: string): Observable<any[]> {
  //   const params = new HttpParams().set('patient_name', name);
  //   return this.http.get<any[]>(this.pharmareqapis, { params });
  // }

  getPharmareq(
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

    return this.http.get<any>(this.pharmareqapis, { params });
  }

  postPharmareq(PharmareqsData: any): Observable<any> {
    return this.http.post<any>(this.pharmareqapis, PharmareqsData);
  }
  postwithoutPharmareq(PharmareqsData: any): Observable<any> {
    return this.http.post<any>(
      `${this.pharmareqapis}/withoutipdpermission`,
      PharmareqsData
    );
  }

  deletePharmareq(pharmareqid: any): Observable<any> {
    return this.http.delete<any>(`${this.pharmareqapis}/${pharmareqid}`);
  }

  updatePharmareq(pharmareqid: any, PharmareqsData: any): Observable<any> {
    return this.http.put<any>(
      `${this.pharmareqapis}/${pharmareqid}`,
      PharmareqsData
    );
  }

  //     updatePharmaceuticalRequestList(id: string, data: any): Observable<any> {
  //   return this.http.put(`${this.pharmainwardapis}/${id}`, data);
  // }

  getpharmareqById(_id: string): Observable<any> {
    return this.http.get<any>(`${this.pharmareqapis}/${_id}`);
  }

  getpharmaByIpdCaseId(inpatientCaseId: string): Observable<any> {
    let params = new HttpParams().set('inpatientCaseId', inpatientCaseId);
    return this.http.get<any>(`${this.pharmareqapis}/case`, { params });
  }
  getpharmaByIpdCaseIdwithoutipdpermission(
    inpatientCaseId: string
  ): Observable<any> {
    let params = new HttpParams().set('inpatientCaseId', inpatientCaseId);
    return this.http.get<any>(`${this.pharmareqapis}/withoutipdpharmacase`, {
      params,
    });
  }

  getPatientByName(name: string): Observable<any[]> {
    const params = new HttpParams().set('patient_name', name);
    return this.http.get<any[]>(this.pharmareqapis, { params });
  }

  // getPatientByUhid(uhid: string): Observable<any[]> {
  //   const params = new HttpParams().set('uhid', uhid);
  //   return this.http.get<any[]>(this.pharmareqapis, { params });
  // }

  getPatientByUhid(name: string): Observable<any[]> {
    const params = new HttpParams().set('uhid', name);
    return this.http.get<any[]>(this.pharmareqapis, { params });
  }

  // vitals starts here
  // https://hims-rest-api-1ipi.onrender.com/v1/vitals/

  private vitalsapis = `${environment.baseurl}/vitals`;

  //  getPatientByName(name: string): Observable<any[]> {
  //   const params = new HttpParams().set('patient_name', name);
  //   return this.http.get<any[]>(this.pharmareqapis, { params });
  // }

  getVitals(
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

    return this.http.get<any>(this.vitalsapis, { params });
  }

  getVitalsByCaseId(outpatientCaseId: string): Observable<any> {
    let params = new HttpParams().set('outpatientCaseId', outpatientCaseId);

    return this.http.get<any>(`${this.vitalsapis}/case`, { params });
  }

  getVitalsByIpdCaseId(inpatientCaseId: string): Observable<any> {
    let params = new HttpParams().set('inpatientCaseId', inpatientCaseId);

    return this.http.get<any>(`${this.vitalsapis}/case`, { params });
  }

  postVitals(PharmareqsData: any): Observable<any> {
    return this.http.post<any>(this.vitalsapis, PharmareqsData);
  }

  deleteVitals(pharmareqid: any): Observable<any> {
    return this.http.delete<any>(`${this.vitalsapis}/${pharmareqid}`);
  }

  updateVitals(pharmareqid: any, PharmareqsData: any): Observable<any> {
    return this.http.put<any>(
      `${this.vitalsapis}/${pharmareqid}`,
      PharmareqsData
    );
  }

  getVitalsById(_id: string): Observable<any> {
    return this.http.get<any>(`${this.vitalsapis}/${_id}`);
  }

  // diagnosisSheet

  private diagnosisSheetapis = `${environment.baseurl}/diagnosisSheet`;

  getDiagnosissheet(
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

    return this.http.get<any>(this.diagnosisSheetapis, { params });
  }

  getDiagnosisByCaseId(outpatientCaseId: string): Observable<any> {
    let params = new HttpParams().set('outpatientCaseId', outpatientCaseId);

    return this.http.get<any>(`${this.diagnosisSheetapis}/case`, { params });
  }

  getDiagnosisByIpdCaseId(inpatientCaseId: string): Observable<any> {
    let params = new HttpParams().set('inpatientCaseId', inpatientCaseId);

    return this.http.get<any>(`${this.diagnosisSheetapis}/case`, { params });
  }

  getDiagnosisbyID(id: string): Observable<any> {
    return this.http.get<any>(`${this.diagnosisSheetapis}/${id}`);
  }

  postDiagnosissheet(diagnosisSheetapisData: any): Observable<any> {
    return this.http.post<any>(this.diagnosisSheetapis, diagnosisSheetapisData);
  }

  deleteDiagnosissheet(diagnosisSheetapisid: any): Observable<any> {
    return this.http.delete<any>(
      `${this.diagnosisSheetapis}/${diagnosisSheetapisid}`
    );
  }

  updateDiagnosissheet(
    diagnosisSheetapisid: any,
    diagnosisSheetapisData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.diagnosisSheetapis}/${diagnosisSheetapisid}`,
      diagnosisSheetapisData
    );
  }

  // multidepartment request

  private reuesttestapis = `${environment.baseurl}/departmentRequestList`;

  getreuesttestapis(search: string = ''): Observable<any> {
    let params = new HttpParams();
    // .set('page', page.toString())
    // .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.reuesttestapis, { params });
  }

  getreqById(_id: string): Observable<any> {
    return this.http.get<any>(`${this.reuesttestapis}/${_id}`);
  }

  getPatientByNamedeptreq(name: string): Observable<any[]> {
    const params = new HttpParams().set('patient_name', name);
    return this.http.get<any[]>(this.reuesttestapis, { params });
  }
  getPatientByUhiddeptreq(name: string): Observable<any[]> {
    const params = new HttpParams().set('uhid', name);
    return this.http.get<any[]>(this.reuesttestapis, { params });
  }

  postreuesttestapis(reuesttestData: any): Observable<any> {
    return this.http.post<any>(this.reuesttestapis, reuesttestData);
  }

  deletereuesttestapis(reuesttestid: any): Observable<any> {
    return this.http.delete<any>(`${this.reuesttestapis}/${reuesttestid}`);
  }

  updatereuesttestapis(
    reuesttestid: any,
    reuesttestData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.reuesttestapis}/${reuesttestid}`,
      reuesttestData
    );
  }

  // ot notes starts here

  private operationNoteapis = `${environment.baseurl}/operationTheatreNotes`;

  getoperationNote(
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

    return this.http.get<any>(this.operationNoteapis, { params });
  }

  getotNote(): Observable<any> {
    return this.http.get<any>(this.operationNoteapis);
  }

  postoperationNoteapisapis(otData: any): Observable<any> {
    return this.http.post<any>(this.operationNoteapis, otData);
  }

  getOtNoteByCaseId(inpatientCaseId: string): Observable<any> {
    let params = new HttpParams().set('inpatientCaseId', inpatientCaseId);
    return this.http.get<any>(`${this.operationNoteapis}/case`, { params });
  }

  deleteoperationNoteapisapis(otid: any): Observable<any> {
    return this.http.delete<any>(`${this.operationNoteapis}/${otid}`);
  }

  updateoperationNoteapisapis(otid: any, otData: any): Observable<any> {
    return this.http.put<any>(`${this.operationNoteapis}/${otid}`, otData);
  }

  // treatment history sheeet

  private treatmentHistorySheetapis = `${environment.baseurl}/treatmentHistorySheet`;

  gettreatmentHistorySheetapis(
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

    return this.http.get<any>(this.treatmentHistorySheetapis, { params });
  }
  gettreatmentHistorySheetapi(): Observable<any> {
    return this.http.get<any>(this.treatmentHistorySheetapis);
  }

  posttreatmentHistorySheetapis(otData: any): Observable<any> {
    return this.http.post<any>(this.treatmentHistorySheetapis, otData);
  }

  deletetreatmentHistorySheetapis(otid: any): Observable<any> {
    return this.http.delete<any>(`${this.treatmentHistorySheetapis}/${otid}`);
  }

  updatetreatmentHistorySheetapis(otid: any, otData: any): Observable<any> {
    return this.http.put<any>(
      `${this.treatmentHistorySheetapis}/${otid}`,
      otData
    );
  }

  getTreatmentHistorySheetByCaseId(inpatientCaseId: string): Observable<any> {
    let params = new HttpParams().set('inpatientCaseId', inpatientCaseId);
    return this.http.get<any>(`${this.treatmentHistorySheetapis}/case`, {
      params,
    });
  }
  // discharge summary

  private dischargeSummary = `${environment.baseurl}/dischargeSummary`;

  getdischargeSummaries(
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

    return this.http.get<any>(this.dischargeSummary, { params });
  }
  getdischargeSummary(): Observable<any> {
    return this.http.get<any>(this.dischargeSummary);
  }

  getdischargeSummaryById(id: string): Observable<any> {
    return this.http.get<any>(`${this.dischargeSummary}/${id}`);
  }

  getDischargeSummaryByCase(id: string): Observable<any> {
    let params = new HttpParams().set('inpatientCaseId', id);
    return this.http.get<any>(`${this.dischargeSummary}/case`, { params });
  }

  postdischargeSummary(otData: any): Observable<any> {
    return this.http.post<any>(this.dischargeSummary, otData);
  }

  deletedischargeSummary(otid: any): Observable<any> {
    return this.http.delete<any>(`${this.dischargeSummary}/${otid}`);
  }

  updatedischargeSummary(otid: any, otData: any): Observable<any> {
    return this.http.put<any>(`${this.dischargeSummary}/${otid}`, otData);
  }
}
