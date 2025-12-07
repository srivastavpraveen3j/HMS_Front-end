import { CommonModule } from '@angular/common';
import {
  Component,
  AfterViewInit,
  Input,
  OnChanges,
  ViewChild,
  ElementRef,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-growthchart',
  imports: [CommonModule],
  templateUrl: './growthchart.component.html',
  styleUrl: './growthchart.component.css',
})
export class GrowthchartComponent implements AfterViewInit, OnChanges {
  @Input() patient: any = {};
  @ViewChild('growthChart') growthChartRef!: ElementRef<HTMLCanvasElement>;

  growthChartType: 'boys' | 'girls' = 'boys';
  referenceChartData: any[] = [];
  growthData: any[] = [];
  chart: any;

  readonly BOYS_GROWTH_CHART_REFERENCE = [
    { age: 1, medianHeight: 76, medianWeight: 10 },
    { age: 2, medianHeight: 88, medianWeight: 12.3 },
    { age: 3, medianHeight: 96, medianWeight: 14.2 },
    { age: 4, medianHeight: 104, medianWeight: 16.3 },
    { age: 5, medianHeight: 111, medianWeight: 18.5 },
    // ... extend to 18
  ];

  readonly GIRLS_GROWTH_CHART_REFERENCE = [
    { age: 1, medianHeight: 75, medianWeight: 9.8 },
    { age: 2, medianHeight: 87, medianWeight: 12 },
    { age: 3, medianHeight: 95, medianWeight: 14 },
    { age: 4, medianHeight: 103, medianWeight: 16 },
    { age: 5, medianHeight: 109, medianWeight: 18 },
    // ... extend to 17
  ];

  ngAfterViewInit() {
    this.updateChartType();
    this.prepareGrowthData();
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateChartType();
    this.prepareGrowthData();
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.renderChart();
  }

  updateChartType() {
    const gender = this.patient?.uniqueHealthIdentificationId?.gender;
    if (gender === 'male') {
      this.growthChartType = 'boys';
      this.referenceChartData = this.BOYS_GROWTH_CHART_REFERENCE;
    } else {
      this.growthChartType = 'girls';
      this.referenceChartData = this.GIRLS_GROWTH_CHART_REFERENCE;
    }
  }

  getAgeInYears(dob: string, date: string): number {
    if (!dob || !date) return 0;
    const birth = new Date(dob);
    const current = new Date(date);
    const diff = current.getTime() - birth.getTime();
    return +(diff / (365.25 * 24 * 3600 * 1000)).toFixed(2);
  }

  prepareGrowthData() {
    const dob = this.patient?.uniqueHealthIdentificationId?.dob;
    const vitals = this.patient?.vitals || [];
    this.growthData = vitals
      .filter((v: any) => v.height && v.weight && v.createdAt)
      .map((v: any) => ({
        age: this.getAgeInYears(dob, v.createdAt),
        height: v.height,
        weight: v.weight,
      }));
  }

  async renderChart() {
    if (!this.growthChartRef) return;
    if (!this.referenceChartData.length) return;
    const Chart = (await import('chart.js/auto')).default;
    const ctx = this.growthChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
    const labelAges = Array.from({ length: 18 }, (_, i) => i + 1); // ages 1–18

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labelAges,
        datasets: [
          {
            label: 'P50 (Median Height)',
            data: this.referenceChartData.map((d) => d.medianHeight),
            borderColor: '#90caf9',
            borderDash: [5, 5],
            fill: false,
            yAxisID: 'yHeight',
          },
          {
            label: 'P50 (Median Weight)',
            data: this.referenceChartData.map((d) => d.medianWeight),
            borderColor: '#ffb74d',
            borderDash: [5, 5],
            fill: false,
            yAxisID: 'yWeight',
          },
          {
            label: 'Patient Height',
            data: this.growthData.map((d) => ({
              x: d.age,
              y: d.height,
            })),
            borderColor: '#1565c0',
            backgroundColor: '#1976d2',
            pointRadius: 8,
            fill: false,
            showLine: false,
            yAxisID: 'yHeight',
          },
          {
            label: 'Patient Weight',
            data: this.growthData.map((d) => ({
              x: d.age,
              y: d.weight,
            })),
            borderColor: '#f44336',
            backgroundColor: '#d32f2f',
            pointRadius: 8,
            fill: false,
            showLine: false,
            yAxisID: 'yWeight',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: {
            display: true,
            text: `Growth Chart - ${
              this.growthChartType === 'boys' ? 'Boys' : 'Girls'
            }`,
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Age (Years)' },
            min: 1,
            max: 18,
            ticks: { stepSize: 1 },
          },
          yHeight: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: 'Height (cm)' },
            min: 60,
            max: 180,
            grid: { drawOnChartArea: false },
          },
          yWeight: {
            type: 'linear',
            position: 'right',
            title: { display: true, text: 'Weight (kg)' },
            min: 10,
            max: 80,
            grid: { drawOnChartArea: false },
          },
        },
      },
    });
  }

  printGrowthChart() {
    const canvas = this.growthChartRef?.nativeElement;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL(); // get base64 image data
    const popupWin = window.open('', '_blank', 'width=800,height=900');
    if (!popupWin) return;
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Growth Chart Print</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; }
            h5 { color: #1565c0; }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <h5>Growth Chart: ${
            this.growthChartType === 'boys'
              ? 'Boys 1-18 Years'
              : 'Girls 1-17 Years'
          }</h5>
          <img src="${dataUrl}" style="max-width:100%;" />
        </body>
      </html>
    `);
    popupWin.document.close();
  }
}
