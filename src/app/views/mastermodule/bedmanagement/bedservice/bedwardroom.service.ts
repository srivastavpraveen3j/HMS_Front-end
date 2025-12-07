import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../enviornment/env';

@Injectable({
  providedIn: 'root',
})
export class BedwardroomService {
  // bedtype master servcies starts here
  private bedTypeUrl = `${environment.baseurl}/bedType`;

  constructor(private http: HttpClient) {}

  // get bedtype
  getbedtypes(
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

    return this.http.get<any>(this.bedTypeUrl, { params });
  }
  getbedtyp(
    page: number = 1,
    limit: number = 2000,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.bedTypeUrl, { params });
  }

  getbedtype(page: number, limit: number, name: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (name.trim()) {
      params = params.set('name', name.trim());
    }

    return this.http.get<any>(`${this.bedTypeUrl}`, { params });
  }

  // add bedtype
  postbedtype(bedtypeData: any): Observable<any> {
    return this.http.post<any>(this.bedTypeUrl, bedtypeData);
  }

  // delete bedtype

  deletebedtype(bedtypeid: any): Observable<any> {
    return this.http.delete<any>(`${this.bedTypeUrl}/${bedtypeid}`);
  }

  // udpate bedtype

  updatebedtype(bedtypeid: any, bedtypeData: any): Observable<any> {
    return this.http.put<any>(`${this.bedTypeUrl}/${bedtypeid}`, bedtypeData);
  }

  // roomtype starts here

  private roomTypeUrl = `${environment.baseurl}/roomType`;

  getroomType(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.roomTypeUrl, { params });
  }
  getroomTyp(
    page: number = 1,
    limit: number = 2000,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.roomTypeUrl, { params });
  }

    getroomtype(page: number, limit: number, name: string = ''): Observable<any> {
      let params = new HttpParams()
        .set('page', page.toString())
        .set('limit', limit.toString());

      if (name.trim()) {
        params = params.set('name', name.trim());
      }

      return this.http.get<any>(`${this.roomTypeUrl}`, { params });
    }

  // add bedtype
  postroomType(roomTypeData: any): Observable<any> {
    return this.http.post<any>(this.roomTypeUrl, roomTypeData);
  }

  // delete bedtype

  deleteroomType(roomTypeid: any): Observable<any> {
    return this.http.delete<any>(`${this.roomTypeUrl}/${roomTypeid}`);
  }

  // udpate bedtype

  updateroomType(roomTypeid: any, roomTypeData: any): Observable<any> {
    return this.http.put<any>(
      `${this.roomTypeUrl}/${roomTypeid}`,
      roomTypeData
    );
  }

  // room master starts here

  private roomUrl = `${environment.baseurl}/room`;

  getroom(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.roomUrl, { params });
  }

  getRoom(
    page: number,
    limit: number,
    roomNumber: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (roomNumber.trim()) {
      params = params.set('roomNumber', roomNumber.trim());
    }

    return this.http.get<any>(`${this.roomUrl}`, { params });
  }

  getRoomById(roomId: string) {
    return this.http.get<any>(`${this.roomUrl}/${roomId}`);
  }

  // add bedtype
  postroom(roomData: any): Observable<any> {
    return this.http.post<any>(this.roomUrl, roomData);
  }

  // delete bedtype

  deleteroom(roomid: any): Observable<any> {
    return this.http.delete<any>(`${this.roomUrl}/${roomid}`);
  }

  // udpate bedtype

  updateroom(roomid: any, roomData: any): Observable<any> {
    return this.http.put<any>(`${this.roomUrl}/${roomid}`, roomData);
  }

  // bed master starts here

  private bedUrl = `${environment.baseurl}/bed`;

  getbed(
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

    return this.http.get<any>(this.bedUrl, { params });
  }

  getBed(
    page: number,
    limit: number,
    bed_number: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (bed_number.trim()) {
      params = params.set('bed_number', bed_number.trim());
    }

    return this.http.get<any>(`${this.bedUrl}`, { params });
  }

  getBedById(bedid: string): Observable<any> {
    return this.http.get<any>(`${this.bedUrl}/${bedid}`);
  }

  // add bedtype
  postbed(roomData: any): Observable<any> {
    return this.http.post<any>(this.bedUrl, roomData);
  }

  // delete bedtype

  deletebed(roomid: any): Observable<any> {
    return this.http.delete<any>(`${this.bedUrl}/${roomid}`);
  }

  // udpate bedtype

  updatebed(roomid: any, roomData: any): Observable<any> {
    return this.http.put<any>(`${this.bedUrl}/${roomid}`, roomData);
  }
}
