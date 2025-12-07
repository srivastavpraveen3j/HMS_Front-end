import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environment/env';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class VendorquotationService {
  constructor(private http: HttpClient, private route: ActivatedRoute) {}
  rfqId: string = '';
  vendorId: string = '';
  // opdcase apis starts here
  ngOnInit() {
    this.rfqId = this.route.snapshot.paramMap.get('rfqId')!;
    this.vendorId = this.route.snapshot.paramMap.get('vendorId')!;
  }

  private url = `${environment.baseurl}/rfq/${this.rfqId}/vendor/${this.vendorId}`;

  getrfqtovendor() {
    return this.url;
  }
}
