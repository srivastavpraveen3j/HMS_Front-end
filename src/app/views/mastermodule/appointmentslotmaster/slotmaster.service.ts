import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../enviornment/env';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SlotmasterService {
  private slotUrl = `${environment.baseurl}/slotmaster`;

  constructor(private http: HttpClient) {}

  createSlots(slotData: any) {
    return this.http.post(this.slotUrl, slotData);
  }

  getSlots(
    page: number = 1,
    limit: number = 10,
    doctor: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (doctor.trim()) {
      params = params.set('doctor', doctor.trim());
    }

    return this.http.get(this.slotUrl, { params });
  }

  getSlotById(slotId: string) {
    return this.http.get(`${this.slotUrl}/${slotId}`);
  }

  updateSlot(slotId: string, slotData: any) {
    return this.http.put(`${this.slotUrl}/${slotId}`, slotData);
  }

  deleteSlot(slotId: string) {
    return this.http.delete(`${this.slotUrl}/${slotId}`);
  }
}
