import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dischargecard',
  imports: [CommonModule],
  templateUrl: './dischargecard.component.html',
  styleUrl: './dischargecard.component.css',
})
export class DischargecardComponent {
  @Input() dischargeData: any;

  print() {
    const opdElement = document.getElementById('opd-sheet');
    if (!opdElement) return;
    const opdClone = opdElement.cloneNode(true) as HTMLElement;
    // Convert images to base64 for cross-origin safety
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
      const printWindow = window.open('', '_blank', 'width=1000,height=1200');
      if (!printWindow) return;
      const styles = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style')
      )
        .map((style) => style.outerHTML)
        .join('\n');
      printWindow.document.write(`
      <html>
        <head>
          <title>Discharge card</title>
          ${styles}
          <style>
            body, html {
              margin: 0; padding: 0; width: 100%; height: auto !important;
              overflow: visible !important; font-family: Arial, sans-serif;
              -webkit-print-color-adjust: exact;
            }
            #opd-print {
              width: 210mm; /* A4 width */
              min-height: 100vh; /* start with viewport height */
              max-width: 100%;
              overflow: visible !important;
              box-sizing: border-box;
              background: white;
              padding: 15px;
              page-break-inside: avoid;
            }
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            .summary-section {
              page-break-inside: avoid !important;
              break-inside: avoid-page !important;
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
        // Dynamically set height for full content to prevent cutting off
        const opdPrintElement =
          printWindow.document.getElementById('opd-print');
        if (opdPrintElement) {
          const fullHeight = opdPrintElement.scrollHeight;
          opdPrintElement.style.height = fullHeight + 'px';
        }
        setTimeout(() => {
          printWindow.print();
          printWindow.onafterprint = () => printWindow.close();
        }, 500);
      };
    });
  }
}
