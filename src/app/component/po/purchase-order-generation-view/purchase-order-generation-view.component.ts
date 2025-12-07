import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoService } from '../../../viewspharma/purchase order management/po/service/po.service';
import { CommonModule } from '@angular/common';
import { LetterheaderComponent } from '../../../views/settingsmodule/letterhead/letterheader/letterheader.component';

@Component({
  selector: 'app-purchase-order-generation-view',
  imports: [CommonModule, LetterheaderComponent],
  templateUrl: './purchase-order-generation-view.component.html',
  styleUrl: './purchase-order-generation-view.component.css'
})
export class PurchaseOrderGenerationViewComponent implements OnInit {

  poId!: string;
  purchaseOrder: any = null;
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private poService: PoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.poId = this.route.snapshot.paramMap.get('poId')!;
    this.loadPurchaseOrder();
  }

  // ✅ Enhanced Load Purchase Order
  loadPurchaseOrder() {
    if (!this.poId) {
      console.error('No PO ID provided');
      return;
    }

    this.isLoading = true;
    this.poService.getpogenerationById(this.poId).subscribe({
      next: (res) => {
        this.isLoading = false;

        // ✅ Handle new response structure
        if (res.success && res.data) {
          this.purchaseOrder = res.data;
        } else {
          // Fallback for old structure
          this.purchaseOrder = res;
        }

        console.log("✅ Loaded PO:", this.purchaseOrder);
      },
      error: (err) => {
        this.isLoading = false;
        console.error("❌ Failed to load PO", err);
      }
    });
  }

  // ✅ Calculate subtotal (excluding GST)
  get subtotal(): number {
    if (!this.purchaseOrder?.items) return 0;

    return this.purchaseOrder.items.reduce((sum: number, item: any) => {
      const itemSubtotal = (item.unitPrice || 0) * (item.quantity || 0);
      return sum + itemSubtotal;
    }, 0);
  }

  // ✅ Calculate total GST
  get totalGST(): number {
    if (!this.purchaseOrder?.items) return 0;

    return this.purchaseOrder.items.reduce((sum: number, item: any) => {
      const itemSubtotal = (item.unitPrice || 0) * (item.quantity || 0);
      const gstAmount = itemSubtotal * ((item.gstPercent || 0) / 100);
      return sum + gstAmount;
    }, 0);
  }

  // ✅ Calculate grand total
  get grandTotal(): number {
    const base = this.subtotal + this.totalGST;
    const shipping = this.purchaseOrder?.shippingCost || 0;
    const other = this.purchaseOrder?.otherCharges || 0;
    return base + shipping + other;
  }

  // ✅ Get formatted delivery status
  get deliveryStatus(): string {
    if (!this.purchaseOrder?.deliveryDate) return 'Not specified';

    const deliveryDate = new Date(this.purchaseOrder.deliveryDate);
    const today = new Date();
    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'Due Tomorrow';
    return `Due in ${diffDays} days`;
  }

  // ✅ Get payment terms display
  get paymentTermsDisplay(): string {
    return this.purchaseOrder?.paymentTerms || '30 days from invoice date';
  }

  // ✅ Get delivery terms display
  get deliveryTermsDisplay(): string {
    return this.purchaseOrder?.deliveryTerms || 'FOB destination';
  }

  // ✅ Enhanced Print Function
  async printPOSheet(): Promise<void> {
    const printContent = document.getElementById('po-sheet');

    if (!printContent) {
      console.error('Could not find print content.');
      return;
    }

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;

      const canvas: HTMLCanvasElement = await html2canvas(printContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // Generate filename with PO number and date
      const filename = `PO-${this.purchaseOrder?.poNumber || 'document'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      console.log('✅ PDF generated successfully:', filename);
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
    }
  }

  // ✅ Go back to PO list
  goBack(): void {
    this.router.navigateByUrl('/inventorylayout/purchaseordergenerationlist');
  }

  // ✅ Get status badge class
  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-warning';
      case 'acknowledged': return 'bg-info';
      case 'items_collected': return 'bg-primary';
      case 'resolved': return 'bg-success';
      case 'disputed': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  // ✅ Get PO type badge class
  getPOTypeBadgeClass(type: string): string {
    switch (type?.toLowerCase()) {
      case 'regular': return 'bg-primary';
      case 'return': return 'bg-warning';
      case 'replacement': return 'bg-info';
      default: return 'bg-secondary';
    }
  }



print() {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  const po = this.purchaseOrder; // Assuming you have the PO data

  printWindow.document.write(`
    <html>
      <head>
        <title>Purchase Order - ${po?.poNumber}</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body { font-family: Arial; font-size: 8px; line-height: 1.1; margin: 0; }
          .header { text-align: center; border-bottom: 2px solid #007bff; padding: 5px; margin-bottom: 5px; }
          .title { background: #007bff; color: white; text-align: center; padding: 3px; font-size: 12px; font-weight: bold; }
          .section { margin: 3px 0; }
          .row { display: flex; }
          .col-50 { width: 50%; padding: 2px; }
          table { width: 100%; border-collapse: collapse; font-size: 7px; }
          th, td { border: 1px solid #000; padding: 1px 2px; }
          th { background: #f0f0f0; font-weight: bold; }
          .signatures { margin-top: 10px; }
          .sig-box { width: 25%; float: left; text-align: center; font-size: 6px; }
          .sig-line { border-top: 1px solid #000; margin: 8px 0 2px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-size: 10px; font-weight: bold;">P. P. Maniya Children's Super Speciality Hospital</div>
          <div style="font-size: 8px;">And Maternity Home, Laparoscopy & Test Tube Baby Centre</div>
        </div>

        <div class="title">PURCHASE ORDER</div>

        <div class="section">
          <div class="row">
            <div class="col-50">
              <strong>PO Details</strong><br>
              PO Number: ${po?.poNumber}<br>
              Order Date: ${po?.createdAt ? new Date(po.createdAt).toLocaleDateString() : ''}<br>
              Delivery Date: ${po?.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString() : ''}
            </div>
            <div class="col-50">
              <strong>Reference Info</strong><br>
              RFQ Number: ${po?.rfq?.number || 'N/A'}<br>
              PO Type: ${po?.poType || 'Regular'}<br>
              Department: ${po?.department || 'Central Store Pharmacy'}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="row">
            <div class="col-50">
              <strong>Buyer: PP Maniya Hospital</strong><br>
              Staff: ${po?.createdBy?.name || ''}<br>
              Email: ${po?.createdBy?.email || ''}
            </div>
            <div class="col-50">
              <strong>Vendor: ${po?.vendor?.name || ''}</strong><br>
              Phone: ${po?.vendor?.phone || ''}<br>
              Email: ${po?.vendor?.email || ''}
            </div>
          </div>
        </div>

        <div class="section">
          <strong>Order Items</strong>
          <table>
            <tr>
              <th>#</th><th>Item</th><th>Unit</th><th>Qty</th><th>Price</th><th>Total</th>
            </tr>
            ${po?.items?.map((item: any, i: number) => `
              <tr>
                <td>${i + 1}</td>
                <td>${item.name}</td>
                <td>${item.unit || 'Nos'}</td>
                <td>${item.quantity}</td>
                <td>₹${item.unitPrice}</td>
                <td>₹${item.totalPrice}</td>
              </tr>
            `).join('') || ''}
            <tr style="font-weight: bold;">
              <td colspan="5">Grand Total:</td>
              <td>₹${po?.total || 0}</td>
            </tr>
          </table>
        </div>

        <div class="section" style="font-size: 6px;">
          <strong>Terms:</strong> Payment: 30 days | Delivery: FOB destination | Quality standards apply
        </div>

        <div class="signatures">
          <div class="sig-box">
            <div class="sig-line"></div>
            Requested By<br>${po?.createdBy?.name || ''}
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            Approved By<br>Dept Head
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            Authorized By<br>Purchase Mgr
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            Vendor<br>${po?.vendor?.name || ''}
          </div>
          <div style="clear: both;"></div>
        </div>

        <div style="text-align: center; font-size: 5px; margin-top: 5px;">
          PO Number: ${po?.poNumber} | Generated: ${new Date().toLocaleString()}
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



}
