import { Injectable } from '@angular/core';
import { PermissionSet } from '../../auth.constant';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUser(): any {
    const userStr = localStorage.getItem('authUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  getUserRole(): any {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('payload authservice', payload);
      return payload; // return the whole roles object
    } catch (e) {
      return null;
    }
  }

  isSuperAdmin(): boolean {
    const role = this.getUserRole();
    return role?.roles?.isSuperAdmin === true;
  }

  getPermissions(): string[] {
    const user = this.getUser();
    return user?.permission?.map((p: any) => p.moduleName) || [];
  }

  hasModulePermission(moduleName: string): boolean {
    return this.getPermissions().includes(moduleName);
  }

  //   hasModulePermission(moduleName: string, permission: keyof PermissionSet): boolean {
  //   const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  //   const modulePerm = permissions.find((perm: any) => perm.moduleName === moduleName);
  //   return modulePerm?.[permission] === 1;
  // }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.clear();
  }
}
