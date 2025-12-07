import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormsModule, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RequestquotationService } from '../service/requestquotation.service';
import { LoaderComponent } from '../../../../views/loader/loader.component';

@Component({
  selector: 'app-request-for-quotationlist',
  imports: [CommonModule, RouterModule, FormsModule, LoaderComponent],
  templateUrl: './request-for-quotationlist.component.html',
  styleUrl: './request-for-quotationlist.component.css'
})
export class RequestForQuotationlistComponent {


    recordsPerPage: number = 10;
  searchText: string = '';
  medicines: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;

 requisitions: any[] = [];

   activeFilter = 'today';
    startDate: string = '';
    endDate: string = '';
  module: string = '';
   userPermissions: any = {};
 constructor(private fb : FormBuilder,private rfq:RequestquotationService){}

 ngOnInit(){

  const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      this.startDate = todayString;
      this.endDate = todayString;

const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');

  // 🔑 extract BOTH the module wrapper and its inner permissions
  const rfqModule = allPermissions.find(
    (perm: any) => perm.moduleName === 'requestForQuotation'
  );                                            // returns { moduleName , permissions } [11]

  this.userPermissions = rfqModule?.permissions || { read: 0, create: 0, update: 0, delete: 0 };
  this.module           = rfqModule?.moduleName || 'requestForQuotation';

  this.loadrfq()
 }


 allrequisitions : any[] = [];
loadrfq() {
  this.rfq.getrequestquotation(1, 1000, this.searchText).subscribe(res => {
    this.allrequisitions = res.data;
    this.applyFilters();
  });
}



 nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }


 applyFilters() {
  let baseList = [...this.allrequisitions];

  if (this.activeFilter === 'today') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    baseList = baseList.filter(po => {
      const createdAt = new Date(po?.createdAt || po?.created_at);
      return createdAt >= today && createdAt < tomorrow;
    });
  }
  else if (this.activeFilter === 'dateRange') {
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;
    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    baseList = baseList.filter(po => {
      const createdAt = new Date(po?.createdAt || po?.created_at);
      if (!start || !end) return false;
      return createdAt >= start && createdAt <= end;
    });
  }

  this.totalPages = Math.ceil(baseList.length / this.recordsPerPage) || 1;
  const startIndex = (this.currentPage - 1) * this.recordsPerPage;
  const endIndex = startIndex + this.recordsPerPage;
  this.requisitions = baseList.slice(startIndex, endIndex);

  console.log('filtered data', this.requisitions);
}

}
