import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import * as XLSX from 'xlsx';
import { Chart } from 'chart.js/auto';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
@Component({
  selector: 'app-reports',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  roomChargesForm: FormGroup;
  chart: any;
  reportData: any[] = [];
title : string = '';



ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    this.title = params['title'] || 'Reports'; // Default title if none is passed
  });
}






  generateReport() {
    // Mock data for the report (replace with API call if needed)
    this.reportData = [
      { doctor: 'Doctor 26', amount: 20000 },
      { doctor: 'Dr. Amit Patel', amount: 30000 },
      { doctor: 'Manish Mittal', amount: 50000 },
      { doctor: 'Self', amount: 450000 },
      { doctor: 'N/A', amount: 10000 }
    ];

    this.renderChart();
  }

  renderChart() {
    if (this.chart) {
      this.chart.destroy(); // Destroy previous chart if exists
    }

    this.chart = new Chart('incomeChart', {
      type: 'bar',
      data: {
        labels: this.reportData.map(d => d.doctor),
        datasets: [{
          label: 'Total Amount',
          data: this.reportData.map(d => d.amount),
          backgroundColor: 'orange'
        }]
      }
    });
  }

  exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DoctorIncomeReport');
    XLSX.writeFile(workbook, 'DoctorIncomeReport.xlsx');
  }







  roomFields = [
    'generalRoom', 'deluxe', 'icu', 'specialNonAc', 'specialAc',
    'akota', 'villa1', 'villa2', 'superDeluxe', 'deluxe2', 'femaleGeneralWard'
  ];

  get roomRatesFormGroup(): FormGroup {
    return this.roomChargesForm.get('roomRates') as FormGroup;
  }


  constructor(private fb: FormBuilder,private route: ActivatedRoute) {
    this.roomChargesForm = this.fb.group({
      serviceGroup: ['Room Charges'],
      serviceName: [''],
      extraDetails: [''],
      drRequired: ['no'],
      rate: [''],
      rateEditable: ['no'],
      status: ['active'],
      roomRates: this.fb.group({
        generalRoom: [''],
        deluxe: [''],
        icu: [''],
        specialNonAc: [''],
        specialAc: [''],
        akota: [''],
        villa1: [''],
        villa2: [''],
        superDeluxe: [''],
        deluxe2: [''],
        femaleGeneralWard: ['']
      })
    });
  }




  saveForm() {
    console.log(this.roomChargesForm.value);
  }

}
