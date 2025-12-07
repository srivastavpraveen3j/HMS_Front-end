import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {

  // The BehaviorSubject holds the currently selected user
  private selectedUserSubject = new BehaviorSubject<any>(null);

  // Observable that parents can subscribe to
  public selectedUser$: Observable<any> = this.selectedUserSubject.asObservable();

  constructor() { }

  /**
   * Call this from your search component when a user is selected
   * @param user Selected user object
   */
  setSelectedUser(user: any) {
    console.log("DEMO", user);
    this.selectedUserSubject.next(user);
  }

  /**
   * Optional: reset selected user to null
   */
  clearSelectedUser() {
    this.selectedUserSubject.next(null);
  }

  /**
   * Optional: get current selected user value synchronously
   */
  getSelectedUser(): any {
    return this.selectedUserSubject.getValue();
  }
}
