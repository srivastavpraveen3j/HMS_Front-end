import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../enviornment/env';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  private apiUrl = `${environment.baseurl}/vendor`;
  // private bulkuploadUrl = `${environment.baseurl}/doctor/import`;

  constructor(private http: HttpClient) {}

  uploadVendorCSV(fileData: FormData) {
    return this.http.post(`${environment.baseurl}/vendor/import`, fileData);
  }

getvendor(
  page: number = 1,
  limit: number = 25,
  search: string = ''
): Observable<any> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  // ✅ FIXED: Use correct parameter name based on your API
  if (search.trim()) {
    params = params.set('vendorName', search); // Use 'vendorName' as shown in your API URL
    // Alternative: If your API uses 'search' parameter instead:
    // params = params.set('search', search);
  }

  return this.http.get<any>(this.apiUrl, { params });
}


  getvendors(
    page: number,
    limit: number,
    vednorName: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (vednorName.trim()) {
      params = params.set('vednorName', vednorName.trim());
    }

    return this.http.get<any>(`${this.apiUrl}`, { params });
  }

  // getvendorsByName(name: string): Observable<any> {
  //   const params = new HttpParams().set('name', name.trim());
  //   return this.http.get<any>(this.apiUrl, { params });
  // }

  getvendorsByName(filters: any = {}) {
    return this.http.get(this.apiUrl, { params: filters });
  }
  // add doctor
  postvendor(vendordata: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, vendordata);
  }

  // delete doctor

  deletevendor(vendorid: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${vendorid}`);
  }

  // udpate doctor

  updatevendor(vendorid: any, vendordata: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${vendorid}`, vendordata);
  }

  // getdocotorbyid
  getvendorById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
