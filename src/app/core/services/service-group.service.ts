import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviornment/env';

@Injectable({
  providedIn: 'root',
})
export class ServiceGroupService {
  private ServiceGroupUrl = `${environment.baseurl}/serviceGroup`;

  constructor(private http: HttpClient) {}

  // Get Service Groups with pagination and type filter
  getServiceGroup(page: number = 1, limit: number = 10, group_name: string = '', type: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (group_name.trim()) {
      params = params.set('group_name', group_name.trim());
    }

    if (type.trim()) {
      params = params.set('type', type.trim());
    }

    return this.http.get<any>(this.ServiceGroupUrl, { params });
  }

  // Search Service Groups
  getSearchServicegroup(page: number, limit: number, group_name: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (group_name.trim()) {
      params = params.set('group_name', group_name.trim());
    }

    return this.http.get<any>(`${this.ServiceGroupUrl}`, { params });
  }

  // Create new Service Group
  postServiceGroup(ServiceGroupUrlData: any): Observable<any> {
    return this.http.post<any>(this.ServiceGroupUrl, ServiceGroupUrlData);
  }

  // Update existing Service Group
  updateServiceGroup(ServiceGroupid: any, ServiceGroupUrlData: any): Observable<any> {
    return this.http.put<any>(`${this.ServiceGroupUrl}/${ServiceGroupid}`, ServiceGroupUrlData);
  }

  // Delete Service Group
  deleteServiceGroup(ServiceGroupid: any): Observable<any> {
    return this.http.delete<any>(`${this.ServiceGroupUrl}/${ServiceGroupid}`);
  }
}
