import { UhidService } from './../../../views/uhid/service/uhid.service';
import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-patient-opdmedicine-request',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-opdmedicine-request.component.html',
  styleUrl: './patient-opdmedicine-request.component.css'
})
export class PatientOpdmedicineRequestComponent {
  @Input() patientData: any;
  selectedPatient: any;
  uhiddata: any[] = [];

  constructor(private uhidService: UhidService) {}

  ngOnInit() {
    this.uhidService.getUhid().subscribe(res => {
      this.uhiddata = res.uhids || [];
      console.log("Loaded UHID data:", this.uhiddata);

      // In case patientData is already set before UHID loads
      if (this.patientData) {
        this.processPatientData();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['patientData'] && this.patientData) {
      this.processPatientData();
    }
  }

  private processPatientData() {
    // Normalize patient data (in case it's an array)
    const baseData = Array.isArray(this.patientData) && this.patientData.length > 0
      ? this.patientData[0]
      : this.patientData;

    const uhidId = baseData?.uniqueHealthIdentificationId;
    const matchedUhid = this.uhiddata.find(u => u._id === uhidId);

    if (matchedUhid) {
      this.selectedPatient = {
        ...baseData,
        uhidDetails: matchedUhid  // you can access these in template as selectedPatient.uhidDetails.xxx
      };
    } else {
      this.selectedPatient = baseData; // fallback if no match
    }

    console.log('Selected Patient with UHID details:', this.selectedPatient);
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
      const imgData: string = canvas.toDataURL('./../../../../public/P P Maniya_page-0001.jpg');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('opdpharmarequest.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }
}
