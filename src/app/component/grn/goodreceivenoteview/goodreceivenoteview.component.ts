import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoService } from '../../../viewspharma/purchase order management/po/service/po.service';
import { CommonModule } from '@angular/common';
import { GrnService } from '../../../viewspharma/purchase order management/grn/service/grn.service';
import { LetterheaderComponent } from '../../../views/settingsmodule/letterhead/letterheader/letterheader.component';

@Component({
  selector: 'app-goodreceivenoteview',
    imports: [CommonModule, LetterheaderComponent],
  templateUrl: './goodreceivenoteview.component.html',
  styleUrl: './goodreceivenoteview.component.css'
})
export class GoodreceivenoteviewComponent {


  poId!: string;
  purchaseOrder: any = null;

  constructor(private route: ActivatedRoute, private poService: GrnService, private router : Router) {}

  ngOnInit() {
    this.poId = this.route.snapshot.paramMap.get('poId')!;
    this.loadPurchaseOrder();
  }

  loadPurchaseOrder() {
    this.poService.getgrngenerationById(this.poId).subscribe({
      next: (res) => {
        this.purchaseOrder = res.data;
        console.log("Loaded PO:", this.purchaseOrder);
      },
      error: (err) => {
        console.error("Failed to load PO", err);
      }
    });
  }

get grnSubtotal(): number {
  return this.purchaseOrder?.items?.reduce((sum: number, item: any) =>
    sum + (item.unitPrice * item.quantityPassed), 0) || 0;
}

get grnTotalGST(): number {
  return this.purchaseOrder?.items?.reduce((sum: number, item: any) => {
    const passedItemTotal = item.unitPrice * item.quantityPassed;
    return sum + ((item.gstPercent || 0) / 100) * passedItemTotal;
  }, 0) || 0;
}


  get grnGrandTotal(): number {
    return this.grnSubtotal + this.grnTotalGST;
  }

  getTotalQuantityReceived(): number {
    return this.purchaseOrder?.items?.reduce((sum: number, item: any) =>
      sum + ((item.quantityPassed || 0) + (item.quantityRejected || 0)), 0) || 0;
  }

  getRejectedValue(): number {
    return this.purchaseOrder?.items?.reduce((sum: number, item: any) =>
      sum + (item.unitPrice * (item.quantityRejected || 0)), 0) || 0;
  }

  hasRejectedItems(): boolean {
    return this.purchaseOrder?.items?.some((item: any) =>
      (item.quantityRejected || 0) > 0) || false;
  }


async printOPDSheet(): Promise<void> {
  const printContent = document.getElementById('grn-sheet');

  if (!printContent) {
    console.error('Could not find print content.');
    return;
  }

  const html2canvas = (await import('html2canvas')).default;
  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.default;

  try {
    const canvas: HTMLCanvasElement = await html2canvas(printContent, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`GRN-${this.purchaseOrder?.grnNumber || 'document'}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

// qc control
// getTotalQuantityPassed(): number {
//   return this.purchaseOrder?.items?.reduce((sum: number, item: any) =>
//     sum + (item.quantityPassed || 0), 0) || 0;
// }

// getTotalQuantityRejected(): number {
//   return this.purchaseOrder?.items?.reduce((sum: number, item: any) =>
//     sum + (item.quantityRejected || 0), 0) || 0;
// }

hasDefects(): boolean {
  return this.purchaseOrder?.items?.some((item: any) =>
    item.defectDetails && item.defectDetails.length > 0) || false;
}

// getQcStatusText(status: string): string {
//   const statusMap: { [key: string]: string } = {
//     'passed': 'PASSED',
//     'rejected': 'REJECTED',
//     'partial_reject': 'PARTIAL',
//     'pending': 'PENDING'
//   };
//   return statusMap[status] || status?.toUpperCase();
// }



print() {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  const po = this.purchaseOrder; // Your GRN data

  printWindow.document.write(`
    <html>
      <head>
        <title>Goods Receipt Note - ${po?.grnNumber}</title>
        <style>
          @page {
            size: A4;
            margin: 8mm;
          }

          body {
            font-family: Arial, sans-serif;
            font-size: 7px;
            line-height: 1.1;
            margin: 0;
            color: #000;
          }

          /* ✅ HEADER */
          .header {
            text-align: center;
            border-bottom: 2px solid #007bff;
            padding: 4px;
            margin-bottom: 4px;
          }

          .header .hospital-name {
            font-size: 11px;
            font-weight: bold;
            color: #8B4513;
          }

          .header .subtitle {
            font-size: 8px;
            color: #8B4513;
          }

          /* ✅ TITLE */
          .title {
            background: #007bff;
            color: white;
            text-align: center;
            padding: 3px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 4px;
          }

          /* ✅ SECTIONS */
          .section {
            margin: 3px 0;
          }

          .row {
            display: flex;
            gap: 5px;
          }

          .col-50 {
            width: 50%;
            padding: 2px;
          }

          .col-25 {
            width: 25%;
            padding: 2px;
          }

          /* ✅ INFO CARDS */
          .info-card {
            border: 1px solid #ddd;
            padding: 3px;
            background: #f9f9f9;
            margin-bottom: 3px;
          }

          .info-card h4 {
            font-size: 8px;
            margin: 0 0 2px 0;
            font-weight: bold;
            color: #007bff;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 1px 0;
          }

          .label {
            font-weight: bold;
            font-size: 6px;
          }

          .value {
            font-size: 6px;
          }

          /* ✅ TABLES */
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 5px;
            margin: 2px 0;
          }

          th, td {
            border: 1px solid #000;
            padding: 1px 2px;
            text-align: center;
          }

          th {
            background: #343a40;
            color: white;
            font-weight: bold;
            font-size: 5px;
          }

          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .text-success { color: #28a745; }
          .text-danger { color: #dc3545; }

          /* ✅ BADGES */
          .badge {
            display: inline-block;
            padding: 1px 3px;
            font-size: 4px;
            border-radius: 2px;
            color: white;
            font-weight: bold;
          }

          .bg-primary { background: #007bff; }
          .bg-success { background: #28a745; }
          .bg-danger { background: #dc3545; }
          .bg-warning { background: #ffc107; color: #000; }
          .bg-info { background: #17a2b8; }

          /* ✅ QC STATUS COLORS */
          .table-success { background-color: #d4edda !important; }
          .table-warning { background-color: #fff3cd !important; }
          .table-danger { background-color: #f8d7da !important; }

          /* ✅ SIGNATURES */
          .signatures {
            margin-top: 8px;
            page-break-inside: avoid;
          }

          .sig-box {
            width: 25%;
            float: left;
            text-align: center;
            font-size: 5px;
            padding: 2px;
          }

          .sig-line {
            border-top: 1px solid #000;
            margin: 6px 0 2px 0;
            height: 8mm;
          }

          .sig-role {
            font-weight: bold;
            font-size: 5px;
          }

          .sig-name {
            font-size: 4px;
            margin: 1px 0;
          }

          .sig-date {
            font-size: 4px;
            color: #666;
          }

          /* ✅ SUMMARY SECTION */
          .summary-section {
            margin: 3px 0;
            font-size: 6px;
          }

          .qc-info {
            background: #f8f9fa;
            padding: 2px;
            border: 1px solid #ddd;
          }

          .financial-summary table {
            font-size: 5px;
          }

          /* ✅ FOOTER */
          .footer {
            text-align: center;
            font-size: 4px;
            margin-top: 4px;
            border-top: 1px solid #ddd;
            padding-top: 2px;
            color: #666;
          }

          /* ✅ UTILITIES */
          .clearfix::after {
            content: "";
            display: table;
            clear: both;
          }

          .fw-bold { font-weight: bold; }
          .text-center { text-align: center; }
          .mb-0 { margin-bottom: 0; }

          /* ✅ DEFECTS SECTION */
          .defects {
            background: #f8d7da;
            border: 1px solid #dc3545;
            padding: 2px;
            margin: 2px 0;
            font-size: 5px;
          }

          .action-items {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 2px;
            margin: 2px 0;
            font-size: 5px;
          }
        </style>
      </head>
      <body>
        <!-- ✅ HEADER -->
        <div class="header">
          <div class="hospital-name">P. P. Maniya Children's Super Speciality Hospital</div>
          <div class="subtitle">And Maternity Home, Laparoscopy & Test Tube Baby Centre</div>
          <div style="font-size: 6px; color: #666;">(A centre for women & child)</div>
        </div>

        <!-- ✅ TITLE -->
        <div class="title">GOODS RECEIPT NOTE (GRN)</div>

        <!-- ✅ GRN INFORMATION -->
        <div class="section">
          <div class="row">
            <div class="col-50">
              <div class="info-card">
                <h4>GRN Details</h4>
                <div class="detail-row">
                  <span class="label">GRN Number:</span>
                  <span class="value fw-bold">${po?.grnNumber || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="label">GRN Date:</span>
                  <span class="value">${po?.createdAt ? new Date(po.createdAt).toLocaleDateString() : ''}</span>
                </div>
                <div class="detail-row">
                  <span class="label">PO Reference:</span>
                  <span class="value">${po?.poNumber || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="label">RFQ Number:</span>
                  <span class="value">${po?.rfq?.number || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div class="col-50">
              <div class="info-card">
                <h4>Delivery Information</h4>
                <div class="detail-row">
                  <span class="label">Delivery Date:</span>
                  <span class="value">${po?.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Receipt Time:</span>
                  <span class="value">${po?.createdAt ? new Date(po.createdAt).toLocaleTimeString() : ''}</span>
                </div>
                <div class="detail-row">
                  <span class="label">QC Completion:</span>
                  <span class="value">${po?.qcCompletionPercentage || 0}%</span>
                </div>
                <div class="detail-row">
                  <span class="label">Return Status:</span>
                  <span class="value">
                    <span class="badge ${po?.returnInitiated ? 'bg-warning' : 'bg-success'}">
                      ${po?.returnInitiated ? 'YES' : 'NO'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ✅ SUPPLIER & RECEIVER -->
        <div class="section">
          <div class="row">
            <div class="col-50">
              <div class="info-card">
                <h4>Supplier Details</h4>
                <div style="font-size: 6px;">
                  <div><strong>Name:</strong> ${po?.vendor?.name || 'N/A'}</div>
                  <div><strong>Phone:</strong> ${po?.vendor?.phone || 'N/A'}</div>
                  <div><strong>Email:</strong> ${po?.vendor?.email || 'N/A'}</div>
                  <div><strong>Address:</strong> ${po?.vendor?.id?.address || 'N/A'}</div>
                </div>
              </div>
            </div>
            <div class="col-50">
              <div class="info-card">
                <h4>Received By</h4>
                <div style="font-size: 6px;">
                  <div><strong>Name:</strong> ${po?.createdBy?.name || 'N/A'}</div>
                  <div><strong>Designation:</strong> ${po?.createdBy?.designation || 'Store Manager'}</div>
                  <div><strong>Email:</strong> ${po?.createdBy?.email || 'N/A'}</div>
                  <div><strong>Department:</strong> ${po?.department || 'CENTRAL STORE PHARMACY'}</div>
                  <div><strong>Date & Time:</strong> ${po?.createdAt ? new Date(po.createdAt).toLocaleString() : ''}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ✅ ITEMS RECEIVED -->
        <div class="section">
          <div style="font-size: 8px; font-weight: bold; margin-bottom: 2px;">
            Items Received
            <span class="badge bg-primary">Total: ${po?.items?.length || 0}</span>
            <span class="badge bg-success">Accepted: ${this.getTotalQuantityPassed?.() || 0}</span>
            <span class="badge bg-danger">Rejected: ${this.getTotalQuantityRejected?.() || 0}</span>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 4%">#</th>
                <th style="width: 25%">Item Description</th>
                <th style="width: 8%">Batch</th>
                <th style="width: 8%">Expiry</th>
                <th style="width: 8%">Ordered</th>
                <th style="width: 8%">Received</th>
                <th style="width: 8%">Accepted</th>
                <th style="width: 8%">Rejected</th>
                <th style="width: 8%">Rate (₹)</th>
                <th style="width: 8%">QC Status</th>
                <th style="width: 9%">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${po?.items?.map((item: any, i: number) => `
                <tr class="${this.getRowClass?.(item.qcStatus) || ''}">
                  <td>${i + 1}</td>
                  <td class="text-left">
                    <strong>${item.name || ''}</strong><br>
                    <small>${item.category || ''}</small>
                  </td>
                  <td>${item.batchNo || 'N/A'}</td>
                  <td>${item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-GB', {month: '2-digit', year: 'numeric'}) : 'N/A'}</td>
                  <td>${item.quantityOrdered || 0}</td>
                  <td>${item.quantityReceived || 0}</td>
                  <td class="text-success fw-bold">${item.quantityPassed || 0}</td>
                  <td class="text-danger fw-bold">${item.quantityRejected || 0}</td>
                  <td class="text-right">₹${item.unitPrice || 0}</td>
                  <td>
                    <span class="badge ${this.getQcStatusBadgeClass?.(item.qcStatus) || 'bg-info'}">
                      ${this.getQcStatusText?.(item.qcStatus) || 'Pending'}
                    </span>
                  </td>
                  <td class="text-right fw-bold">₹${item.totalPrice || 0}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
        </div>

        <!-- ✅ QC & FINANCIAL SUMMARY -->
        <div class="section">
          <div class="row">
            <div class="col-50">
              <div class="summary-section">
                <h4 style="font-size: 7px; margin-bottom: 2px;">Quality Control Report</h4>
                <div class="qc-info">
                  <div><strong>QC By:</strong> ${po?.qcSummary?.qcPerformedBy?.name || 'N/A'}</div>
                  <div><strong>Started:</strong> ${po?.qcSummary?.qcStartedAt ? new Date(po.qcSummary.qcStartedAt).toLocaleString() : 'N/A'}</div>
                  <div><strong>Completed:</strong> ${po?.qcSummary?.qcCompletedAt ? new Date(po.qcSummary.qcCompletedAt).toLocaleString() : 'N/A'}</div>
                  <div><strong>Completion:</strong> <span class="badge bg-info">${po?.qcCompletionPercentage || 0}%</span></div>
                  ${po?.qcSummary?.qcNotes ? `<div><strong>Notes:</strong> ${po.qcSummary.qcNotes}</div>` : ''}
                </div>
              </div>
            </div>
            <div class="col-50">
              <div class="financial-summary">
                <h4 style="font-size: 7px; margin-bottom: 2px;">Financial Summary</h4>
                <table>
                  <tr>
                    <td class="text-left">Original Total:</td>
                    <td class="text-right">₹${po?.total || 0}</td>
                  </tr>
                  <tr>
                    <td class="text-left">Approved Value:</td>
                    <td class="text-right text-success">₹${po?.approvedTotal || 0}</td>
                  </tr>
                  <tr>
                    <td class="text-left">Rejected Value:</td>
                    <td class="text-right text-danger">₹${po?.rejectedTotal || 0}</td>
                  </tr>
                  <tr style="font-weight: bold; background: #d4edda;">
                    <td class="text-left">Final Accepted:</td>
                    <td class="text-right">₹${po?.approvedTotal || 0}</td>
                  </tr>
                </table>
                ${po?.rejectedTotal > 0 ? `
                  <div style="margin-top: 2px; font-size: 5px;">
                    <strong>Financial Loss:</strong> ${((po.rejectedTotal / po.total) * 100).toFixed(1)}%
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>

        ${po?.returnInitiated ? `
        <!-- ✅ ACTION ITEMS -->
        <div class="action-items">
          <strong>Action Items:</strong>
          Return initiated • Follow-up required with vendor • Accepted items added to inventory
        </div>
        ` : ''}

        <!-- ✅ SIGNATURES -->
        <div class="signatures">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-role">Goods Received By</div>
            <div class="sig-name">${po?.createdBy?.name || ''}</div>
            <div class="sig-date">${po?.createdAt ? new Date(po.createdAt).toLocaleDateString() : ''}</div>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-role">Quality Checked By</div>
            <div class="sig-name">${po?.qcSummary?.qcPerformedBy?.name || 'QC Inspector'}</div>
            <div class="sig-date">${po?.qcSummary?.qcCompletedAt ? new Date(po.qcSummary.qcCompletedAt).toLocaleDateString() : '__/__/____'}</div>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-role">Approved By</div>
            <div class="sig-name">${po?.approvedBy?.name || 'Store Manager'}</div>
            <div class="sig-date">${po?.approvalDate ? new Date(po.approvalDate).toLocaleDateString() : '__/__/____'}</div>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-role">Purchase Manager</div>
            <div class="sig-name">Purchase Head</div>
            <div class="sig-date">__/__/____</div>
          </div>
          <div class="clearfix"></div>
        </div>

        <!-- ✅ FOOTER -->
        <div class="footer">
          This GRN is electronically generated and serves as proof of goods receipt. |
          Reference: ${po?.grnNumber} | Generated: ${po?.createdAt ? new Date(po.createdAt).toLocaleString() : ''} |
          QC Completion: ${po?.qcCompletionPercentage || 0}%
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }, 500);
  };
}

// ✅ HELPER METHODS (Add these to your component)
getRowClass(qcStatus: string): string {
  switch(qcStatus) {
    case 'passed': return 'table-success';
    case 'partial_reject': return 'table-warning';
    case 'rejected': return 'table-danger';
    default: return '';
  }
}

getQcStatusBadgeClass(qcStatus: string): string {
  switch(qcStatus) {
    case 'passed': return 'bg-success';
    case 'partial_reject': return 'bg-warning';
    case 'rejected': return 'bg-danger';
    default: return 'bg-info';
  }
}

getQcStatusText(qcStatus: string): string {
  switch(qcStatus) {
    case 'passed': return 'PASSED';
    case 'partial_reject': return 'PARTIAL';
    case 'rejected': return 'REJECTED';
    default: return 'PENDING';
  }
}

getTotalQuantityPassed(): number {
  return this.purchaseOrder?.items?.reduce((sum: number, item: any) =>
    sum + (item.quantityPassed || 0), 0) || 0;
}

getTotalQuantityRejected(): number {
  return this.purchaseOrder?.items?.reduce((sum: number, item: any) =>
    sum + (item.quantityRejected || 0), 0) || 0;
}



  goBack(): void {
    this.router.navigateByUrl('/inventorylayout/goodreceivenotelist');
  }



}
