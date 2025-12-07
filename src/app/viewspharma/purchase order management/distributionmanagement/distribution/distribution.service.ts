import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../../enviornment/env';

@Injectable({
  providedIn: 'root'
})
export class DistributionService {
  private apiUrl = `${environment.baseurl}/distribution`;

  constructor(private http: HttpClient) {}

  // ✅ Get distribution summary
  getSummary(page: number = 1, limit: number = 50, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get(`${this.apiUrl}/summary`, { params });
  }
  exportTransfers(page: number = 1, limit: number = 50, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get(`${this.apiUrl}/export`, { params });
  }
  exportAllTransfers(page: number = 1, limit: number = 50, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get(`${this.apiUrl}/getall`, { params });
  }

  // ✅ Export transfers (filtered)




  // ✅ Get transfer by ID
  getTransferById(transferId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${transferId}`);
  }

  // ✅ Create new transfer
  createTransfer(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, payload);
  }

  // ✅ Approve transfer
  // approveTransfer(transferId: string): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/${transferId}/approve`, {});
  // }

  approveTransfer(transferId: string): Observable<any> {
  // Send approval data for all items
  const approvalData : any[] = [];
  return this.http.put(`${this.apiUrl}/${transferId}/approve`, {
    approvalData
  });
}


   bulkstocktansfer(fileData: FormData) {
      return this.http.post(`${this.apiUrl}/bulk-upload`, fileData);
    }

  // ✅ Process transfer
  processTransfer(transferId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${transferId}/process`, {});
  }

  // ✅ Complete transfer
  completeTransfer(transferId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${transferId}/complete`, {});
  }


  getSubPharmacyInventoryItems(pharmacyId: string, page: number = 1, limit: number = 25, search: string = ''): Observable<any> {
  console.log('🔍 Fetching inventory for pharmacy:', pharmacyId);

  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  if (search.trim()) {
    params = params.set('search', search);
  }

  return this.http.get(`${this.apiUrl}/subpharmacy/${pharmacyId}/inventory`, { params })
    .pipe(
      tap((response: any) => {
        console.log('📦 Raw inventory response:', response);
        if (response.data) {
          console.log('📊 Inventory items count:', response.data.length);
          response.data.forEach((item: any, index: number) => {
            console.log(`Item ${index + 1}:`, {
              name: item.medicine_name,
              stock: item.current_stock,
              medicine: item.medicine?.medicine_name
            });
          });
        }
      })
    );
}

}
