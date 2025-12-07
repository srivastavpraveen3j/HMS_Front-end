import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { LetterheaderComponent } from '../../../views/settingsmodule/letterhead/letterheader/letterheader.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ipdadmissionview',
  imports: [CommonModule, LetterheaderComponent],
  templateUrl: './ipdadmissionview.component.html',
  styleUrl: './ipdadmissionview.component.css',
})
export class IpdadmissionviewComponent {
  @Input() patientData: any; // this is an array
  patient: any;
  user: any;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['patientData'] && this.patientData?.length > 0) {
      this.patient = this.patientData[0]; // 👈 set patient from array
    }
  }

  constructor(private route: ActivatedRoute){}

  ngOnInit(){
    const user = JSON.parse(localStorage.getItem('authUser') || '[]');
    this.user = user.name;
  }

  // async printOPDSheet(): Promise<void> {
  //   const printContent = document.getElementById('ipd-sheet');

  //   if (!printContent) {
  //     console.error('Could not find print content.');
  //     return;
  //   }

  //   const html2canvas = (await import('html2canvas')).default;
  //   const jsPDFModule = await import('jspdf');
  //   const jsPDF = jsPDFModule.default;

  //   try {
  //     const canvas: HTMLCanvasElement = await html2canvas(printContent, {
  //       scale: 2,
  //       useCORS: true, // Allows external image like hospital logo to load
  //     });

  //     const imgData = canvas.toDataURL('image/png');
  //     const pdf = new jsPDF('p', 'mm', 'a4');
  //     const pdfWidth = pdf.internal.pageSize.getWidth();
  //     const pdfHeight = pdf.internal.pageSize.getHeight();

  //     const imgWidth = pdfWidth;
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;

  //     let heightLeft = imgHeight;
  //     let position = 0;

  //     // First page
  //     pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  //     heightLeft -= pdfHeight;

  //     // Add more pages if content overflows
  //     while (heightLeft > 0) {
  //       position = heightLeft - imgHeight;
  //       pdf.addPage();
  //       pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  //       heightLeft -= pdfHeight;
  //     }

  //     pdf.save('ipd-case.pdf');
  //   } catch (error) {
  //     console.error('Error generating PDF:', error);
  //   }
  // }

  printOPDSheet() {
    const opdElement = document.getElementById('ipd-sheet');
    if (!opdElement) return;

    const opdClone = opdElement.cloneNode(true) as HTMLElement;

    const images = opdClone.querySelectorAll('img');
    const convertImageToBase64 = (img: HTMLImageElement) => {
      return new Promise<void>((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = img.src;
        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0);
          img.src = canvas.toDataURL('image/png');
          resolve();
        };
        image.onerror = () => resolve();
      });
    };

    Promise.all(
      Array.from(images).map((img) => convertImageToBase64(img))
    ).then(() => {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) return;

      const styles = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style')
      )
        .map((style) => style.outerHTML)
        .join('\n');

      printWindow.document.write(`
      <html>
        <head>
          <title>IPD Sheet</title>
          ${styles}
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            #opd-print {
              width: 100%;
            }
            @media print {
              @page {
                size: A4 portrait;
                margin: 10mm;
              }
              /* Allow page breaks inside the content */
              #opd-print {
                page-break-inside: auto !important;
              }
              #opd-print * {
                page-break-inside: auto !important;
                page-break-before: auto !important;
                page-break-after: auto !important;
              }
              /* Avoid breaking only key sections */
              .no-break {
                page-break-inside: avoid !important;
              }
            }
          </style>
        </head>
        <body>
          <div id="opd-print">${opdClone.outerHTML}</div>
        </body>
      </html>
    `);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      };
    });
  }
}
