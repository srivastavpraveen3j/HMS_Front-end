import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../enviornment/env';

@Injectable({
  providedIn: 'root',
})
export class InventoryitemService {
  private apiUrl = `${environment.baseurl}/inventoryItem`;
  // private bulkuploadUrl = `${environment.baseurl}/doctor/import`;

  constructor(private http: HttpClient) {}

  uploadInventoryItemCSV(fileData: FormData) {
    return this.http.post(
      `${environment.baseurl}/inventoryItem/import`,
      fileData
    );
  }

  getInventoryitem(
    page: number = 1,
    limit: number = 50,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  getInventoryitems(
    page: number,
    limit: number,
    item_name: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (item_name.trim()) {
      params = params.set('item_name', item_name.trim());
    }

    return this.http.get<any>(`${this.apiUrl}`, { params });
  }

  // getInventoryitemsByName(name: string): Observable<any> {
  //   const params = new HttpParams().set('name', name.trim());
  //   return this.http.get<any>(this.apiUrl, { params });
  // }

  getInventoryitemsByName(filters: any = {}) {
    return this.http.get(this.apiUrl, { params: filters });
  }
  // add doctor
  postInventoryitem(Inventoryitemdata: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, Inventoryitemdata);
  }

  // delete doctor

  deleteInventoryitem(Inventoryitemid: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${Inventoryitemid}`);
  }

  // udpate doctor

  updateInventoryitem(
    Inventoryitemid: any,
    Inventoryitemdata: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${Inventoryitemid}`,
      Inventoryitemdata
    );
  }

  // getdocotorbyid
  getInventoryitemById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
