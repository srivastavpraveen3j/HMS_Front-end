import { CommonModule } from '@angular/common';
import {
  Component,
  AfterViewInit,
  Input,
  OnChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vitalchart',
  imports: [CommonModule, FormsModule],
  templateUrl: './vitalchart.component.html',
  styleUrl: './vitalchart.component.css',
})
export class VitalchartComponent implements AfterViewInit, OnChanges {
  @Input() vitals: any[] = [];
  @ViewChild('temperatureChart')
  temperatureChartRef!: ElementRef<HTMLCanvasElement>;
  chart: any;

  // selectedMonth: string = '';
  filteredVitals: any[] = [];

  // Utility to get current month in 'YYYY-MM' format
  getCurrentYearMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  selectedMonth: string = this.getCurrentYearMonth();

  ngAfterViewInit() {
    this.filteredVitals = [...this.vitals];
    this.createChart();
    this.filterByMonth();
  }

  async ngOnChanges() {
    this.filteredVitals = [...this.vitals];
    if (this.chart) {
      this.chart.destroy();
    }
    await this.createChart();
  }

  async filterByMonth() {
    if (!this.selectedMonth) {
      this.filteredVitals = [...this.vitals];
    } else {
      this.filteredVitals = this.vitals.filter((v) => {
        if (!v.createdAt) return false;
        const date = new Date(v.createdAt);
        const monthStr = date.toISOString().slice(0, 7);
        return monthStr === this.selectedMonth;
      });
    }
    if (this.chart) this.chart.destroy();
    await this.createChart();
  }

  async createChart() {
    const Chart = (await import('chart.js/auto')).default;

    if (
      !this.filteredVitals ||
      this.filteredVitals.length === 0 ||
      !this.temperatureChartRef
    )
      return;

    // Destroy previous chart if exists
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    const ctx = this.temperatureChartRef.nativeElement.getContext('2d');
    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.filteredVitals.map((v) =>
            v.createdAt ? new Date(v.createdAt).toLocaleString() : ''
          ),
          datasets: [
            {
              label: 'Temperature (°F)',
              data: this.filteredVitals.map((v) => v.temperature ?? null),
              borderColor: 'rgba(255,193,7,1)',
              backgroundColor: 'rgba(255,193,7,0.2)',
              fill: false,
              tension: 0,
              pointRadius: 5,
              pointBackgroundColor: 'rgba(255,99,71,1)',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Vital Temperature' },
          },
          scales: {
            x: { title: { display: true, text: 'Date & Time' } },
            y: {
              title: { display: true, text: 'Temperature (°F)' },
              min: 90,
              max: 105,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });
    }
  }

  print() {
    const canvas = this.temperatureChartRef?.nativeElement;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const popupWin = window.open('', '_blank', 'width=800,height=900');
    if (!popupWin) return;
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Vital Temperature Chart Print</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; }
            h5 { color: #ffc107; }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <h5>Vital Temperature Chart</h5>
          <img src="${dataUrl}" style="max-width:100%;" />
        </body>
      </html>
    `);
    popupWin.document.close();
  }
}
