import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { environment } from '../../../../enviornment/env';
import { filter } from 'rxjs/operators';

export interface DiscountRequestPayload {
  uhid: string;
  OutpatientBillID: string;
  discount: number;
  reason: string;
  discountStatus: 'pending' | 'approved' | 'rejected' | 'none';
  requestedBy: string | null;
  isDiscountRequested: boolean;
}

export interface DiscountRequest {
  uhid: string;
  patientBillingId: string;
  discount: number;
  reason: string;
  discountStatus: 'pending' | 'approved' | 'rejected' | 'none';
  requestedBy: string | null;
}

export interface DiscountStatusResponse {
  status: 'none' | 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DiscountService {
  private baseUrl = environment.baseurl + '/discountMeta';
  private selectedRequest: any;

  // 🔹 Use BehaviorSubject with initial empty array
  private discountDataSource = new BehaviorSubject<any[]>([]);
  discountData$ = this.discountDataSource.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // 🔹 Reset discount data when navigating between /case and /opdbill
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        if (url.includes('/case') || url.includes('/opdbill')) {
          this.resetDiscountData();
        }
      });
  }

  // 🔹 Set currently selected discount request
  setSelectedRequest(data: any) {
    this.selectedRequest = data;
  }

  // 🔹 Emit new discount data
  emitDiscountData(data: any[]) {
    this.discountDataSource.next(data);
  }

  // 🔹 Reset discount data
  resetDiscountData() {
    this.discountDataSource.next([]);
    this.selectedRequest = null;
  }

  // 🔹 Get all discount requests
  getDiscountRequests(): Observable<DiscountRequestPayload[]> {
    return this.http.get<DiscountRequestPayload[]>(this.baseUrl);
  }

  // 🔹 Get discount requests by Bill ID
  getDiscountRequestsbyBillId(billId: any): Observable<DiscountRequestPayload[]> {
    return this.http.get<DiscountRequestPayload[]>(`${this.baseUrl}/bill/${billId}`);
  }

  // 🔹 Submit a new discount request
  requestDiscount(payload: DiscountRequestPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/`, payload);
  }

  // 🔹 Get discount status for a specific bill
  getDiscountStatus(billId: string): Observable<DiscountStatusResponse> {
    return this.http.get<DiscountStatusResponse>(`${this.baseUrl}/status/${billId}`);
  }

  // 🔹 For admin: Approve or reject request
  updateDiscountStatus(
    discountRequestId: string,
    discountStatus: 'approved' | 'rejected',
    isDiscountAllowed: boolean
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/${discountRequestId}`, {
      discountStatus,
      isDiscountAllowed,
    });
  }

  // 🔹 Update discount value or reason (by admin)
  updateDiscountValueOrReason(
    discountRequestId: string,
    discount: Number,
    reasonbyAdmin: String
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/${discountRequestId}`, {
      discount,
      reasonbyAdmin,
    });
  }

  // 🔹 IPD Discount request
  requestDiscountIPD(payload: DiscountRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/`, payload);
  }
}
