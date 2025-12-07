import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Chart } from 'chart.js';
// import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-accesscontrol',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './accesscontrol.component.html',
  styleUrl: './accesscontrol.component.css'
})
export class AccesscontrolComponent {
  chart!: Chart;
  hospitals = [
    { name: 'PP Maniya Hospital', branches: ['Rajkot', 'Piplod', 'Amreli'] },
    { name: 'Varcaar Hospital', branches: ['Naviad', 'Junagadh', 'Bhuj'] },
    { name: 'Barnach Medical', branches: ['Ahmedabad', 'Surat'] },
    { name: 'Aarna Care Center', branches: ['Vadodara', 'Dwarka'] },
    { name: 'Suvarna Health', branches: ['Morbi', 'Jetpur'] }
  ];

  selectedHospital = this.hospitals[0].name;
  branches = this.hospitals[0].branches;
  selectedBranch = this.branches[0];
  selectedPeriod = 'monthly';

  metrics = [
    { label: 'Total Appointments', value: 320 },
    { label: 'OPD Visits', value: 185 },
    { label: 'IPD Admissions', value: 78 },
    { label: 'Lab Tests', value: 550 }
  ];


  ngAfterViewInit() {
    this.renderChart();
  }

  filterData() {
    const hospital = this.hospitals.find(h => h.name === this.selectedHospital);
    this.branches = hospital?.branches ?? [];
    this.selectedBranch = this.branches[0] ?? '';
    this.renderChart();
  }

  renderChart() {
    const dataMap: Record<string, { labels: string[], data: number[] }> = {
      monthly: { labels: ['Jan', 'Feb', 'Mar', 'Apr'], data: [50, 75, 100, 95] },
      quarterly: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], data: [180, 250, 230, 310] },
      yearly: { labels: ['2022', '2023', '2024', '2025'], data: [780, 860, 950, 1020] }
    };

    const { labels, data } = dataMap[this.selectedPeriod];

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = document.getElementById('usageChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Appointments',
          data: data,
          backgroundColor: '#861111',
          borderRadius: 12,
          barThickness: 30,
          hoverBackgroundColor: '#A61919'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 50 },
            grid: { color: '#eee' }
          },
          x: {
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: { backgroundColor: '#444', titleColor: '#fff', bodyColor: '#fff' }
        }
      }
    });
  }

  getMetricIcon(label: string): string {
    const icons: { [key: string]: string } = {
      'Total Appointments': 'assets/icons/calendar.svg',
      'OPD Visits': 'assets/icons/opd.svg',
      'IPD Admissions': 'assets/icons/ipd.svg',
      'Lab Tests': 'assets/icons/lab.svg'
    };
    return icons[label] || 'assets/icons/default.svg';
  }
}
