import { catchError, filter, takeUntil, of, finalize, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MasterService } from '../../../views/mastermodule/masterservice/master.service';
import { MaterialrequestService } from '../purchaserequest/service/materialrequest.service';
import { RoleService } from '../../../views/mastermodule/usermaster/service/role.service';
import { PoService } from '../po/service/po.service';
import { RouterModule } from '@angular/router';
import { RequestquotationService } from '../rfq/service/requestquotation.service';
import { IndianCurrencyPipe } from '../../../pipe/indian-currency.pipe';
import { GrnService } from '../grn/service/grn.service';
import { InvoiceverificationService } from '../po/invoice-verification/service/invoiceverification.service';
import { DistributionService } from '../distributionmanagement/distribution/distribution.service';

interface StockTransfer {
  _id: string;
  transferId: string;
  from: string;
  to:
    | {
        _id: string;
        name: string;
        type: string;
        location: string;
      }
    | string;
  items: Array<{
    medicine?: {
      _id: string;
      medicine_name: string;
      dose: number;
      lowStockThreshold: number;
      isLowStock: boolean;
      id: string;
    };
    medicine_name: string;
    requested_quantity: number;
    approved_quantity: number;
    unit_price: number;
    total_value: number;
    batch_details?: Array<{
      batch_no: string;
      expiry_date: string;
      mfg_date: string;
      unit_price: number;
      quantity: number;
      _id: string;
    }>;
  }>;
  status: 'completed' | 'in_progress' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  total_value: number;
  total_items_count: number;
  requested_by: string;
  approved_by?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

@Component({
  selector: 'app-inventorydashboard',
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IndianCurrencyPipe,
  ],
  templateUrl: './inventorydashboard.component.html',
  styleUrl: './inventorydashboard.component.css',
})
export class InventorydashboardComponent implements OnInit, OnDestroy {

  // ✅ Initialize all arrays to prevent undefined errors
  lowStockMedicinesFullList: any[] = [];
  lowStockMedicines: any[] = [];
  totalMedicineValue: number = 0;

  // Material requests
  currentPage = 1;
  totalPages = 1;
  searchTerm: string = '';
  filterStatus: string = 'Submitted';
  selectedStatus: string = 'Submitted';
  recordsPerPage: number = 10;
  requisitions: any[] = [];
  requisition: any[] = [];
  allRequisitions: any = 0;

  // Purchase orders
  purchaseOrders: any[] = [];
  allpurchaseOrders: any[] = [];

  // Expired products
  expireproducts: any[] = [];
  countexpired: string = '0';

  // RFQ
  requoation: number = 0;
  quotagiven: number = 0;

  // GRN
  goodreceivenotes: any[] = [];

  // Invoices
  invoiceList: any[] = [];

  // Stock transfers
  private destroy$ = new Subject<void>();
  stockTransfers: any[] = [];
  filteredTransfers: any[] = [];
  totalRecords = 0;

  // Filters
  fromDate: string = '';
  toDate: string = '';
  statusFilter: string = '';
  priorityFilter: string = '';
  pharmacyFilter: string = '';

  constructor(
    private masterService: MasterService,
    private materialreqservice: MaterialrequestService,
    private userservice: RoleService,
    private poservice: PoService,
    private rfq: RequestquotationService,
    private grnservice: GrnService,
    private invoiceService: InvoiceverificationService,
    private distributionService: DistributionService
  ) {}

  ngOnInit(): void {
    // ✅ Set filterStatus BEFORE loading
    this.filterStatus = this.selectedStatus;

    // Load all data
    this.fetchLowStockMedicines();
    this.loadmaterialrequest();
    this.loadpo();
    this.expiredmedicine();
    this.loadrfq();
    this.loadgrn();
    this.loadInvoices();
    this.loadTransfers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Low stock medicine
  fetchLowStockMedicines(): void {
    const pharmacyId = '68beb0b38066685ac24f8017';

    this.masterService
      .getSubPharmacyInventoryItems(pharmacyId, this.currentPage)
      .subscribe({
        next: (res) => {
          if (res?.data) {
            const filtered = res.data.filter(
              (med: any) => med.current_stock < 10 && !this.isExpired(med)
            );
            this.lowStockMedicinesFullList = filtered || [];
          }
        },
        error: (err) => {
          console.error('Error fetching medicines:', err);
          this.lowStockMedicinesFullList = [];
        },
      });
  }

  isExpired(medicine: any): boolean {
    if (!medicine?.expiry_date) return false;

    try {
      const expiryDate = new Date(medicine.expiry_date);
      const today = new Date();
      return expiryDate < today;
    } catch (error) {
      console.error('Error parsing date:', error);
      return false;
    }
  }

  isNearExpiry(medicine: any, daysThreshold: number = 30): boolean {
    if (!medicine?.expiry_date) return false;

    try {
      const expiryDate = new Date(medicine.expiry_date);
      const today = new Date();
      const timeDiff = expiryDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      return daysDiff <= daysThreshold && daysDiff > 0;
    } catch (error) {
      return false;
    }
  }

  // Material requests list
  loadmaterialrequest(): void {
    this.materialreqservice
      .getmaterialrequest(
        this.currentPage,
        this.recordsPerPage,
        this.searchTerm,
        this.filterStatus
      )
      .subscribe({
        next: (res) => {
          this.requisitions = res?.data || [];
          this.totalPages = res?.totalPages || 1;
          this.currentPage = res?.page || 1;

          // Table के लिए sirf 3 records
          this.requisition = this.requisitions.slice(0, 3);

          // Counter के लिए total records
          this.allRequisitions = res?.totalRecords || this.requisitions.length;

          // Load user details
          this.requisitions.forEach((req) => {
            if (req.createdBy) {
              this.userservice
                .getuserByIds(req.createdBy)
                .subscribe((userRes) => {
                  req.createdByUser = userRes;
                });
            }
            if (req.approvedBy) {
              this.userservice
                .getuserByIds(req.approvedBy)
                .subscribe((userRes) => {
                  req.approvedByUser = userRes;
                });
            }
          });
        },
        error: (err) => {
          console.error('Error loading material requests:', err);
          this.requisitions = [];
          this.requisition = [];
        }
      });
  }

  // Purchase orders
loadpo(): void {
  this.poservice
    .getpogeneration(this.currentPage, this.recordsPerPage)
    .subscribe({
      next: (res) => {
        console.log('✅ API Response:', res);
        const allpurchaseOrders = res.data || [];

        // Filter pending POs
        const filteredPOs = allpurchaseOrders.filter(
          (po: any) => po.potogrn === 'pending'
        );

        this.allpurchaseOrders = filteredPOs
        // ✅ FIXED: Remove extra parentheses around 'a'
         filteredPOs.sort(
          (a: any, b: any) =>  // ← Added type annotations
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );



        // Limit to first 4 items for dashboard display
        this.purchaseOrders = filteredPOs.slice(0, 4);

        console.log(`🚀 Total pending POs: ${filteredPOs.length}`);
        console.log(`📋 Dashboard showing: ${this.purchaseOrders.length} POs`);
        console.log("📋 Limited POs for dashboard:", this.purchaseOrders);
      },
      error: (error) => {
        console.error('❌ Error loading POs:', error);
        this.purchaseOrders = [];
        this.totalRecords = 0;
        this.totalPages = 1;
      }
    });
}

  // Expired medicine
  expiredmedicine(): void {
    this.masterService.getexpiredmedicine().subscribe({
      next: (res: any) => {
        this.countexpired = res?.data?.count?.toString() || '0';
        this.expireproducts = res?.data?.medicines?.slice(0, 3) || [];

        // Calculate total value
        this.calculateTotalValue();
      },
      error: (err) => {
        console.error('Error fetching expired medicines:', err);
        this.expireproducts = [];
        this.countexpired = '0';
      },
    });
  }

  calculateTotalValue(): void {
    const combinedList = [
      ...this.lowStockMedicinesFullList,
      ...this.expireproducts,
    ];

    this.totalMedicineValue = combinedList.reduce(
      (sum, med) => sum + (med?.price || 0),
      0
    );
  }

  // RFQ
  loadrfq(): void {
    const today = new Date().toISOString().split('T')[0];

    this.rfq.getrequestquotations().subscribe({
      next: (res) => {
        const allRfq = res?.data || [];

        // Filter only today's RFQs
        const todaysRfq = allRfq.filter((rfq: any) => {
          const createdDate = new Date(rfq.createdAt).toISOString().split('T')[0];
          return createdDate === today;
        });

        // Separate counts
        const openRfq = todaysRfq.filter((rfq: any) => rfq.status === 'open');
        const quotagiven = todaysRfq.filter(
          (rfq: any) => rfq.status === 'quotagiven'
        );

        this.requoation = openRfq.length;
        this.quotagiven = quotagiven.length;
        this.totalPages = res?.totalPages || 1;
      },
      error: (err) => {
        console.error('Error loading RFQs:', err);
        this.requoation = 0;
        this.quotagiven = 0;
      }
    });
  }

  // GRN
  loadgrn(): void {
    const today = new Date().toISOString().split('T')[0];

    this.grnservice.getgrngeneration().subscribe({
      next: (res) => {
        const allGrn = res?.data?.data || [];

        // Filter only today's GRNs
        this.goodreceivenotes = allGrn.filter((grn: any) => {
          const createdDate = new Date(grn.createdAt).toISOString().split('T')[0];
          return createdDate === today;
        });
      },
      error: (err) => {
        console.error('Error loading GRNs:', err);
        this.goodreceivenotes = [];
      }
    });
  }

  // Invoices
  loadInvoices(): void {
    const today = new Date().toISOString().split('T')[0];

    this.invoiceService.getVerifiedInvoices(this.currentPage).subscribe({
      next: (response) => {
        if (response?.success && response?.data) {
          const allInvoices = response.data.invoices || response.data.data || [];

          // Filter only today's invoices
          this.invoiceList = allInvoices.filter((invoice: any) => {
            const createdDate = new Date(invoice.createdAt)
              .toISOString()
              .split('T')[0];
            return createdDate === today;
          });
        } else {
          this.invoiceList = [];
        }
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.invoiceList = [];
      },
    });
  }

  // Stock transfers
  loadTransfers(): void {
    const today = new Date().toISOString().split('T')[0];

    this.distributionService
      .exportAllTransfers()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error loading transfers:', error);
          return of({ success: false, data: [] });
        })
      )
      .subscribe((response) => {
        if (response?.success) {
          // Filter only today's transfers
          this.stockTransfers = (response.data || []).filter(
            (transfer: any) => {
              const transferDate = new Date(transfer.createdAt)
                .toISOString()
                .split('T')[0];
              return transferDate === today;
            }
          );

          this.filteredTransfers = this.stockTransfers;
          this.totalRecords = this.filteredTransfers.length;
        } else {
          this.stockTransfers = [];
          this.filteredTransfers = [];
          this.totalRecords = 0;
        }
      });
  }
}
