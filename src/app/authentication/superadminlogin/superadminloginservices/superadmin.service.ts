import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../enviornment/env';


@Injectable({
  providedIn: 'root',
})
export class SuperadminService {
  constructor(private http: HttpClient) {}

  // login

  private loginapi = `${environment.baseurl}/platform/login`;

  postLogin(userData: any) {
    return this.http.post(`${this.loginapi}`, userData);
  }

  // login
}
