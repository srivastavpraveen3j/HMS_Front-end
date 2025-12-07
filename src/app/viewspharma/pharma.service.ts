import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../enviornment/env';
@Injectable({
  providedIn: 'root',
})
export class PharmaService {
  constructor(private http: HttpClient) {}

  // pharmareq apis starts here
  private pharmainwardapis = `${environment.baseurl}/pharmaceuticalInward`;

  getPharmareq(
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

    return this.http.get<any>(this.pharmainwardapis, { params });
  }
  getPharmareqall(search: string = ''): Observable<any> {
    let params = new HttpParams();
    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.pharmainwardapis, { params });
  }

  getpharmareqById(_id: string): Observable<any> {
    return this.http.get<any>(`${this.pharmainwardapis}/${_id}`);
  }

  postPharmareq(PharmareqsData: any): Observable<any> {
    return this.http.post<any>(this.pharmainwardapis, PharmareqsData);
  }


  deletePharmareq(pharmareqid: any): Observable<any> {
    return this.http.delete<any>(`${this.pharmainwardapis}/${pharmareqid}`);
  }

  updatePharmareq(pharmareqid: any, PharmareqsData: any): Observable<any> {
    return this.http.put<any>(
      `${this.pharmainwardapis}/${pharmareqid}`,
      PharmareqsData
    );
  }

  walkinpharmacy(PharmareqsData: any): Observable<any> {
    return this.http.post<any>(
      `${this.pharmainwardapis}/walkin`,
      PharmareqsData
    );
  }





// Add method to get specific bill details
getPharmaceuticalInwardById(id: string): Observable<any> {
  return this.http.get<any>(`${this.pharmainwardapis}/${id}`);
}


// pahra return

// Update your service methods
getPharmaceuticalInwardByBillNumber(billNumber: string): Observable<any> {
  // Use the new endpoint
  return this.http.get<any>(`${this.pharmainwardapis}/bill/${billNumber}`);
}

// Alternative search method with query parameters
searchPharmaceuticalInwards(params: any): Observable<any> {
  let httpParams = new HttpParams();

  if (params.inwardSerialNumber) {
    httpParams = httpParams.set('inwardSerialNumber', params.inwardSerialNumber);
  }
  if (params.type) {
    httpParams = httpParams.set('type', params.type);
  }
  if (params.status) {
    httpParams = httpParams.set('status', params.status);
  }

  return this.http.get<any>(`${this.pharmainwardapis}/search`, { params: httpParams });
}

getAllPharmaceuticalInwards(): Observable<any> {
  return this.http.get<any>(`${this.pharmainwardapis}`);
}

postPharmareturn(PharmareqsData: any): Observable<any> {
  return this.http.post<any>(`${this.pharmainwardapis}/return`, PharmareqsData);
}

// getPharmareturnall(billNumber: string): Observable<any> {
//   return this.http.get<any>(`${this.pharmainwardapis}/returns/${billNumber}`);
// }
// Add this method to your PharmaService
// ✅ Updated service method to get only return records
// getAllReturnRecords(): Observable<any> {
//   // Method 1: If you have a specific return endpoint
//   // return this.http.get<any>(`${this.pharmainwardapis}/returns`);

//   // Method 2: If filtering from main endpoint
//   let params = new HttpParams();
//   params = params.set('returnDetails.isReturn', 'true');
//   return this.http.get<any>(`${this.pharmainwardapis}`, { params });
// }

// ✅ Updated service method to get return records with patient data
// getAllReturnRecords(): Observable<any> {
//   let params = new HttpParams();
//   params = params.set('returnDetails.isReturn', 'true');
//   params = params.set('populate', 'uniqueHealthIdentificationId'); // ✅ Populate patient data

//   return this.http.get<any>(`${this.pharmainwardapis}`, { params });
// }

// ✅ Updated service method to use the new return records endpoint
getAllReturnRecords(): Observable<any> {
  return this.http.get<any>(`${this.pharmainwardapis}/returns`);
}
// ✅ Get return history for a specific bill number
getPharmareturnall(billNumber: string): Observable<any> {
  return this.http.get<any>(`${this.pharmainwardapis}/returns/${billNumber}`);
}

}
