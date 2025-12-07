import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../../enviornment/env';
@Injectable({
  providedIn: 'root',
})
export class PoService {
  constructor(private http: HttpClient) {}

  // opdcase apis starts here
  private pogeneration = `${environment.baseurl}/purchase-order`;

// po.service.ts
getpogeneration(
  page: number = 1,
  limit: number = 10,
  search: string = '',
  status: string = '',
  poNumber: string = '',
  vendorName: string = ''
): Observable<any> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  // ✅ Add search by PO Number (matches your backend)
  if (poNumber.trim()) {
    params = params.set('poNumber', poNumber);
  }

  // ✅ Add search by Vendor Name (matches your backend)
  if (vendorName.trim()) {
    params = params.set('vendorName', vendorName);
  }

  // ✅ Keep general search for backward compatibility
  if (search.trim() && !poNumber && !vendorName) {
    // If general search is provided, try to determine if it's a PO number or vendor name
    if (search.includes('PO/') || search.includes('po/') || search.match(/^PO\d+/i)) {
      params = params.set('poNumber', search);
    } else {
      params = params.set('vendorName', search);
    }
  }

  if (status.trim()) {
    params = params.set('status', status);
  }

  console.log('🔍 API Call params:', params.toString()); // Debug log

  return this.http.get<any>(this.pogeneration, { params });
}

  getpogenerations(
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

    return this.http.get<any>(this.pogeneration, { params });
  }

  getpogenerationById(pogenerationid: string): Observable<any> {
    return this.http.get<any>(`${this.pogeneration}/${pogenerationid}`);
  }

  postpogeneration(pogenerationdata: any): Observable<any> {
    return this.http.post<any>(this.pogeneration, pogenerationdata);
  }

  deletepogeneration(pogenerationid: any): Observable<any> {
    return this.http.delete<any>(`${this.pogeneration}/${pogenerationid}`);
  }

  updatepogeneration(
    pogenerationid: any,
    pogenerationdata: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.pogeneration}/${pogenerationid}`,
      pogenerationdata
    );
  }

  getPurchaseOrderByPoNumber(poNumber: string): Observable<any> {
    return this.http.get<any>(
      `${this.pogeneration}?poNumber=${encodeURIComponent(poNumber)}`
    );
  }
  getPurchaseOrderByVendorName(vendorName: string): Observable<any> {
    return this.http.get<any>(
      `${this.pogeneration}?vendorName=${encodeURIComponent(vendorName)}`
    );
  }

  //     updatematerialstatusrequest(id: string, status: string): Observable<any> {
  //   return this.http.put(`${this.pogeneration}/${id}`, { status }); // ✅ status as key-value
  // }

  updatematerialstatusrequest(
    id: string,
    payload: { status: string; approvedBy: string }
  ) {
    return this.http.put<any>(`${this.pogeneration}/${id}`, payload);
  }

  getpogenerationByUhid(uhid: string): Observable<any[]> {
    const params = new HttpParams().set('uhid', uhid);
    return this.http.get<any[]>(this.pogeneration, { params });
  }

  // quoattiomn comparison

  getpogenerationcomparisonById(pogenerationid: string): Observable<any> {
    return this.http.get<any[]>(
      `${environment.baseurl}/vendor-quotation/rfq/${pogenerationid}`
    );
  }

  // Add these methods to your PoService class

// =================== RETURN PO METHODS ===================

// Get all Return POs
getReturnPOs(page: number = 1, limit: number = 10): Observable<any> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString())
    .set('poType', 'return'); // Filter for return POs

  return this.http.get<any>(this.pogeneration, { params });
}

// Get Return PO by ID
getReturnPOById(returnPOId: string): Observable<any> {
  return this.http.get<any>(`${this.pogeneration}/${returnPOId}`);
}

// Update Return PO status (vendor acknowledgment, etc.)
updateReturnPOStatus(returnPOId: string, status: string, notes?: string): Observable<any> {
  const payload = { status, notes };
  return this.http.put<any>(`${this.pogeneration}/${returnPOId}/status`, payload);
}




createReplacementPO(poData: any): Observable<any> {
  return this.http.post(`${this.pogeneration}/replacement`, poData);
}


getReplacementPOsByVendor(vendorId: string): Observable<any> {
  return this.http.get(`${this.pogeneration}/replacement/vendor/${vendorId}`);
}
}
