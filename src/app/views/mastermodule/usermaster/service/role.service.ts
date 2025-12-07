import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../enviornment/env';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  constructor(private http: HttpClient) { }

  // login

  private loginapi = `${environment.baseurl}/platform/login`;
  private userloginapi = `${environment.baseurl}/auth/login/`;

  postLogin(userData: any) {
    return this.http.post(`${this.loginapi}`, userData);
  }

  postuserlogin(userdata: any) {
    return this.http.post(`${this.userloginapi}`, userdata);
  }

  private userapis = `${environment.baseurl}/user`;

  // login

    getusers(
      page: number = 1,
      limit: number = 100,
      search: string = ''
    ): Observable<any> {
      let params = new HttpParams();

      if (search && search.trim()) {
        // ✅ FIXED: Use 'name' parameter instead of 'search'
        params = params.set('name', search.trim());
      } else {
        // 📑 Pagination mode → only send page & limit
        params = params
          .set('page', page.toString())
          .set('limit', limit.toString());
      }

      return this.http.get<any>(this.userapis, { params });
    }


    getuser(page = 1, limit = 25, search = ''): Observable<any> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  if (search.trim()) {
    params = params.set('name', search.trim());
  }

  return this.http.get<any>(`${this.userapis}`, { params });
}


  getuserById(id: string): Observable<any> {
    let params = new HttpParams().set('id', id);

    return this.http.get<any>(this.userapis, { params });
  }

  getuserByIds(id: string): Observable<any> {
    return this.http.get<any>(`${this.userapis}?id=${id}`);
  }

  searchUser(searchTerm: string, role?: string): Observable<any> {
    let params: any = {};

    if (searchTerm) {
      params.name = searchTerm;
    }

    if (role) {
      params.role = role;
    }

    return this.http.get<any>(`${this.userapis}/search`, { params });
  }


  postUser(userData: any) {
    return this.http.post(`${this.userapis}`, userData);
  }

  deleteuser(userid: any): Observable<any> {
    return this.http.delete<any>(`${this.userapis}/${userid}`);
  }

  updateUser(userid: any, userreqdata: any): Observable<any> {
    return this.http.put<any>(`${this.userapis}/${userid}`, userreqdata);
  }

  // roles starts here
  private roleapis = `${environment.baseurl}/roles`;

  getRoles(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    // const token = localStorage.getItem('authToken');
    // const headers = new HttpHeaders({
    //   Authorization: `Bearer ${token}`
    // });

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.roleapis, { params });
  }

  getrolesById(_id: string): Observable<any> {
    return this.http.get<any>(`${this.roleapis}/${_id}`);
  }

  postRoles(userData: any) {
    // const token = localStorage.getItem('authToken');
    // const headers = new HttpHeaders({
    //   Authorization: `Bearer ${token}`
    // });

    return this.http.post(`${this.roleapis}`, userData);
  }

  deleteRoles(userid: any): Observable<any> {
    return this.http.delete<any>(`${this.roleapis}/${userid}`);
  }

  updateRoles(userid: any, userreqdata: any): Observable<any> {
    return this.http.put<any>(`${this.roleapis}/${userid}`, userreqdata);
  }

  //       permissions

  private permissionsapis = `${environment.baseurl}/permissions`;

  getPermission(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    // const token = localStorage.getItem('authToken');
    // const headers = new HttpHeaders({
    //   Authorization: `Bearer ${token}`
    // });

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.permissionsapis, { params });
  }

  getPermissionById(_id: string): Observable<any> {
    return this.http.get<any>(`${this.permissionsapis}/${_id}`);
  }

  postPermission(userData: any) {
    // const token = localStorage.getItem('authToken');
    // const headers = new HttpHeaders({
    //   Authorization: `Bearer ${token}`
    // });

    return this.http.post(`${this.permissionsapis}`, userData);
  }

  deletePermission(userid: any): Observable<any> {
    return this.http.delete<any>(`${this.permissionsapis}/${userid}`);
  }

  updatePermission(userid: any, userreqdata: any): Observable<any> {
    return this.http.put<any>(`${this.permissionsapis}/${userid}`, userreqdata);
  }
}
