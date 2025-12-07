import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pharmacymanagemnet',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pharmacymanagemnet.component.html',
  styleUrl: './pharmacymanagemnet.component.css'
})
export class PharmacymanagemnetComponent {

  selectedView: 'pharmacy' | 'inventory' = 'pharmacy';

  hospital = {

    name: 'PP Maniya Hospital',
  }
  branches = [
    {
      name: 'PP Maniya Hospital - Piplod',
      pharmacy: Array.from({ length: 20 }, (_, i) => ({
        patient: `Patient ${i + 1}`,
        medicine: `Medicine ${['A', 'B', 'C', 'D'][i % 4]}-${i + 101}`,
        doctor: `Dr. ${['Sharma', 'Rao', 'Patel'][i % 3]}`,
        pharmacist: `Pharmacist ${['Amit', 'Pooja', 'Ravi'][i % 3]}`
      })),
      inventory: Array.from({ length: 20 }, (_, i) => ({
        item: `Item-${i + 1}`,
        category: ['Medicine', 'Surgical Supplies', 'Injection', 'Tablet'][i % 4],
        quantity: Math.floor(Math.random() * 200 + 10),
        distributor: `Distributor ${['Sun Pharma', 'Apollo Meds', 'Cipla'][i % 3]}`
      }))
    },
    {
      name: 'PP Maniya Hospital - Adajan',
      pharmacy: Array.from({ length: 20 }, (_, i) => ({
        patient: `Patient N-${i + 1}`,
        medicine: `Medicine N${['X', 'Y', 'Z', 'P'][i % 4]}-${i + 121}`,
        doctor: `Dr. ${['Khan', 'Desai', 'Mishra'][i % 3]}`,
        pharmacist: `Pharmacist ${['Sita', 'Karan', 'Vivek'][i % 3]}`
      })),
      inventory: Array.from({ length: 20 }, (_, i) => ({
        item: `Item-N${i + 1}`,
        category: ['Gloves', 'Medicine', 'Bandage', 'Injection'][i % 4],
        quantity: Math.floor(Math.random() * 150 + 5),
        distributor: `Distributor ${['Bharat Biotech', 'Zydus', 'Torrent'][i % 3]}`
      }))
    },
    {
      name: 'PP Maniya Hospital - Varacha',
      pharmacy: Array.from({ length: 20 }, (_, i) => ({
        patient: `Patient E-${i + 1}`,
        medicine: `Medicine E${['M', 'N', 'O', 'Q'][i % 4]}-${i + 141}`,
        doctor: `Dr. ${['Joshi', 'Verma', 'Nair'][i % 3]}`,
        pharmacist: `Pharmacist ${['Meena', 'Dev', 'Kishore'][i % 3]}`
      })),
      inventory: Array.from({ length: 20 }, (_, i) => ({
        item: `Item-E${i + 1}`,
        category: ['Tablet', 'Antibiotic', 'Syringe', 'Gloves'][i % 4],
        quantity: Math.floor(Math.random() * 100 + 20),
        distributor: `Distributor ${['Pfizer', 'Abbott', 'Serum Institute'][i % 3]}`
      }))
    }
  ];

}
