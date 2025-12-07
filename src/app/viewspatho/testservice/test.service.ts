import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../enviornment/env';
@Injectable({
  providedIn: 'root',
})
export class TestService {
  constructor(private http: HttpClient) {}

  // pharmareq apis starts here
  private testinwardapis = `${environment.baseurl}/inward`;

  getTestreq(
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

    return this.http.get<any>(this.testinwardapis, { params });
  }

  getTestreqById(_id: string): Observable<any> {
    return this.http.get<any>(`${this.testinwardapis}/${_id}`);
  }

  postTestreq(PharmareqsData: any): Observable<any> {
    return this.http.post<any>(this.testinwardapis, PharmareqsData);
  }

  deleteTestreq(pharmareqid: any): Observable<any> {
    return this.http.delete<any>(`${this.testinwardapis}/${pharmareqid}`);
  }

  updateTestreq(pharmareqid: any, PharmareqsData: any): Observable<any> {
    return this.http.put<any>(
      `${this.testinwardapis}/${pharmareqid}`,
      PharmareqsData
    );
  }
}
