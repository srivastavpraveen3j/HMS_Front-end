// src/app/services/namespace.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviornment/env';

export interface Namespace {
  _id?: string;
  name: string;
  api_Key?: string;
  users?: { _id: string; name: string; email: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class NamespaceService {
  private baseUrl = environment.baseurl + '/namespace'
  constructor(private http: HttpClient) { }

  // ✅ Create Namespace
  createNamespace(payload: Namespace): Observable<Namespace> {
    return this.http.post<Namespace>(`${this.baseUrl}`, payload);
  }

  // ✅ Get All Namespaces
  getAllNamespaces(): Observable<Namespace[]> {
    return this.http.get<Namespace[]>(`${this.baseUrl}`);
  }

  // ✅ Get Namespace by ID
  getNamespaceById(id: string): Observable<Namespace> {
    return this.http.get<Namespace>(`${this.baseUrl}/${id}`);
  }

  // ✅ Update Namespace
  updateNamespace(id: string, payload: Partial<Namespace>): Observable<Namespace> {
    return this.http.put<Namespace>(`${this.baseUrl}/${id}`, payload);
  }

  // ✅ Delete Namespace
  deleteNamespace(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // ✅ Validate Namespace by API Key
  validateNamespaceByApiKey(apiKey: string): Observable<Namespace> {
    const headers = new HttpHeaders({
      'x-hims-api': apiKey
    });
    return this.http.get<Namespace>(`${this.baseUrl}/apikey/validate`, { headers });
  }
}
