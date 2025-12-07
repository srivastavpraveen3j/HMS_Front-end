// services/company-master.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../enviornment/env';

@Injectable({
  providedIn: 'root'
})
export class CompanyMasterService {
  private baseUrl = `${environment.baseurl}/company`;

  constructor(private http: HttpClient) {}

  createCompany(companyData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/company-master/create`, companyData);
  }

  getAllCompanies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/company-master/all`);
  }

  updateCompanyRates(companyId: string, rateData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/company-master/update-rates/${companyId}`, rateData);
  }

  getAllServices(): Observable<any> {
    return this.http.get(`${this.baseUrl}/services/all`);
  }

  // services/companymaster.service.ts - Add this method
getCompanyById(companyId: string): Observable<any> {
  return this.http.get(`${this.baseUrl}/company-master/${companyId}`);
}

getCompanyRates(companyId: string): Observable<any> {
  return this.http.get(`${this.baseUrl}/company-master/${companyId}/rates`);
}


  getAllBedTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/bed-types/all`);
  }

  getAllRoomTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/room-types/all`);
  }

  getPatientLockedRates(patientId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/company-master/patient-rates/${patientId}`);
  }

  // Company rate APIs - matching your backend routes
  getCaseLockedRates(caseId: string, caseType: string = 'IPD'): Observable<any> {
    return this.http.get(`${this.baseUrl}/locked-rates/${caseId}/${caseType}`);
  }

  getCaseServiceRate(caseId: string, caseType: string, serviceId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/service-rate/${caseId}/${caseType}/${serviceId}`);
  }

  getCaseBedRate(caseId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/bed-rate/${caseId}`);
  }
  getCaseSurgeryPackageRate(caseId: string, caseType: string, surgeryPackageId: string): Observable<any> {
  const url = `${this.baseUrl}/case/${caseId}/${caseType}/package/${surgeryPackageId}`;
  return this.http.get<any>(url);
}




  getCaseRoomRate(caseId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/room-rate/${caseId}`);
  }


}
