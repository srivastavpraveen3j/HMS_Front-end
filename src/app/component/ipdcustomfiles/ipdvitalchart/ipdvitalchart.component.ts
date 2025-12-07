import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UhidService } from '../../../views/uhid/service/uhid.service';


@Component({
  selector: 'app-ipdvitalchart',
  imports: [CommonModule, RouterModule],
  templateUrl: './ipdvitalchart.component.html',
  styleUrl: './ipdvitalchart.component.css'
})
export class IpdvitalchartComponent {

@Input() patientData: any; // or rename to `vitalData`

  // patient : any[] = []
patient: any = null;

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['patientData']) {
  //     const patient = this.patientData?.[0];
  //     console.log('Patient object:', patient);
  //     console.log('Patient ID:', patient?._id);
  //   }
  // }

  uhidDetails: any = null;   // this will hold patient name, age, etc.

  constructor(private http: HttpClient, private uhiservice : UhidService) {}

ngOnChanges(changes: SimpleChanges): void {
  if (changes['patientData'] && this.patientData) {
    this.patient = this.patientData;
    const uhid = this.patient.uniqueHealthIdentificationId;

    if (uhid) {
      this.uhiservice.getUhidById(uhid).subscribe({
        next: (res) => {
          this.uhidDetails = res;

          // Optionally merge into patient
          this.patient = {
            ...this.patient,
            patient_name: res.name,
            age: res.age
          };
        },
        error: (err) => {
          console.error('❌ Error fetching UHID details:', err);
        }
      });
    }
  }
}


  getUhidById(uhid: string): void {
    this.uhiservice.getUhidById(uhid).subscribe({
      next: (res) => {
        this.uhidDetails = res;
        console.log('✅ UHID Details:', this.uhidDetails);
      },
      error: (err) => {
        console.error('❌ Error fetching UHID details:', err);
      }
    });
  }

async printOPDSheet(): Promise<void> {
  const printContent = document.getElementById('opd-sheet');

  if (!printContent) {
    console.error('Could not find print content.');
    return;
  }

  const html2canvas = (await import('html2canvas')).default;
  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.default;

  try {
    const canvas: HTMLCanvasElement = await html2canvas(printContent, { scale: 2 });
    const imgData: string = canvas.toDataURL('./../../../../public/P P Maniya_page-0001.jpg'); // Fixed: Correct MIME type

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('vital-sheet.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}




}
