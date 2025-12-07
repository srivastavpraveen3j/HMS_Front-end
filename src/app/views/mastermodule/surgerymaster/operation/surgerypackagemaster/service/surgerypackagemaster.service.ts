import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../../../../../../enviornment/env';

@Injectable({
  providedIn: 'root',
})
export class SurgerypackagemasterService {

    private surgerypackagemaster = `${environment.baseurl}/surgerypackage`;

    constructor(private http: HttpClient) {}



  getsurgerypackagemasters(
  page: number = 1,
  limit: number = 10,
  search: string = ''
): Observable<any> {
  // Return empty results immediately if search is too short (but not empty)
  if (search.trim().length > 0 && search.trim().length < 3) {
    return of({
      total: 0,
      page: 1,
      totalPages: 0,
      limit: limit,
      packages: [],
      message: "Search term must be at least 3 characters"
    });
  }

  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  // Only add search param if it's empty or has 3+ characters
  if (search.trim().length >= 3) {
    params = params.set('search', search.trim());
  }

  return this.http.get<any>(this.surgerypackagemaster, { params });
}


 getsurgerypackagemasterById(packageId: string): Observable<any> {
  return this.http.get<any>(`${this.surgerypackagemaster}/${packageId}`).pipe(
    map(response => {
      // Handle different response structures
      if (response && response._id) {
        // Direct package object
        return { packages: response };
      } else if (response && response.package) {
        // Wrapped in package property
        return { packages: response.package };
      } else if (response && response.data) {
        // Wrapped in data property
        return { packages: response.data };
      }
      return response;
    }),
    tap(response => {
      console.log('API Response for ID:', packageId, response);
    }),
    catchError(error => {
      console.error('Error fetching package by ID:', packageId, error);
      return throwError(error);
    })
  );
}


 getOPsheetById(opdcaseid: string): Observable<any> {
    return this.http.get<any>(`${this.surgerypackagemaster}/${opdcaseid}`);
  }


  // for search
  getsurgerypackagemaster(
    page: number,
    limit: number,
    name: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (name.trim()) {
      params = params.set('name', name.trim());
    }

    return this.http.get<any>(`${this.surgerypackagemaster}`, { params });
  }

  // bulkupload

  uploadSurgeryCSV(fileData: FormData) {
    return this.http.post(`${this.surgerypackagemaster}/import`, fileData);
  }

  // add medicine
  postsurgerypackagemaster(surgerypackagemasterData: any): Observable<any> {
    return this.http.post<any>(this.surgerypackagemaster, surgerypackagemasterData);
  }

  deletesurgerypackagemaster(surgerypackagemasterid: any): Observable<any> {
    return this.http.delete<any>(`${this.surgerypackagemaster}/${surgerypackagemasterid}`);
  }

  updatesurgerypackagemaster(
    surgerypackagemasterid: any,
    surgerypackagemasterData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.surgerypackagemaster}/${surgerypackagemasterid}`,
      surgerypackagemasterData
    );
  }
}
