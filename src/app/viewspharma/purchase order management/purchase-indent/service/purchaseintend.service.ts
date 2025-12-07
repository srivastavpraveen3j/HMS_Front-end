import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../../enviornment/env';
@Injectable({
  providedIn: 'root',
})
export class PurchaseintendService {
  constructor(private http: HttpClient) {}

  // opdcase apis starts here
  private materialrequest = `${environment.baseurl}/purchase-indents`;

  // getOPDcase(){
  //   return this.http.get<any>(this.opdCaseapis)
  // }

  // getOPDcase(params: { page: number, limit: number, search: string }) {
  //   const { page, limit, search } = params;
  //   return this.http.get<any>(`/api/opd-cases?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
  // }

 // service/purchaseintend.service.ts
getmaterialrequest(
  page: number = 1,
  limit: number = 10,
  search: string = '',
  status: string = '',
  startDate?: string,
  endDate?: string
): Observable<any> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  if (search.trim()) {
    params = params.set('search', search);
  }

  if (status.trim()) {
    params = params.set('status', status);
  }

  // ✅ Add date range parameters
  if (startDate) {
    params = params.set('startDate', startDate);
  }

  if (endDate) {
    params = params.set('endDate', endDate);
  }

  return this.http.get<any>(this.materialrequest, { params });
}

  getmaterialrequests(
    page: number = 1,
    limit: number = 1000,
    search: string = '',
    status: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    if (status.trim()) {
      params = params.set('status', status);
    }

    return this.http.get<any>(this.materialrequest, { params });
  }

  getmaterialrequestById(opdcaseid: string): Observable<any> {
    return this.http.get<any>(`${this.materialrequest}/${opdcaseid}`);
  }

  postmaterialrequest(OPDcasesData: any): Observable<any> {
    return this.http.post<any>(this.materialrequest, OPDcasesData);
  }

  deletematerialrequest(opdcaseid: any): Observable<any> {
    return this.http.delete<any>(`${this.materialrequest}/${opdcaseid}`);
  }

  updatematerialrequest(opdcaseid: any, OPDcasesData: any): Observable<any> {
    return this.http.put<any>(
      `${this.materialrequest}/${opdcaseid}`,
      OPDcasesData
    );
  }

  //     updatematerialstatusrequest(id: string, status: string): Observable<any> {
  //   return this.http.put(`${this.materialrequest}/${id}`, { status }); // ✅ status as key-value
  // }

  updatematerialstatusrequest(
    id: string,
    payload: { status: string; approvedBy: string }
  ) {
    return this.http.put<any>(`${this.materialrequest}/${id}`, payload);
  }

  getmaterialrequestByUhid(uhid: string): Observable<any[]> {
    const params = new HttpParams().set('uhid', uhid);
    return this.http.get<any[]>(this.materialrequest, { params });
  }
}
