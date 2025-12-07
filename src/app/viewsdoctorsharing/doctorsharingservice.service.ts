import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../enviornment/env';

@Injectable({
  providedIn: 'root',
})
export class DoctorsharingserviceService {
  constructor(private http: HttpClient) {}

  private doctorsharing = `${environment.baseurl}/sharedPatientCases`;

  getSharedData(
    page: number = 1,
    limit: number = 10,
    filterParam: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filterParam.trim()) {
      const [key, value] = filterParam.split('=');
      params = params.set(key, value);
    }

    return this.http.get<any>(this.doctorsharing, { params });
  }

  getSharedDataById(patientId: string): Observable<any> {
    return this.http.get<any>(`${this.doctorsharing}/${patientId}`);
  }
}
