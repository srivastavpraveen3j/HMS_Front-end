import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../../enviornment/env';
@Injectable({
  providedIn: 'root',
})
export class RequestquotationService {
  constructor(private http: HttpClient) {}

  // opdcase apis starts here
  private requestquotation = `${environment.baseurl}/request-quotation`;

  // getOPDcase(){
  //   return this.http.get<any>(this.opdCaseapis)
  // }

  // getOPDcase(params: { page: number, limit: number, search: string }) {
  //   const { page, limit, search } = params;
  //   return this.http.get<any>(`/api/opd-cases?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
  // }

  getrequestquotation(
    page: number = 1,
    limit: number = 10,
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

    return this.http.get<any>(this.requestquotation, { params });
  }
  getrequestquotations(
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

    return this.http.get<any>(this.requestquotation, { params });
  }

  getrequestquotationById(requestquotationid: string): Observable<any> {
    return this.http.get<any>(`${this.requestquotation}/${requestquotationid}`);
  }

  postrequestquotation(requestquotationdata: any): Observable<any> {
    return this.http.post<any>(this.requestquotation, requestquotationdata);
  }

  deleterequestquotation(requestquotationid: any): Observable<any> {
    return this.http.delete<any>(
      `${this.requestquotation}/${requestquotationid}`
    );
  }

  updaterequestquotation(
    requestquotationid: any,
    requestquotationdata: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.requestquotation}/${requestquotationid}`,
      requestquotationdata
    );
  }

  //     updatematerialstatusrequest(id: string, status: string): Observable<any> {
  //   return this.http.put(`${this.requestquotation}/${id}`, { status }); // ✅ status as key-value
  // }

  updatematerialstatusrequest(
    id: string,
    payload: { status: string; approvedBy: string }
  ) {
    return this.http.put<any>(`${this.requestquotation}/${id}`, payload);
  }

  getrequestquotationByUhid(uhid: string): Observable<any[]> {
    const params = new HttpParams().set('uhid', uhid);
    return this.http.get<any[]>(this.requestquotation, { params });
  }

  // quoattiomn comparison

  getrequestquotationcomparisonById(
    requestquotationid: string
  ): Observable<any> {
    return this.http.get<any[]>(
      `${environment.baseurl}/vendor-quotation/rfq/${requestquotationid}`
    );
  }
}
