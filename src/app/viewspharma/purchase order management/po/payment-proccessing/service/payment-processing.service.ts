// services/payment-processing.service.ts

import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../../../enviornment/env';

export interface PaymentData {
  paymentMode: string;
  transactionId: string;
  paymentDate: string;
  remarks?: string;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    branchName?: string;
  };
  userId?: string; // For localStorage user
}

export interface BulkPaymentData extends PaymentData {
  invoiceIds: string[];
}

export interface PaymentFilters {
  status?: string;
  paymentMode?: string;
  vendorId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentProcessingService {

  constructor(private http: HttpClient) {}

  private baseUrl = `${environment.baseurl}/payment-processing`;
  private invoiceUrl = `${environment.baseurl}/invoice-verification`;

  // ✅ Helper method to get user ID from localStorage
  private getUserId(): string {
    const userData = localStorage.getItem('authUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user?._id || '';
      } catch (e) {
        console.error('Error parsing authUser from localStorage:', e);
        return '';
      }
    }
    return '';
  }

  // ✅ Helper method to get auth headers (if needed)
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // ✅ Process single payment
  processPayment(invoiceId: string, paymentData: PaymentData): Observable<any> {
    const userId = this.getUserId();
    const paymentPayload = {
      ...paymentData,
      userId
    };

    console.log('💰 Processing payment:', paymentPayload);
    return this.http.post<any>(`${this.baseUrl}/process/${invoiceId}`, paymentPayload);
  }

  // ✅ Process bulk payment
  processBulkPayment(invoiceIds: string[], paymentData: PaymentData): Observable<any> {
    const userId = this.getUserId();
    const bulkPaymentData = {
      invoiceIds,
      ...paymentData,
      userId
    };

    console.log('💰 Processing bulk payment:', bulkPaymentData);
    return this.http.post<any>(`${this.baseUrl}/bulk-payment`, bulkPaymentData);
  }

  // ✅ Get payment history
  getPaymentHistory(
    page: number = 1,
    limit: number = 10,
    filters?: PaymentFilters
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value);
        }
      });
    }

    return this.http.get<any>(`${this.baseUrl}/history`, { params });
  }

  // ✅ Get payment statistics
  getPaymentStatistics(fromDate?: string, toDate?: string): Observable<any> {
    let params = new HttpParams();

    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);

    return this.http.get<any>(`${this.baseUrl}/statistics`, { params });
  }

  // ✅ Get overdue payments
  getOverduePayments(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/overdue`);
  }

  // ✅ Get payment by ID
  getPaymentById(paymentId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${paymentId}`);
  }

  // ✅ Cancel payment
  cancelPayment(paymentId: string, reason: string): Observable<any> {
    const userId = this.getUserId();
    return this.http.put<any>(`${this.baseUrl}/cancel/${paymentId}`, {
      reason,
      userId
    });
  }

  // ✅ Generate payment report
  generatePaymentReport(format: 'excel' | 'pdf' = 'excel', filters?: PaymentFilters): Observable<Blob> {
    let params = new HttpParams().set('format', format);

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value);
        }
      });
    }

    return this.http.get(`${this.baseUrl}/report`, {
      params,
      responseType: 'blob'
    });
  }

  // ✅ Get pending invoices for payment (from invoice service)
  getPendingInvoicesForPayment(): Observable<any> {
    let params = new HttpParams()
      .set('page', '1')
      .set('limit', '100')
      .set('status', 'sent_to_accounts')
      .set('paymentStatus', 'pending');

    return this.http.get<any>(`${this.invoiceUrl}/verified`, { params });
  }

  // ✅ Search payments
  searchPayments(query: string): Observable<any> {
    let params = new HttpParams()
      .set('search', query)
      .set('limit', '20');

    return this.http.get<any>(`${this.baseUrl}/history`, { params });
  }

  // payment-processing.service.ts

// ✅ Add this method to your service if it doesn't exist
// generatePaymentReport(format: 'excel' | 'pdf', filters: PaymentFilters): Observable<Blob> {
//   const params = new HttpParams({ fromObject: { ...filters, format } });

//   return this.http.get(`${this.baseUrl}/reports/payments`, {
//     params,
//     responseType: 'blob'
//   }).pipe(
//     catchError(error => {
//       console.error('❌ Report generation failed:', error);
//       throw error;
//     })
//   );
// }

}
