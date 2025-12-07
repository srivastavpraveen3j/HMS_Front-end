import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../../enviornment/env';

@Injectable({
  providedIn: 'root'
})
export class VisitTypeService {

  private baseUrl = `${environment.baseurl}/visittype`;


  constructor(private http: HttpClient) {}

  // Get VisitType masters with optional filters
  // getVisitTypes(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
  //   let params = new HttpParams()
  //     .set('page', page.toString())
  //     .set('limit', limit.toString());

  //   if (search && search.trim()) {
  //     params = params.set('headName', search.trim());
  //   }

  //   return this.http.get<any>(this.baseUrl, { params });
  // }


  // In your Angular service
getVisitTypes(page: number = 1, limit: number = 10, search: string = '', doctorSearch: string = ''): Observable<any> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  if (search && search.trim()) {
    params = params.set('headName', search.trim());
  }

  if (doctorSearch && doctorSearch.trim()) {
    params = params.set('doctorName', doctorSearch.trim());
  }

  return this.http.get<any>(this.baseUrl, { params });
}


   getVisitTypesById(visittypeid: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${visittypeid}`);
  }

  // Create a new visit type master
  createVisitTypeMaster(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  // Update existing visit type master by id
  updateVisitTypeMaster(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, data);
  }

  // Delete visit type master by id
  deleteVisitTypeMaster(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }



  // visit master apis


  private visitmasterUrl = `${environment.baseurl}/visit`;




  // Get VisitType masters with optional filters
  getVisit(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim()) {
      params = params.set('headName', search.trim());
    }

    return this.http.get<any>(this.visitmasterUrl, { params });
  }

   getVisitById(visittypeid: string): Observable<any> {
    return this.http.get<any>(`${this.visitmasterUrl}/${visittypeid}`);
  }

  // Create a new visit type master
  createVisitMaster(data: any): Observable<any> {
    return this.http.post<any>(this.visitmasterUrl, data);
  }

  // Update existing visit type master by id
  updateVisitMaster(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, data);
  }

  // Delete visit type master by id
  deleteVisitMaster(id: string): Observable<any> {
    return this.http.delete<any>(`${this.visitmasterUrl}/${id}`);
  }

 getVisitByCase(id: string): Observable<any> {
    let params = new HttpParams().set('inpatientCaseId', id);
    return this.http.get<any>(`${this.visitmasterUrl}/case`, { params });
  }

}
