import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';

// Import your services (adjust paths as needed)
import { IpdService } from '../ipdservice/ipd.service';
import { IndianCurrencyPipe } from '../../../pipe/indian-currency.pipe';

@Component({
  selector: 'app-patientaccountinfo',
  imports: [CommonModule, FormsModule, IndianCurrencyPipe],
  templateUrl: './patientaccountinfo.component.html',
  styleUrl: './patientaccountinfo.component.css'
})
export class PatientaccountinfoComponent implements OnInit {
  patientAccountData: any[] = [];
  allIpdCases: any[] = [];
  ipdDeposits: any[] = [];
  companyRates: any = {};
  transferData: any = null;

  uhidToPatientMap: { [key: string]: any } = {};
  uhidToBedMap: { [key: string]: string } = {};
  uhidToPatientUHID: { [key: string]: string } = {};
  uhidToDepositAmount: { [key: string]: number } = {};
  currentPatientUHIDs: Set<string> = new Set();

  today = new Date();
  startDate = new Date();
  endDate = new Date();
  startDateStr = '';
  endDateStr = '';

  isLoading = false;

  roomCharge = 0;
  serviceCharge = 0;
  otcharge = 0;
  total = 0;
  finalRoomCharge = 0;
  estimateBill: any = {};

  constructor(
    private router: Router,
    private ipdService: IpdService
  ) {
    this.endDate = new Date();
    this.startDate = new Date();
    this.startDate.setDate(this.startDate.getDate() - 30);

    this.startDateStr = this.startDate.toISOString().split('T')[0];
    this.endDateStr = this.endDate.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadPatientAccountData();
  }

  getSortedPatientData(): any[] {
    return [...this.patientAccountData].sort((a, b) => {
      const dateA = new Date(a.admissionTime).getTime();
      const dateB = new Date(b.admissionTime).getTime();
      if (dateA !== dateB) {
        return dateA - dateB;
      }
      return a.patientName.localeCompare(b.patientName);
    });
  }

  getCurrentPatientDeposits(): any[] {
    const currentPatientDeposits: { [key: string]: any } = {};
    const filteredDeposits = this.ipdDeposits.filter(deposit =>
      this.currentPatientUHIDs.has(deposit.uniqueHealthIdentificationId)
    );
    filteredDeposits.forEach(deposit => {
      const uhid = deposit.uniqueHealthIdentificationId;
      const amount = deposit.amountDeposited || deposit.amount || 0;
      const depositorName = deposit.depositorFullName || 'Unknown';
      const paymentMode = deposit.paymentMode || 'Cash';
      if (!currentPatientDeposits[uhid]) {
        currentPatientDeposits[uhid] = {
          uhid: uhid,
          depositorNames: [],
          amounts: [],
          paymentModes: [],
          totalAmount: 0
        };
      }
      currentPatientDeposits[uhid].depositorNames.push(depositorName);
      currentPatientDeposits[uhid].amounts.push(`₹${amount.toLocaleString()}`);
      currentPatientDeposits[uhid].paymentModes.push(paymentMode);
      currentPatientDeposits[uhid].totalAmount += amount;
    });
    return Object.values(currentPatientDeposits).map((pd: any) => ({
      uhid: pd.uhid,
      depositorNames: pd.depositorNames.join(', '),
      amounts: pd.amounts.join(', '),
      paymentModes: pd.paymentModes.join(', '),
      totalAmount: pd.totalAmount
    })).sort((a: any, b: any) => {
      const nameA = this.getPatientName(a.uhid);
      const nameB = this.getPatientName(b.uhid);
      return nameA.localeCompare(nameB);
    });
  }

  getCurrentPatientDepositsCount(): number {
    return this.getCurrentPatientDeposits().length;
  }

  loadPatientAccountData(): void {
    this.isLoading = true;
    this.patientAccountData = [];
    this.currentPatientUHIDs.clear();
    this.ipdService.getipddepositapis(1, 1000, '')
      .pipe(
        catchError((error) => {
          console.error('❌ Deposit API Error Details:', error);
          return of({ data: { deposits: [] } });
        })
      )
      .subscribe({
        next: (res) => {
          this.ipdDeposits = res.data?.deposits || [];
          this.ipdService.getIPDcase(1, 1000, '')
            .pipe(
              catchError((error) => {
                console.error('❌ IPD Cases API Error Details:', error);
                return of({ data: { inpatientCases: [] } });
              })
            )
            .subscribe({
              next: (caseRes) => {
                const allCases = caseRes.data?.inpatientCases || [];
                this.allIpdCases = allCases.filter(
                  (caseItem: any) => caseItem.isDischarge === false
                );
                this.uhidToPatientMap = {};
                this.uhidToPatientUHID = {};
                this.uhidToBedMap = {};
                this.uhidToDepositAmount = {};
                this.currentPatientUHIDs.clear();
                this.allIpdCases.forEach((ipdcase: any) => {
                  const uhid = ipdcase.uniqueHealthIdentificationId?._id;
                  this.uhidToBedMap[uhid] = ipdcase.bed_id?.bed_number || 'N/A';
                  if (uhid) {
                    this.uhidToPatientMap[uhid] = ipdcase.uniqueHealthIdentificationId;
                    this.uhidToPatientUHID[uhid] = ipdcase.uniqueHealthIdentificationId.uhid;
                    this.currentPatientUHIDs.add(uhid);
                  }
                });
                this.ipdDeposits.forEach((deposit: any) => {
                  const uhid = deposit.uniqueHealthIdentificationId;
                  const amount = deposit.amountDeposited || deposit.amount || 0;
                  if (uhid) {
                    if (!this.uhidToDepositAmount[uhid]) {
                      this.uhidToDepositAmount[uhid] = 0;
                    }
                    this.uhidToDepositAmount[uhid] += amount;
                  }
                });
                if (this.allIpdCases.length === 0) {
                  this.isLoading = false;
                  return;
                }
                let processedCount = 0;
                const totalPatients = this.allIpdCases.length;
                const checkCompletion = () => {
                  processedCount++;
                  if (processedCount === totalPatients) {
                    setTimeout(() => {
                      this.patientAccountData = this.getSortedPatientData();
                      this.isLoading = false;
                      console.log(`✅ Loaded patient account info for ${this.patientAccountData.length} patients`);
                    }, 500);
                  }
                };
                this.allIpdCases.forEach((patient) => {
                  const ipdId = patient._id;
                  this.ipdService.getPatientIntermByCaseId(ipdId)
                    .pipe(
                      catchError((error) => {
                        console.error(`❌ Error loading estimate for IPD ${ipdId}:`, error);
                        checkCompletion();
                        return of(null);
                      })
                    )
                    .subscribe({
                      next: (estRes: any) => {
                        let intermBillData = estRes;
                        if (estRes && Array.isArray(estRes.data)) {
                          intermBillData = estRes.data.length > 0 ? estRes.data[0] : null;
                        }
                        if (!intermBillData) {
                          checkCompletion();
                          return;
                        }
                        let latestEstimate = null;
                        if (intermBillData.intermBill && Array.isArray(intermBillData.intermBill)) {
                          latestEstimate = intermBillData.intermBill
                            .sort((a: any, b: any) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())[0];
                        } else if (intermBillData.intermBill) {
                          latestEstimate = intermBillData.intermBill;
                        } else {
                          latestEstimate = intermBillData;
                        }
                        // Room Transfer Log API
                        this.ipdService.getIpdRoomTransferByCase(ipdId)
                          .pipe(
                            catchError((error) => {
                              console.error('❌ Room Transfer API Error:', error);
                              return of({ dailyRoomChargeLogs: [] });
                            })
                          )
                          .subscribe({
                            next: (roomTransferData: any) => {
                              const dailyRoomCharges = roomTransferData?.dailyRoomChargeLogs || [];
                              const totalRoomTransferCharge = Array.isArray(dailyRoomCharges)
                                ? dailyRoomCharges.reduce((sum, log) =>
                                    sum + (Number(log.roomCharge) || 0) + (Number(log.bedCharge) || 0), 0
                                  )
                                : 0;
                              this.calculateSinglePatientAccount(
                                latestEstimate, intermBillData, patient, totalRoomTransferCharge
                              );
                              checkCompletion();
                            }
                          });
                      }
                    });
                });
              },
              error: (err) => {
                console.error('❌ Error loading IPD cases:', err);
                this.isLoading = false;
              }
            });
        },
        error: (err) => {
          console.error('❌ Error loading deposits:', err);
          this.isLoading = false;
        }
      });
  }

  calculateSinglePatientAccount(
    interm: any,
    casedata: any,
    patient: any,
    totalRoomTransferCharge: number
  ): void {
    try {
      const admissionDate = new Date(interm.inpatientCase?.admissionDate || patient.admissionTime);
      const isDischarge = interm.inpatientCase?.isDischarge || patient.isDischarge;
      const today = new Date();
      const endDate = isDischarge
        ? new Date(interm.inpatientCase?.dischargeDate || patient.dischargeDate || today)
        : today;

      const oneDay = 1000 * 60 * 60 * 24;
      const daysStay = Math.floor((endDate.getTime() - admissionDate.getTime()) / oneDay) + 1;

      const isCashless = casedata.patient_type === 'cashless';
      const patientRoomTypeName = interm.inpatientCase?.room?.roomType?.name;
      const patientBedTypeName = interm.inpatientCase?.bed?.bedType?.name;

      const matchedRoomRate = this.companyRates?.lockedRoomTypeRates?.find(
        (r: any) => r.roomTypeName === patientRoomTypeName
      );
      const matchedBedRate = this.companyRates?.lockedBedTypeRates?.find(
        (b: any) => b.bedTypeName === patientBedTypeName
      );

      const bedPricePerDay = matchedBedRate?.lockedRate || 0;
      const roomPricePerDay = matchedRoomRate?.lockedRate || 0;

      let finalRoomCharge = 0;

      if (this.transferData) {
        const transferCharges = this.transferData.transfers
          .filter((t: any) => t.transferType !== 'permanent')
          .map((t: any) => +t.totalCharge || 0);
        const totalTransferCharge = transferCharges.reduce((sum: any, c: any) => sum + c, 0);

        const assignedDateStr = this.transferData.primaryBed?.assignedDate;
        let daysStayed = 0;

        if (assignedDateStr) {
          const assignedDate = new Date(assignedDateStr);
          const diffInTime = today.getTime() - assignedDate.getTime();
          daysStayed = Math.ceil(diffInTime / (1000 * 3600 * 24));
        }

        const primaryBedCharge = isCashless ? bedPricePerDay : +this.transferData.primaryBed?.bedCharge || 0;
        const primaryRoomCharge = isCashless ? roomPricePerDay : +this.transferData.primaryBed?.roomCharge || 0;
        const totalPrimaryCharges = daysStayed * (primaryBedCharge + primaryRoomCharge);

        const permanentCharges = this.transferData.transfers
          .filter((t: any) => t.transferType === 'permanent')
          .map((t: any) =>
            isCashless
              ? (this.companyRates?.assignedRoomRate?.lockedRate || 0) +
                (this.companyRates?.assignedBedRate?.lockedRate || 0)
              : +t.roomCharge + +t.bedCharge || 0
          );
        const totalPermanentCharge = permanentCharges.reduce((sum: any, c: any) => sum + c, 0);
        finalRoomCharge = totalPrimaryCharges + totalTransferCharge + totalPermanentCharge;
      }
      else if (isCashless) {
        const dailyCharge = bedPricePerDay + roomPricePerDay;
        finalRoomCharge = daysStay * dailyCharge;
      }
      else {
        const bedPricePerDayBasic = interm.inpatientCase?.bed?.bedType?.price_per_day || 0;
        const roomPricePerDayBasic = interm.inpatientCase?.room?.roomType?.price_per_day || 0;
        const dailyCharge = bedPricePerDayBasic + roomPricePerDayBasic;
        finalRoomCharge = daysStay * dailyCharge;
      }

      const inpatientBills = interm.inpatientBills || [];
      const totalServiceCharge = inpatientBills.reduce(
        (sum: number, bill: any) => sum + (bill.totalBillAmount || 0), 0
      );
      const otCharges = interm.operationtheatresheet?.reduce(
        (sum: number, ot: any) => sum + (ot.netAmount || 0), 0
      ) || 0;

      const fullRoomCharge = finalRoomCharge + (Number(totalRoomTransferCharge) || 0);

      const currentBill = fullRoomCharge + totalServiceCharge + otCharges;

      const uhidForDeposit = casedata.uniqueHealthIdentificationId?._id;
      const depositAmount = this.uhidToDepositAmount[uhidForDeposit] || 0;
      const balance = currentBill - depositAmount;

      const patientAccountInfo = {
        patientId: patient._id || casedata._id,
        serialNo: this.patientAccountData.length + 1,
        admissionTime: admissionDate,
        bedNumber: interm.inpatientCase?.bed?.bed_number || patient.bed_id?.bed_number || this.uhidToBedMap[uhidForDeposit] || 'N/A',
        patientName: casedata.patient?.patient_name || patient.patientName,
        doctorName: casedata?.admittingDoctor?.name || patient.doctorName || 'consult doctor',
        remarks: this.getPatientRemarks(casedata.patient_type),
        currentBill: Math.round(currentBill),
        deposit: Math.round(depositAmount),
        balance: Math.round(balance),
        daysStay: daysStay,
        patientType: casedata.patient_type,
        roomCharge: Math.round(fullRoomCharge),
        serviceCharge: Math.round(totalServiceCharge),
        otCharge: Math.round(otCharges),
        roomTransferCharge: Math.round(totalRoomTransferCharge)
      };

      this.patientAccountData.push(patientAccountInfo);
    } catch (error) {
      console.error('❌ Error calculating patient account for', patient.patientName, error);
    }
  }

  getPatientRemarks(patientType: string): string {
    switch ((patientType || '').toLowerCase()) {
      case 'cash':
        return 'CASH';
      case 'cashless':
        return 'CASHLESS';
      case 'med':
      case 'mediclaim':
        return 'MEDICLAIM';
      default:
        return 'CASH';
    }
  }

  getPatientName(uhid: string): string {
    return this.uhidToPatientMap[uhid]?.patient_name || 'N/A';
  }

  getPatientUHID(uhid: string): string {
    return this.uhidToPatientUHID[uhid] || 'N/A';
  }

  getBedNumber(uhid: string): string {
    return this.uhidToBedMap[uhid] || 'N/A';
  }

  getTotalDepositRecords(): number {
    return this.getCurrentPatientDepositsCount();
  }

  generateEstimate(interm: any): void {
    // This function might be implemented elsewhere
  }

  onDateChange(): void {
    this.startDate = new Date(this.startDateStr);
    this.endDate = new Date(this.endDateStr);
  }

  printPatientAccount(): void {
    try {
      if (this.patientAccountData.length === 0) {
        alert('No patient account data found to print.');
        return;
      }
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        alert('Please allow pop-ups for this site to enable printing.');
        return;
      }
      const printHTML = this.generatePrintHTML();
      printWindow.document.write(printHTML);
      printWindow.document.close();
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };
    } catch (error) {
      console.error('❌ Error generating print:', error);
      alert(`Error generating print: ${(error as Error).message}`);
    }
  }

  private generatePrintHTML(): string {
    const sortedData = this.getSortedPatientData();
    const tableRows = sortedData.map((patient, i) => `
      <tr ${i % 2 === 1 ? 'style="background-color: #f9f9f9;"' : ''}>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">${i + 1}</td>
        <td style="border: 1px solid #000; padding: 4px;">${new Date(patient.admissionTime).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: '2-digit'})}</td>
        <td style="border: 1px solid #000; padding: 4px;">${patient.bedNumber}</td>
        <td style="border: 1px solid #000; padding: 4px;">${patient.patientName}</td>
        <td style="border: 1px solid #000; padding: 4px;">${patient.doctorName}</td>
        <td style="border: 1px solid #000; padding: 4px;">${patient.remarks}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${patient.currentBill.toLocaleString()}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${patient.deposit.toLocaleString()}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${patient.balance.toLocaleString()}</td>
      </tr>
    `).join('');
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Patient Account Info</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          @media print {
            body { margin: 0; }
            table { page-break-inside: avoid; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
            tbody { display: table-row-group; }
          }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 16px;">PP MANIYA HOSPITAL PVT. LTD.</h2>
          <h3 style="margin: 5px 0; font-size: 14px; text-decoration: underline;">PATIENT ACCOUNT INFO</h3>
          <div style="text-align: right; font-size: 12px; margin-top: 10px;">
            ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}<br>
            Page 1 of 1
          </div>
        </div>
        <div style="text-align: center; margin-bottom: 15px;">
          <strong>Date: ${this.startDate.toLocaleDateString('en-GB')} to ${this.endDate.toLocaleDateString('en-GB')}</strong>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr>
              <th style="border: 1px solid #000; padding: 4px; background-color: #f0f0f0;">Sr. No.</th>
              <th style="border: 1px solid #000; padding: 4px; background-color: #f0f0f0;">D.O.A</th>
              <th style="border: 1px solid #000; padding: 4px; background-color: #f0f0f0;">Bed No.</th>
              <th style="border: 1px solid #000; padding: 4px; background-color: #f0f0f0;">Patient Name</th>
              <th style="border: 1px solid #000; padding: 4px; background-color: #f0f0f0;">Dr. Name</th>
              <th style="border: 1px solid #000; padding: 4px; background-color: #f0f0f0;">Remarks</th>
              <th style="border: 1px solid #000; padding: 4px; background-color: #f0f0f0;">Current Bill</th>
              <th style="border: 1px solid #000; padding: 4px; background-color: #f0f0f0;">Deposit</th>
              <th style="border: 1px solid #000; padding: 4px; background-color: #f0f0f0;">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }

  getTotalCurrentBill(): number {
    return this.patientAccountData.reduce((sum, patient) => sum + patient.currentBill, 0);
  }
  getTotalDeposit(): number {
    return this.patientAccountData.reduce((sum, patient) => sum + patient.deposit, 0);
  }
  getTotalBalance(): number {
    return this.patientAccountData.reduce((sum, patient) => sum + patient.balance, 0);
  }
}
