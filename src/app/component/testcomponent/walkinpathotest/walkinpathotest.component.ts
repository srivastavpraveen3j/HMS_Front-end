import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UhidService } from '../../../views/uhid/service/uhid.service';

@Component({
  selector: 'app-walkinpathotest',
  imports: [CommonModule, RouterModule],
  templateUrl: './walkinpathotest.component.html',
  styleUrl: './walkinpathotest.component.css'
})
export class WalkinpathotestComponent {

   @Input() patientData: any[] = [];

  constructor(private uhidservice: UhidService) {}

    uhiddata: any[] = [];
    matchedPatient: any = null;

    ngOnChanges(changes: SimpleChanges): void {
      if (changes['patientData']?.currentValue?.length) {
        const patient = this.patientData[0];
        console.log('🧾 Patient object:', patient);
        console.log('🆔 Patient ID:', patient?._id);

        
      }
  }

  async printOPDSheet(): Promise<void> {
    const printContent = document.getElementById('opd-sheet');
    if (!printContent) return console.error('❌ Could not find print content.');

    const html2canvas = (await import('html2canvas')).default;
    const { default: jsPDF } = await import('jspdf');

    try {
      const canvas = await html2canvas(printContent, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('RadiationTestReport.pdf');
    } catch (error) {
      console.error('⚠️ Error generating PDF:', error);
    }
  }
}
