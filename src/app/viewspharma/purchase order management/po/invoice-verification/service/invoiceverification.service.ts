// services/invoiceverification.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../../../enviornment/env';

export interface InvoiceSearchParams {
  query?: string;
  type?: 'all' | 'pending' | 'paid';
  vendorId?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  paymentStatus?: string;
}

export interface PaymentData {
  paymentMode: string;
  transactionId: string;
  paymentDate?: string;
}
@Injectable({
  providedIn: 'root'
})
export class InvoiceverificationService {

  constructor(private http: HttpClient) {}

  private baseUrl = `${environment.baseurl}/invoice-verification`;

  // ✅ Verify Invoice (Create)
  verifyInvoice(invoiceData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/verify`, invoiceData);
  }

  // ✅ Get Verified Invoices (for Payment Processing)
  getVerifiedInvoices(
    page: number = 1,
    limit: number = 10,
    vendorId?: string,
    fromDate?: string,
    toDate?: string,
    status?: string,
    paymentStatus?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (vendorId) params = params.set('vendorId', vendorId);
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    if (status) params = params.set('status', status);
    if (paymentStatus) params = params.set('paymentStatus', paymentStatus);

    return this.http.get<any>(`${this.baseUrl}/verified`, { params });
  }

  // ✅ Get Invoice by ID
  getInvoiceById(invoiceId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${invoiceId}`);
  }

  // ✅ Update Payment Status
  updatePaymentStatus(invoiceId: string, paymentData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${invoiceId}/payment`, paymentData);
  }

  // ✅ Search Invoices
  searchInvoices(query: string, type: string = 'all'): Observable<any> {
    let params = new HttpParams()
      .set('query', query)
      .set('type', type);

    return this.http.get<any>(`${this.baseUrl}/search`, { params });
  }

  // ✅ Get Invoice Statistics
  getInvoiceStatistics(fromDate?: string, toDate?: string): Observable<any> {
    let params = new HttpParams();

    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);

    return this.http.get<any>(`${this.baseUrl}/statistics`, { params });
  }

  // ✅ Get Pending Invoices for Payment Processing
  getPendingInvoicesForPayment(): Observable<any> {
    return this.getVerifiedInvoices(1, 50, undefined, undefined, undefined, 'sent_to_accounts', 'pending');
  }

  // ✅ Get Paid Invoices
  getPaidInvoices(page: number = 1, limit: number = 10): Observable<any> {
    return this.getVerifiedInvoices(page, limit, undefined, undefined, undefined, 'payment_completed', 'paid');
  }

  // ✅ Get Invoices by Vendor
  getInvoicesByVendor(vendorId: string, page: number = 1, limit: number = 10): Observable<any> {
    return this.getVerifiedInvoices(page, limit, vendorId);
  }

  // ✅ Get Overdue Invoices
  getOverdueInvoices(): Observable<any> {
    const currentDate = new Date();
    const overdueDate = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago

    return this.getVerifiedInvoices(
      1, 50,
      undefined,
      overdueDate.toISOString().split('T')[0],
      currentDate.toISOString().split('T')[0],
      'sent_to_accounts',
      'pending'
    );
  }



// ✅ Advanced Search with multiple parameters
searchInvoicesAdvanced(params: InvoiceSearchParams): Observable<any> {
  let httpParams = new HttpParams();

  Object.keys(params).forEach(key => {
    const value = (params as any)[key];
    if (value !== undefined && value !== null && value !== '') {
      httpParams = httpParams.set(key, value);
    }
  });

  return this.http.get<any>(`${this.baseUrl}/search`, { params: httpParams });
}

// ✅ Bulk payment update
bulkUpdatePaymentStatus(invoiceIds: string[], paymentData: PaymentData): Observable<any> {
  return this.http.put<any>(`${this.baseUrl}/bulk-payment`, {
    invoiceIds,
    ...paymentData
  });
}

// ✅ Export invoices data

}
