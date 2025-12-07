import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HmsService {

  constructor() { }


  currentHMS: string = '';

  setHMS(role: string) {
    this.currentHMS = role;
  }

  getHMS(): string {
    return this.currentHMS;
  }
}
