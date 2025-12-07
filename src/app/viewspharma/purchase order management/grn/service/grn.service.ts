import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../../enviornment/env';

@Injectable({
  providedIn: 'root',
})
export class GrnService {
  constructor(private http: HttpClient) {}

  // Base API endpoint
  private grngeneration = `${environment.baseurl}/goodreceipt`;

  // =================== EXISTING METHODS (Enhanced) ===================

  getgrngeneration(
    page: number = 1,
  limit: number = 10,
  search: string = '',
  status: string = '',
  poNumber: string = '',
  vendorName: string = '',
    grnNumber: string = '',

  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (grnNumber.trim()) {
      params = params.set('grnNumber', grnNumber);
    }
      // ✅ Add search by PO Number (matches your backend)
  if (poNumber.trim()) {
    params = params.set('poNumber', poNumber);
  }

  // ✅ Add search by Vendor Name (matches your backend)
  if (vendorName.trim()) {
    params = params.set('vendorName', vendorName);
  }


    return this.http.get<any>(this.grngeneration, { params });
  }



  getApprovedGRNsForInvoicing(page: number = 1, limit: number = 1000, vendorId?: string) {
  let params = `?page=${page}&limit=${limit}`;

  if (vendorId && vendorId !== 'all') {
    params += `&vendorId=${vendorId}`;
  }

  return this.http.get<any>(`${this.grngeneration}/for-invoicing${params}`);
}

// ✅ Enhanced existing method
// getgrngeneration(page: number, limit: number, search: string, excludeInvoiced: boolean = false) {
//   let params = `?page=${page}&limit=${limit}`;

//   if (search) {
//     params += `&search=${search}`;
//   }

//   if (excludeInvoiced) {
//     params += `&excludeInvoiced=true&status=approved`;
//   }

//   return this.http.get<any>(`${this.grngeneration}${params}`);
// }

  getgrngenerations(
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

    return this.http.get<any>(this.grngeneration, { params });
  }

  getgrngenerationById(grngenerationid: string): Observable<any> {
    return this.http.get<any>(`${this.grngeneration}/${grngenerationid}`);
  }

  postgrngeneration(grngenerationdata: any): Observable<any> {
    return this.http.post<any>(this.grngeneration, grngenerationdata);
  }

  deletegrngeneration(grngenerationid: any): Observable<any> {
    return this.http.delete<any>(`${this.grngeneration}/${grngenerationid}`);
  }

  updategrngeneration(
    grngenerationid: any,
    grngenerationdata: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.grngeneration}/${grngenerationid}`,
      grngenerationdata
    );
  }

  getPurchaseOrderByPoNumber(poNumber: string): Observable<any> {
    return this.http.get<any>(
      `${this.grngeneration}?poNumber=${encodeURIComponent(poNumber)}`
    );
  }

  updatematerialstatusrequest(
    id: string,
    payload: { status: string; approvedBy: string }
  ) {
    return this.http.put<any>(`${this.grngeneration}/${id}`, payload);
  }

  getgrngenerationByUhid(uhid: string): Observable<any[]> {
    const params = new HttpParams().set('uhid', uhid);
    return this.http.get<any[]>(this.grngeneration, { params });
  }

  getgrngenerationcomparisonById(grngenerationid: string): Observable<any> {
    return this.http.get<any[]>(
      `${environment.baseurl}/vendor-quotation/rfq/${grngenerationid}`
    );
  }

  // =================== NEW QUALITY CONTROL METHODS ===================

  // Perform Quality Control Inspection
  performQualityControl(grnId: string, qcData: any): Observable<any> {
    return this.http.post<any>(`${this.grngeneration}/${grnId}/quality-control`, qcData);
  }

  // Approve GRN (triggers inventory update and returns)
  approveGRN(grnId: string, approvalNotes?: string): Observable<any> {
    const payload = approvalNotes ? { approvalNotes } : {};
    return this.http.post<any>(`${this.grngeneration}/${grnId}/approve`, payload);
  }

  // Get Quality Control Dashboard
  getQCDashboard(): Observable<any> {
    return this.http.get<any>(`${this.grngeneration}/dashboard/qc`);
  }

  // Get GRNs by Status
  getGRNsByStatus(status: string, page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<any>(`${this.grngeneration}/status/${status}`, { params });
  }

  // Get Defect Analytics
  getDefectAnalytics(startDate?: string, endDate?: string, defectType?: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (defectType) params = params.set('defectType', defectType);

    return this.http.get<any>(`${this.grngeneration}/analytics/defects`, { params });
  }

  // Bulk Quality Control Operations
  bulkQualityControl(grnIds: string[], action: 'approve_all' | 'reject_all'): Observable<any> {
    const payload = { grnIds, qcAction: action };
    return this.http.post<any>(`${this.grngeneration}/bulk/quality-control`, payload);
  }

  // Get pending QC GRNs (shortcut)
  getPendingQCGRNs(page: number = 1, limit: number = 10): Observable<any> {
    return this.getGRNsByStatus('received', page, limit);
  }

  // Get under inspection GRNs
  getUnderInspectionGRNs(page: number = 1, limit: number = 10): Observable<any> {
    return this.getGRNsByStatus('under_inspection', page, limit);
  }

  // Get approved GRNs
  getApprovedGRNs(page: number = 1, limit: number = 10): Observable<any> {
    return this.getGRNsByStatus('approved', page, limit);
  }

  // Reject specific items in bulk
  rejectItems(grnId: string, itemIds: string[], rejectionReason: string, defectDetails?: any[]): Observable<any> {
    const payload = {
      itemIds,
      rejectionReason,
      defectDetails: defectDetails || [{
        serialNumber: 'BULK_REJECT',
        defectReason: rejectionReason,
        defectType: 'quality_issue',
        defectSeverity: 'major'
      }]
    };
    return this.http.put<any>(`${this.grngeneration}/${grnId}/reject-items`, payload);
  }

  // Get specific item within GRN
  getGRNItem(grnId: string, itemId: string): Observable<any> {
    return this.http.get<any>(`${this.grngeneration}/${grnId}/items/${itemId}`);
  }


  // Update specific item QC status
  updateItemQC(grnId: string, itemId: string, qcData: any): Observable<any> {
    return this.http.put<any>(`${this.grngeneration}/${grnId}/items/${itemId}/qc`, qcData);
  }

  // Get QC Performance Report
  getQCPerformanceReport(startDate?: string, endDate?: string, vendorId?: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (vendorId) params = params.set('vendorId', vendorId);

    return this.http.get<any>(`${this.grngeneration}/reports/qc-performance`, { params });
  }

  // Get Medicine Stock Impact Report
  getMedicineStockImpactReport(): Observable<any> {
    return this.http.get<any>(`${this.grngeneration}/reports/medicine-stock-impact`);
  }


  // Add these methods to your existing GrnService class

// =================== RETURN PO METHODS ===================

// Generate Return PO for defective items
// Enhanced generateReturnPO method in grn.service.ts
  generateReturnPO(grnId: string): Observable<any> {
    console.log('🚀 Service: Calling generateReturnPO API for GRN:', grnId);
    const url = `${this.grngeneration}/${grnId}/generate-return-po`;
    console.log('📡 API URL:', url);

    return this.http.post<any>(url, {})
      .pipe(
        tap(response => {
          console.log('✅ Service: Return PO API Response:', response);
          console.log('📊 Response Data:', response.data);
        }),
        catchError(error => {
          console.error('❌ Service: Return PO API Error:', error);
          console.error('📊 Error Details:', error.error);
          throw error;
        })
      );
  }


// Get Return POs for specific GRN
getReturnPOsByGRN(grnId: string): Observable<any> {
  return this.http.get<any>(`${this.grngeneration}/${grnId}/return-pos`);
}

// Check if GRN has defective items eligible for return
checkReturnEligibility(grnId: string): Observable<any> {
  return this.http.get<any>(`${this.grngeneration}/${grnId}/return-eligibility`);
}

}
