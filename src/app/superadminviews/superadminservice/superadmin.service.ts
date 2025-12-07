import { Injectable } from '@angular/core';
import { environment } from '../../../../enviornment/env';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SuperadminService {
  platformApi = `${environment.baseurl}/platformRoles`;

  constructor(private http: HttpClient) {}

  getPlatformRoles(): Observable<any[]> {
    return this.http.get<any[]>(this.platformApi);
  }

  getPlatformRoleById(id: string): Observable<any> {
    return this.http.get<any>(`${this.platformApi}/${id}`);
  }

  createPlatformRole(role: any): Observable<any> {
    return this.http.post<any>(this.platformApi, role);
  }

  updatePlatformRole(id: string, role: any): Observable<any> {
    return this.http.put<any>(`${this.platformApi}/${id}`, role);
  }

  deletePlatformRole(id: string): Observable<any> {
    return this.http.delete<any>(`${this.platformApi}/${id}`);
  }

  //==> platform permission API integration
  platformPermissionApi = `${environment.baseurl}/platformPermissions`;

  getPlatformPermissions(): Observable<any[]> {
    return this.http.get<any[]>(this.platformPermissionApi);
  }

  getPlatformPermissionById(id: string): Observable<any> {
    return this.http.get<any>(`${this.platformPermissionApi}/${id}`);
  }

  createPlatformPermission(permission: any): Observable<any> {
    return this.http.post<any>(this.platformPermissionApi, permission);
  }

  updatePlatformPermission(id: string, permission: any): Observable<any> {
    return this.http.put<any>(
      `${this.platformPermissionApi}/${id}`,
      permission
    );
  }

  deletePlatformPermission(id: string): Observable<any> {
    return this.http.delete<any>(`${this.platformPermissionApi}/${id}`);
  }

  //==> namespace

  namespaceApi = `${environment.baseurl}/namespace`;

  getNamespaces(): Observable<any[]> {
    return this.http.get<any[]>(this.namespaceApi);
  }

  getNamespaceById(id: string): Observable<any> {
    return this.http.get<any>(`${this.namespaceApi}/${id}`);
  }

  createNamespace(namespace: any): Observable<any> {
    return this.http.post<any>(this.namespaceApi, namespace);
  }

  updateNamespace(id: string, namespace: any): Observable<any> {
    return this.http.put<any>(`${this.namespaceApi}/${id}`, namespace);
  }

  deleteNamespace(id: string): Observable<any> {
    return this.http.delete<any>(`${this.namespaceApi}/${id}`);
  }

  //==> platformUsers

  platformUserApi =  `${environment.baseurl}/platform`;

  getPlatformUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.platformUserApi}/platformUsers`);
  }

}
