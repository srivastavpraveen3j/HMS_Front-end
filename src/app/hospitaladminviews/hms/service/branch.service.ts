import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../enviornment/env';

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  private branchUrl = `${environment.baseurl}/branch`;

  constructor(private http: HttpClient) {}

  postBranch(branchData: any, apiKey: string): Observable<any> {
    const headers = new HttpHeaders({
      'x-api-key': apiKey,
    });

    return this.http.post<any>(this.branchUrl, branchData, { headers });
  }

  // deleteBranch( branchid : string): Observable<any> {
  //   return this.http.delete<any>(`${this.branchUrl}/${branchid}`);
  // }
  getBranch(): Observable<any> {
    return this.http.get<any>(this.branchUrl);
  }
}
