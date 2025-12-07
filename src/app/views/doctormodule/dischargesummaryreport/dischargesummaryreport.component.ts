import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LetterheaderComponent } from '../../settingsmodule/letterhead/letterheader/letterheader.component';

@Component({
  selector: 'app-dischargesummaryreport',
  imports: [CommonModule, LetterheaderComponent],
  templateUrl: './dischargesummaryreport.component.html',
  styleUrl: './dischargesummaryreport.component.css',
})
export class DischargesummaryreportComponent {
  @Input() summary: any;
  user: any;

  sectionKeys = [
    'INITIAL_DIAGNOSIS',
    'CLINICAL_HISTORY_EXAMINATION',
    'SIGNIFICANT_PAST_MEDICAL_SURGICAL_FAMILY_HISTORY',
    'CLINICAL_FINDINGS',
    'INVESTIGATIONS_RADIOLOGY',
    'INVESTIGATIONS_PATHOLOGY',
    'INVESTIGATIONS_RADIATION',
    'OPERATION_PROCEDURE',
    'TREATMENT_GIVEN',
    'TREATMENT_ON_DISCHARGE',
    'CONDITION_ON_DISCHARGE',
    'ADVICE_ON_DISCHARGE',
    'DIET_ADVICE',
    'FINAL_DIAGNOSIS_ICD10_CODES',
  ];
  sectionLabels: any = {
    INITIAL_DIAGNOSIS: 'Initial Diagnosis',
    CLINICAL_HISTORY_EXAMINATION: 'Clinical History & Examination',
    SIGNIFICANT_PAST_MEDICAL_SURGICAL_FAMILY_HISTORY:
      'Significant Past Medical / Surgical / Family History',
    CLINICAL_FINDINGS: 'Clinical Findings',
    INVESTIGATIONS_RADIOLOGY: 'Investigations - Radiology',
    INVESTIGATIONS_PATHOLOGY: 'Investigations - Pathology',
    INVESTIGATIONS_RADIATION: 'Investigations - Radiation',
    OPERATION_PROCEDURE: 'Operation / Procedure',
    TREATMENT_GIVEN: 'Treatment Given',
    TREATMENT_ON_DISCHARGE: 'Treatment on Discharge',
    CONDITION_ON_DISCHARGE: 'Condition on Discharge',
    ADVICE_ON_DISCHARGE: 'Advice on Discharge',
    DIET_ADVICE: 'Diet Advice',
    FINAL_DIAGNOSIS_ICD10_CODES: 'Final Diagnosis (ICD-10 Codes)',
  };

  ngOnInit() {
    console.log('summary', this.summary);
    const userStr = JSON.parse(localStorage.getItem("authUser") || '[]').name;
    this.user = userStr;
  }

printDischargeSummaryReport() {
  const opdElement = document.getElementById('opd-sheet');
  if (!opdElement) return;

  const opdClone = opdElement.cloneNode(true) as HTMLElement;

  // Convert images to base64
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

  Promise.all(Array.from(images).map((img) => convertImageToBase64(img)))
  .then(() => {
    const printWindow = window.open('', '_blank', 'width=1000,height=1200');
    if (!printWindow) return;

    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((style) => style.outerHTML).join('\n');

    printWindow.document.write(`
      <html>
        <head>
          <title>Discharge Summary</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 5mm !important;
            }

            body, html {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: 100vh !important;
              overflow: hidden !important;
              font-family: Arial, sans-serif !important;
              -webkit-print-color-adjust: exact !important;
              font-size: 9px !important; /* Very small font */
            }

            #opd-print {
              width: 100% !important;
              height: 100vh !important;
              overflow: hidden !important;
              transform: scale(0.65) !important; /* Much smaller scale */
              transform-origin: top left !important;
              background: white !important;
              padding: 5px !important;
              box-sizing: border-box !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
            }

            /* Force everything on single page - AGGRESSIVE */
            *, *::before, *::after {
              page-break-inside: avoid !important;
              page-break-after: avoid !important;
              page-break-before: avoid !important;
              break-inside: avoid !important;
              break-after: avoid !important;
              break-before: avoid !important;
              box-sizing: border-box !important;
            }

            /* Compress all text elements */
            h1, h2, h3, h4, h5, h6 {
              margin: 1px 0 !important;
              padding: 0 !important;
              font-size: 10px !important;
              line-height: 1.1 !important;
              font-weight: bold !important;
            }

            p, div, span, td, th, li {
              margin: 0 !important;
              padding: 1px !important;
              font-size: 8px !important;
              line-height: 1.0 !important;
            }

            table {
              font-size: 7px !important;
              border-collapse: collapse !important;
              width: 100% !important;
              margin: 2px 0 !important;
            }

            td, th {
              padding: 1px 2px !important;
              font-size: 7px !important;
              line-height: 1.0 !important;
            }

            .summary-section {
              margin-bottom: 3px !important;
              padding: 2px !important;
            }

            .section-content {
              padding: 1px !important;
              margin: 0 !important;
            }

            /* Remove any extra spacing */
            br {
              line-height: 0.5 !important;
            }

            /* Hide unnecessary elements */
            .no-print, .print-hide, button {
              display: none !important;
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
      setTimeout(() => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      }, 1500);
    };
  });
}


}
