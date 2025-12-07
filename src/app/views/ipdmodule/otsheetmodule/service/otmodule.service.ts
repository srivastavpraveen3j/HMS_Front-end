import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../enviornment/env';

@Injectable({
  providedIn: 'root'
})
export class OtmoduleService {

  constructor(private http : HttpClient) { }



   // ot notes starts here

  private operationChargeapis = `${environment.baseurl}/operationCharge`;

  getoperationCharge(
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

    return this.http.get<any>(this.operationChargeapis, { params });
  }

  getotCharge(): Observable<any> {
    return this.http.get<any>(this.operationChargeapis);
  }

  postoperationChargeapis(otData: any): Observable<any> {
    return this.http.post<any>(this.operationChargeapis, otData);
  }

  getoperationChargeByCaseId(inpatientCaseId: string): Observable<any> {
    let params = new HttpParams().set('inpatientCaseId', inpatientCaseId);
    return this.http.get<any>(`${this.operationChargeapis}/case`, { params });
  }

  deleteoperationChargeapisapis(otid: any): Observable<any> {
    return this.http.delete<any>(`${this.operationChargeapis}/${otid}`);
  }

  updateoperationChargeapisapis(otid: any, otData: any): Observable<any> {
    return this.http.put<any>(`${this.operationChargeapis}/${otid}`, otData);
  }
}
