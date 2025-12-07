import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../enviornment/env';

@Injectable({
  providedIn: 'root',
})
export class UhidService {
  constructor(private http: HttpClient) {}

  private uhid = `${environment.baseurl}/uhid`;

  getUhid(
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

    return this.http.get<any>(this.uhid, { params });
  }

  // add medicine
  postuhid(uhidData: any): Observable<any> {
    return this.http.post<any>(this.uhid, uhidData);
  }

  deleteuhid(uhidid: any): Observable<any> {
    return this.http.delete<any>(`${this.uhid}/${uhidid}`);
  }

  updateuhid(uhidid: any, uhidData: any): Observable<any> {
    return this.http.put<any>(`${this.uhid}/${uhidid}`, uhidData);
  }

  // getPatientByName(name: string): Observable<any[]> {
  //   const params = new HttpParams().set('patient_name', name);
  //   return this.http.get<any[]>(`${this.uhid}`, { params });
  // }

  getPatientByName(name: string): Observable<any[]> {
    const params = new HttpParams().set('patient_name', name);
    return this.http.get<any[]>(this.uhid, { params });
  }

  getPatientByFilters(filters: { [key: string]: string }): Observable<any[]> {
    let params = new HttpParams();
    for (const key in filters) {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    }
    return this.http.get<any[]>(this.uhid, { params });
  }

  // getPatientByName(name: string): Observable<any[]> {
  //   const params = new HttpParams().set('patient_name', name);
  //   return this.http.get<any[]>(`${this.uhid}`, { params });
  // }

  // getPatientByName(name: string): Observable<any[]> {

  //   const params = new HttpParams().set('patient_name', name);
  //   return this.http.get<any[]>(`${this.uhid}`, { params });
  // }

  getUhidBySearch(name: string): Observable<any> {
    return this.getUhid(1, 10, name); // Reuse existing paginated method
  }

  // getUhidById(uhid: string): Observable<any> {
  //   return this.http.get<any>(`${this.uhid}`, {
  //     params: {
  //       _id: uhid
  //     }
  //   });
  // }

  getUhidById(uhid: string): Observable<any> {
    return this.http.get<any>(`${this.uhid}/${uhid}`);
  }

  getUhidWithParams(params: HttpParams) {
    return this.http.get<any>(`${this.uhid}`, { params });
  }
}
