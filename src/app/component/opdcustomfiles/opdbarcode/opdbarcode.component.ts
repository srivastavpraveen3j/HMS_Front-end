import { CommonModule } from '@angular/common';
import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  OnChanges,
} from '@angular/core';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-opdbarcode',
  imports: [],
  templateUrl: './opdbarcode.component.html',
  styleUrl: './opdbarcode.component.css',
})
export class OpdbarcodeComponent {
  @Input() data: any;
  @Output() close = new EventEmitter<void>();
  @ViewChild('barcode', { static: false }) barcodeElement!: ElementRef;

  ngOnChanges(): void {
    this.generateBarcode();
  }

  ngAfterViewInit(): void {
    this.generateBarcode();
  }
  generateBarcode(): void {
    const uhid =
      this.data?.uniqueHealthIdentificationId?.uhid ||
      this.data?.uniqueHealthIdentificationId?.uhid;
    if (this.barcodeElement && uhid) {
      JsBarcode(this.barcodeElement.nativeElement, uhid, {
        format: 'CODE128',
        lineColor: '#000',
        width: 1.5, // slightly slimmer
        height: 40,
        displayValue: true,
        fontSize: 14,
      });
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  // async printLabel(): Promise<void> {
  //   const printContent = document.getElementById('print-label');

  //   if (!printContent) {
  //     console.error('Could not find label to print.');
  //     return;
  //   }

  //   // Convert SVG barcode to Canvas
  //   const svg = this.barcodeElement.nativeElement as SVGSVGElement;
  //   const canvasBarcode = this.convertSvgToCanvas(svg);
  //   printContent
  //     .querySelector('.barcode-container')
  //     ?.replaceChildren(canvasBarcode);

  //   const html2canvas = (await import('html2canvas')).default;
  //   const jsPDFModule = await import('jspdf');
  //   const jsPDF = jsPDFModule.default;

  //   try {
  //     const canvas: HTMLCanvasElement = await html2canvas(printContent, {
  //       scale: 3, // Higher scale for sharpness
  //       useCORS: true,
  //     });

  //     const imgData = canvas.toDataURL('image/png');

  //     // Calculate label size based on canvas ratio
  //     const pdfWidth = 3; // inches
  //     const aspectRatio = canvas.height / canvas.width;
  //     const pdfHeight = pdfWidth * aspectRatio;

  //     const pdf = new jsPDF('l', 'in', [pdfWidth, pdfHeight]);

  //     // Add image without stretching
  //     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  //     const fileName = this.data?.uniqueHealthIdentificationId?.uhid || 'label';
  //     pdf.save(`${fileName}.pdf`);
  //   } catch (error) {
  //     console.error('Error generating label PDF:', error);
  //   }
  // }

  printLabel() {
    const opdElement = document.getElementById('print-label');
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
          <title>OPD Sheet</title>
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

  private convertSvgToCanvas(svg: SVGSVGElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(svgBlob);

    const context = canvas.getContext('2d')!;
    const img = new Image();

    img.src = url;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
    };

    return canvas;
  }
}
