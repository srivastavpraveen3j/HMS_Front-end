import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class DateFilterService {
  private applyFilterSubject = new BehaviorSubject<boolean>(false);

  applyFilter$ = this.applyFilterSubject.asObservable();

  setApplyFilter(state: boolean) {
    this.applyFilterSubject.next(state);
  }

  getApplyFilterValue() {
    
    return this.applyFilterSubject.value;
  }
}
