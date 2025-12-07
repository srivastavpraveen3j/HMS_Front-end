import { CommonModule } from '@angular/common';
import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  OnChanges
} from '@angular/core';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-barcode-dialog',
  standalone: true,
  templateUrl: './barcode-dialog.component.html',
  styleUrls: ['./barcode-dialog.component.css'],
  imports: [CommonModule],
})
export class BarcodeDialogComponent implements AfterViewInit, OnChanges {
  @Input() data: any;
  @Output() close = new EventEmitter<void>();
  @ViewChild('barcode', { static: false }) barcodeElement!: ElementRef;

  ngAfterViewInit(): void {
    this.generateBarcode();
  }

  ngOnChanges(): void {
    this.generateBarcode();
  }

  generateBarcode(): void {
    if (this.barcodeElement && this.data?.uhid) {
      JsBarcode(this.barcodeElement.nativeElement, this.data.uhid, {
        format: 'CODE128',
        lineColor: '#000',
        width: 2,
        height: 40,
        displayValue: true
      });
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  async printLabel(): Promise<void> {
    const printContent = document.getElementById('print-label');

    if (!printContent) {
      console.error('Could not find label to print.');
      return;
    }

    // Convert SVG barcode to Canvas
    const svg = this.barcodeElement.nativeElement as SVGSVGElement;
    const canvasBarcode = this.convertSvgToCanvas(svg);
    printContent.querySelector('.barcode-container')?.replaceChildren(canvasBarcode);

    const html2canvas = (await import('html2canvas')).default;
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;

    try {
      const canvas: HTMLCanvasElement = await html2canvas(printContent, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'in', [3, 1]); // 3 inch x 1 inch label
      pdf.addImage(imgData, 'PNG', 0, 0, 3, 1);
      pdf.save('label.pdf');
    } catch (error) {
      console.error('Error generating label PDF:', error);
    }
  }

  private convertSvgToCanvas(svg: SVGSVGElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
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
