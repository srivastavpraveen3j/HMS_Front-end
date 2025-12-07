import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';


@Component({
  selector: 'app-patient-info-component',
  templateUrl: './patient-info-component.component.html',
  imports: [CommonModule],
  styleUrls: ['./patient-info-component.component.css']
})
export class PatientInfoComponentComponent {
  @Input() patientData: any; // single object, not array
  @Input() billData: any;
  ngOnChanges(changes: SimpleChanges) {
    if (changes['patientData']) {
      console.log('Patient object:', this.patientData);
      console.log('Patient ID:', this.patientData?._id);
    }
    if (changes['billData']) {
      console.log('Bill object:', this.billData);
      console.log('Bill ID:', this.billData?._id);
    }
  }

  // printOPDSheet(): void {
  //   const printContent = document.getElementById('opd-sheet');
  //   const printWindow = window.open('', '', 'height=600,width=800');

  //   if (printWindow && printContent) {
  //     printWindow.document.write('<html><head><title>OPD Sheet</title>');
  //     printWindow.document.write(`
  //       <style>
  //         body { font-family: Arial, sans-serif; padding: 20px; }
  //         .opd-sheet { border: 1px solid #000; padding: 20px; }
  //         .header img { width: 200px; }
  //         .info-grid { display: flex; justify-content: space-between; }
  //         .vitals-complaints { display: flex; justify-content: space-between; margin-top: 20px; }
  //         .vitals-box, .complaint-box { width: 48%; }
  //         .footer { margin-top: 40px; font-weight: bold; }
  //         .spaced-lines { height: 60px; border: 1px solid #ccc; margin: 10px 0; }
  //       </style>
  //     `);
  //     printWindow.document.write('</head><body>');
  //     printWindow.document.write(printContent.innerHTML);
  //     printWindow.document.write('</body></html>');
  //     printWindow.document.close();
  //     printWindow.focus();

  //     setTimeout(() => {
  //       printWindow.print();
  //       printWindow.close();
  //     }, 500);
  //   } else {
  //     console.error('Could not find print content or open window.');
  //   }
  // }




  //     printOPDSheet(): void {
  //   const DATA: HTMLElement = document.getElementById('opd-sheet')!;

  //   html2canvas(DATA, { scale: 2 }).then(canvas => {
  //     const imgData = canvas.toDataURL('./../../../../public/P P Maniya_page-0001.jpg');
  //     const pdf = new jsPDF('p', 'mm', 'a4');

  //     const imgProps = pdf.getImageProperties(imgData);
  //     const pdfWidth = pdf.internal.pageSize.getWidth();
  //     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  //     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  //     pdf.save(`OPD-Bill-${new Date().toISOString().slice(0, 10)}.pdf`);
  //   });
  // }

  // printOPDSheet(): void {
  //   const doc = new jsPDF();

  //   // Title and Bill Info
  //   doc.setFontSize(16);
  //   doc.text('OPD BILL', 80, 10);
  //   doc.setFontSize(12);
  //   doc.text(`Bill Number: ${this.patientData?.billnumber}`, 14, 20);
  //   doc.text(`UHID: ${this.patientData?.patientUhid?.uhid}`, 14, 28);
  //   doc.text(`Patient: ${this.patientData?.patientUhid?.patient_name}`, 14, 36);
  //   doc.text(`Date: ${new Date(this.patientData?.createdAt).toLocaleString()}`, 14, 44);

  //   // Table Data
  //   const headers = [['#', 'Service Name', 'Charge (₹)']];
  //   const data = this.patientData?.serviceId.map((s: any, i: number) => [
  //     i + 1,
  //     s.name,
  //     s.charge.toFixed(2)
  //   ]);

  //   autoTable(doc, {
  //     head: headers,
  //     body: data,
  //     startY: 50,
  //     theme: 'grid',
  //     styles: { fontSize: 11 },
  //     headStyles: { fillColor: [50, 50, 50] }
  //   });

  //   // Billing Summary
  //   const summaryStartY = (doc as any).lastAutoTable.finalY + 10;
  //   doc.text(`Total Amount: ₹${this.patientData?.totalamount.toFixed(2)}`, 14, summaryStartY);
  //   doc.text(`Amount Received: ₹${this.patientData?.amountreceived.toFixed(2)}`, 14, summaryStartY + 8);

  //   if (this.patientData?.remainder > 0) {
  //     doc.text(`Remainder: ₹${this.patientData?.remainder.toFixed(2)}`, 14, summaryStartY + 16);
  //   }

  //   // Save the PDF
  //   doc.save(`OPD-Bill-${this.patientData?.billnumber}.pdf`);
  // }




  async printOPDSheet(): Promise<void> {
    const DATA: HTMLElement | null = document.getElementById('opd-sheet');
    if (!DATA) {
      console.error('OPD sheet element not found.');
      return;
    }

    const html2canvas = (await import('html2canvas')).default;
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;

    try {
      const canvas: HTMLCanvasElement = await html2canvas(DATA, { scale: 2 });
      const imgData: string = canvas.toDataURL('image/png'); // ✅ Correct MIME type

      // 🔥 Use A5 size here
      const pdf = new jsPDF('p', 'mm', 'a5');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const today = new Date().toISOString().slice(0, 10);
      pdf.save(`OPD-Bill-${today}.pdf`);
    } catch (error) {
      console.error('Error generating OPD PDF:', error);
    }
  }
}
