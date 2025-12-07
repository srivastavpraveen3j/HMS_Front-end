import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../enviornment/env';

@Injectable({
  providedIn: 'root'
})
export class PolicymasterService {
  private policyUrl = `${environment.baseurl}/masterPolicy`;

  constructor(private http: HttpClient) {}

  // ✅ Create Policy
  createPolicy(policyData: any) {
    return this.http.post(this.policyUrl, policyData);
  }

  // ✅ Get All Policies
  getPolicies() {
    return this.http.get(this.policyUrl);
  }

  // ✅ Get Policy By ID
  getPolicyById(policyId: string) {
    return this.http.get(`${this.policyUrl}/${policyId}`);
  }

  // ✅ Update Policy
  updatePolicy(policyId: string, policyData: any) {
    return this.http.put(`${this.policyUrl}/${policyId}`, policyData);
  }

  // ✅ Delete Policy
  deletePolicy(policyId: string) {
    return this.http.delete(`${this.policyUrl}/${policyId}`);
  }
}
