import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../enviornment/env';

@Injectable({
  providedIn: 'root',
})
export class DoctorreferralService {
  constructor(private http: HttpClient) {}

  private referral = `${environment.baseurl}/doctorReferral`;

  postReferralData(referralData: any): Observable<any> {
    return this.http.post(this.referral, referralData);
  }

  getReferralData(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search.toString());
    }
    return this.http.get(this.referral, { params });
  }

  getReferralDataById(referralId: any): Observable<any> {
    return this.http.get(`${this.referral}/${referralId}`);
  }

  updateReferralData(referralId: any, referralData: any): Observable<any> {
    return this.http.put(`${this.referral}/${referralId}`, referralData);
  }

  deleteReferralData(referralId: any): Observable<any> {
    return this.http.delete(`${this.referral}/${referralId}`);
  }

  //==> audit

  private audit = `${environment.baseurl}/auditLog`;

  getAudits(page: number = 1, limit: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get(this.audit, { params });
  }
}
