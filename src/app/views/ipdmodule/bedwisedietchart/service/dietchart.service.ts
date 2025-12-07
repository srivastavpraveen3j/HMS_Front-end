// service/dietchart.service.ts
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../../enviornment/env';
export interface DietChart {
  _id: string;
  bedId: any;
  patientId: any;
  inpatientCaseId: string;
  dietDate: Date;
  dietType: string;
  meals: any[];
  totalCalories?: number;
  waterIntake: string;
  restrictions: string[];
  allergies: string[];
  createdBy: any;
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DietChartResponse {
  success: boolean;
  data: DietChart[];
  total: number;
  message?: string;
}
@Injectable({
  providedIn: 'root'
})
export class DietchartService {

  constructor(private http: HttpClient) {}
  private apiUrl = `${environment.baseurl}/dietchart`;

  getBedWiseDietCharts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/bedwise`);
  }

  getAllDietCharts(page: number = 1, limit: number = 10, filters?: any): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.bedId) params = params.set('bedId', filters.bedId);
    if (filters?.dietDate) params = params.set('dietDate', filters.dietDate);

    return this.http.get(this.apiUrl, { params });
  }

  // ✅ Fixed: Remove /create from the endpoint
  createDietChart(dietChart: any): Observable<any> {
    return this.http.post(this.apiUrl, dietChart);
  }

  updateDietChart(id: string, dietChart: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dietChart);
  }

  deleteDietChart(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ✅ New: Check if diet chart exists for patient on specific date
  checkExistingDietChart(inpatientCaseId: string, date: string): Observable<any> {
    let params = new HttpParams()
      .set('inpatientCaseId', inpatientCaseId)
      .set('dietDate', date);

    return this.http.get(`${this.apiUrl}/check`, { params });
  }


  // dicec chart case

 // service/dietchart.service.ts
getDietChartsByCase(inpatientCaseId: string, options?: {
  latest?: boolean,
  dietDate?: string,
  dateRange?: { from: string, to: string }
}): Observable<DietChartResponse> {
  return this.loadDietByCase(inpatientCaseId, options);
}

// ✅ Make sure this method exists and works correctly
private loadDietByCase(inpatientCaseId: string, options?: {
  latest?: boolean,
  dietDate?: string,
  dateRange?: { from: string, to: string }
}): Observable<DietChartResponse> {
  let params = new HttpParams().set('inpatientCaseId', inpatientCaseId);

  if (options?.latest) {
    params = params.set('latest', 'true');
  }

  if (options?.dietDate) {
    params = params.set('dietDate', options.dietDate);
  }

  if (options?.dateRange) {
    params = params.set('fromDate', options.dateRange.from);
    params = params.set('toDate', options.dateRange.to);
  }

  console.log('🔄 Making API call to /case with params:', params.toString());

  return this.http.get<DietChartResponse>(`${this.apiUrl}/case`, { params })
    .pipe(
      tap(response => console.log('✅ Diet charts loaded:', response)),
      catchError(error => {
        console.error('❌ Error loading diet charts:', error);
        return throwError(() => error);
      })
    );
}

}
