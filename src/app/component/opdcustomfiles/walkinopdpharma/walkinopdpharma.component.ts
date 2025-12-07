import { UhidService } from './../../../views/uhid/service/uhid.service';
import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MasterService } from '../../../views/mastermodule/masterservice/master.service';
import { LetterheaderComponent } from '../../../views/settingsmodule/letterhead/letterheader/letterheader.component';

@Component({
  selector: 'app-walkinopdpharma',
  imports: [CommonModule, RouterModule, LetterheaderComponent],
  templateUrl: './walkinopdpharma.component.html',
  styleUrl: './walkinopdpharma.component.css'
})
export class WalkinopdpharmaComponent {

  @Input() patientData: any[] = [];
  patient: any[] = [];
  medicines: any[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['patientData'] && this.patientData?.length) {
      const patient = this.patientData[0];
      this.hasDosageInstruction();
      console.log('Patient object:', patient);
      console.log('Patient ID:', patient?._id);
    }
  }

  constructor(private masterService: MasterService) {}

  ngOnInit() {
    this.fetchMedicines();
  }

  fetchMedicines(): void {
    const selectedPharmacyId = '68beb0b38066685ac24f8017';

    this.masterService
      .getSubPharmacyInventoryItems(selectedPharmacyId)
      .subscribe({
        next: (res) => {
          this.medicines = res.data;
          console.log("🚀 Medicines loaded:", this.medicines);
        },
        error: (err) => {
          console.error('Error fetching medicines:', err);
        },
      });
  }

  hasDosageInstruction(): boolean {
    return this.patientData[0]?.packages?.some((p: any) => p.dosageInstruction) ?? false;
  }

  // Helper method to get medicine details from inventory
  getMedicineDetails(medicineName: string) {
    const medicine = this.medicines.find(med =>
      med.medicine_name.toLowerCase() === medicineName.toLowerCase()
    );

    if (!medicine) {
      return {
        batch_no: '-',
        expiry_date: '-',
        mfg_date: '-',
        unit_price: 0,
        supplier: '-'
      };
    }

    // Get the latest batch details
    const latestBatch = medicine.batch_details?.[medicine.batch_details.length - 1] || {};

    return {
      batch_no: latestBatch.batch_no || medicine.medicine?.batch_no || '-',
      expiry_date: latestBatch.expiry_date ? new Date(latestBatch.expiry_date).toLocaleDateString('en-GB') : '-',
      mfg_date: latestBatch.mfg_date ? new Date(latestBatch.mfg_date).toLocaleDateString('en-GB') : '-',
      unit_price: latestBatch.unit_price || medicine.medicine?.price || 0,
      supplier: latestBatch.supplier || 'Hospital Pharmacy'
    };
  }

  // Helper method to get empty rows for table formatting
  getEmptyRows(): any[] {
    const packagesCount = this.patientData[0]?.packages?.length || 0;
    const emptyRowsCount = Math.max(0, 6 - packagesCount);
    return Array(emptyRowsCount).fill(0);
  }

  // Helper method to calculate subtotal
  getSubtotal(): number {
    const packages = this.patientData[0]?.packages || [];
    return packages.reduce((sum: number, pkg: any) =>
      sum + (pkg.quantity * pkg.charge), 0
    );
  }

  // Helper method to calculate GST amount
  getGSTAmount(): number {
    return this.getSubtotal() * 0.18;
  }

  // Helper method to calculate total
  getTotal(): number {
    return this.getSubtotal() + this.getGSTAmount();
  }

  // Helper method to get current date time
  getCurrentDateTime(): string {
    return new Date().toLocaleString('en-IN');
  }

  async printOPDSheet(): Promise<void> {
    const printContent = document.getElementById('opd-sheet');

    if (!printContent) {
      console.error('Could not find print content.');
      return;
    }

    const html2canvas = (await import('html2canvas')).default;
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;

    try {
      const canvas: HTMLCanvasElement = await html2canvas(printContent, { scale: 2 });
      const imgData: string = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('WalkInPharmacyBill.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }

  // Print function matching PP Maniya format
  print() {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      console.error('Could not open print window');
      return;
    }

    // Get the first patient data
    const patient = this.patientData?.[0];

    if (!patient) {
      console.error('No patient data available for printing');
      return;
    }

    // Get patient packages with medicine details
    const packages = patient.packages || [];

    // Calculate totals
    const subtotal = packages.reduce((sum: number, pkg: any) =>
      sum + (pkg.quantity * pkg.charge), 0
    );

    const discount = 0; // No discount for now
    const afterDiscount = subtotal - discount;
    const gstAmount = afterDiscount * 0.18; // 18% GST
    const total = afterDiscount + gstAmount;

    // Generate bill number
    const billNo = patient.inwardSerialNumber || `WI${Date.now().toString().slice(-6)}`;
    const currentDate = new Date().toLocaleDateString('en-GB');
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>PP MANIYA PHARMACY - Walk-In Patient</title>
          <style>
            @page {
              size: A4;
              margin: 6mm;
            }

            body {
              font-family: 'Courier New', monospace;
              font-size: 9px;
              line-height: 1.1;
              margin: 0;
              color: #000;
            }

            .bill-container {
              border: 1px solid #000;
              padding: 8px;
              max-width: 100%;
            }

            .header-section {
              text-align: center;
              margin-bottom: 8px;
            }

            .hospital-name {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 2px;
            }

            .address-line {
              font-size: 10px;
              margin-bottom: 1px;
            }

            .gst-invoice {
              font-size: 10px;
              margin: 4px 0;
              font-weight: bold;
            }

            .customer-info {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
              padding: 4px 0;
              border-bottom: 1px solid #000;
              font-size: 10px;
            }

            .description-section {
              margin: 8px 0;
              font-size: 10px;
            }

            .desc-row {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 8px;
              margin: 4px 0;
            }

            th, td {
              border: 1px solid #000;
              padding: 2px 3px;
              text-align: center;
            }

            th {
              background-color: #f8f8f8;
              font-weight: bold;
              font-size: 8px;
            }

            .left { text-align: left !important; }
            .right { text-align: right !important; }

            .totals-section {
              margin-top: 8px;
              display: flex;
              justify-content: space-between;
              font-size: 8px;
            }

            .left-info {
              width: 45%;
              font-size: 8px;
            }

            .right-totals {
              width: 50%;
            }

            .totals-table {
              width: 100%;
              border: 1px solid #000;
              font-size: 9px;
              border-collapse: collapse;
            }

            .totals-table td {
              padding: 3px 6px;
              border: 1px solid #000;
            }

            .payment-mode {
              text-align: right;
              font-size: 9px;
              margin-top: 6px;
            }

            .footer {
              text-align: center;
              font-size: 7px;
              margin-top: 10px;
              border-top: 1px solid #000;
              padding-top: 4px;
            }

            @media print {
              body { print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="bill-container">

            <!-- Header -->
            <div class="header-section">
              <div class="hospital-name">PP MANIYA PHARMACY LLP</div>
              <div class="address-line">C-1 GANGASAGAR NR: AARTI HOTEL GOKUL DHAM</div>
              <div class="address-line">VASTRAL AHMEDABAD-82</div>
              <div class="gst-invoice">GST NO: 24AAFPP5689K1Z5 | INVOICE</div>
            </div>

            <!-- Customer Information -->
            <div class="customer-info">
              <div>
                <strong>Customer:</strong><br>
                ${patient?.walkInPatient?.name || 'Walk-In Patient'}<br>
                Phone: ${patient?.walkInPatient?.mobile_no || 'N/A'}
              </div>
              <div style="text-align: right;">
                <strong>Date:</strong> ${currentDate}<br>
                <strong>Time:</strong> ${currentTime}<br>
                <strong>Bill No:</strong> ${billNo}
              </div>
            </div>

            <!-- Description Section -->
            <div class="description-section">
              <div class="desc-row">
                <div><strong>S. Description:</strong></div>
                <div><strong>HSN Code:</strong></div>
              </div>
              ${packages.slice(0, 2).map((pkg: any, index: number) => {
                return `
                  <div class="desc-row">
                    <div><strong>${index + 1}. ${pkg.medicineName?.toUpperCase() || 'MEDICINE'}</strong></div>
                    <div><strong>-</strong></div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Medicine Table -->
            <table>
              <thead>
                <tr>
                  <th style="width: 4%">S.</th>
                  <th style="width: 22%">Description</th>
                  <th style="width: 8%">HSN Code</th>
                  <th style="width: 8%">Mfg</th>
                  <th style="width: 10%">Batch No</th>
                  <th style="width: 10%">Exp Date</th>
                  <th style="width: 6%">Qty</th>
                  <th style="width: 8%">M.R.P</th>
                  <th style="width: 8%">Rate</th>
                  <th style="width: 8%">Disc %</th>
                  <th style="width: 8%">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${packages.map((pkg: any, index: number) => {
                  const medicineDetails = this.getMedicineDetails(pkg.medicineName);
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td class="left">${pkg.medicineName || 'N/A'}</td>
                      <td>-</td>
                      <td>${medicineDetails.mfg_date}</td>
                      <td>${medicineDetails.batch_no}</td>
                      <td>${medicineDetails.expiry_date}</td>
                      <td>${pkg.quantity || 0}</td>
                      <td class="right">${pkg.charge || 0}</td>
                      <td class="right">${pkg.charge || 0}</td>
                      <td>0.00</td>
                      <td class="right">${(pkg.quantity * pkg.charge) || 0}</td>
                    </tr>
                  `;
                }).join('')}

                <!-- Fill empty rows to maintain format -->
                ${Array(Math.max(0, 6 - packages.length)).fill(0).map(() => `
                  <tr>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- Totals Section -->
            <div class="totals-section">
              <div class="left-info">
                <div><strong>CREATING MEMO:</strong></div>
                <div>GST NO: 24AAFPP5689K1Z5</div>
                <div><strong>SUBJECT TO AHMEDABAD JURISDICTION</strong></div>
                <div><strong>HAVE A FAST RECOVERY AND GOOD HEALTH</strong></div>
                <div style="margin-top: 6px;">
                  <div><strong>Patient Info:</strong></div>
                  <div style="font-size: 7px;">
                    Name: ${patient?.walkInPatient?.name || 'N/A'}<br>
                    Age/Gender: ${patient?.walkInPatient?.age || 'N/A'}/${patient?.walkInPatient?.gender || 'N/A'}<br>
                    ${patient?.walkInPatient?.doctor_name ? `Doctor: ${patient?.walkInPatient?.doctor_name}` : ''}
                  </div>
                </div>
                <div style="margin-top: 6px;">
                  <div><strong>Medicine Instructions:</strong></div>
                  ${packages.map((pkg: any) => `
                    <div style="font-size: 6px; margin: 1px 0;">
                      • ${pkg.medicineName}: ${pkg.dosageInstruction || 'As directed'}
                      ${pkg.checkbox?.morning ? ' Morning' : ''}
                      ${pkg.checkbox?.noon ? ' Noon' : ''}
                      ${pkg.checkbox?.night ? ' Night' : ''}
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="right-totals">
                <table class="totals-table">
                  <tr>
                    <td><strong>GROSS TOTAL:</strong></td>
                    <td class="right">${subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>DISCOUNT:</td>
                    <td class="right">${discount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Round Off:</td>
                    <td class="right">0.00</td>
                  </tr>
                  <tr>
                    <td>GST (18%):</td>
                    <td class="right">${gstAmount.toFixed(2)}</td>
                  </tr>
                  <tr style="border-top: 2px solid #000;">
                    <td><strong>NET:</strong></td>
                    <td class="right"><strong>${total.toFixed(2)}</strong></td>
                  </tr>
                </table>

                <div class="payment-mode">
                  <strong>Payment Mode:</strong>${this.getPaymentModeDisplay(patient)}
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div><strong>***** Thank You Visit Again *****</strong></div>
              <div>Software By: VAIDIK SOFT Pvt Ltd | Contact: +91 9829047844</div>
              <div>Bill Generated: ${new Date().toLocaleString('en-IN')}</div>
            </div>

          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    // Handle print completion
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 1000);
    };
  }

    getPaymentModeDisplay(patient: any): string {
  if (!patient) return 'N/A';
  const c = Number(patient.cashAmount || 0);
  const u = Number(patient.upiAmount || 0);
  const card = Number(patient.cardAmount || 0);
  const count = [c, u, card].filter(val => val > 0).length;
  if (count > 1) {
    let modes = [];
    if (c > 0) modes.push(`Cash ₹${c}`);
    if (card > 0) modes.push(`Card ₹${card}`);
    if (u > 0) modes.push(`UPI ₹${u}${patient.transactionId ? ' (Txn: ' + patient.transactionId + ')' : ''}`);
    return 'Part Payment (' + modes.join(', ') + ')';
  } else if (c > 0) {
    return 'Cash ₹' + c;
  } else if (card > 0) {
    return 'Card ₹' + card;
  } else if (u > 0) {
    return 'UPI ₹' + u + (patient.transactionId ? ' (Txn: ' + patient.transactionId + ')' : '');
  }
  return 'Cash';
}
}
