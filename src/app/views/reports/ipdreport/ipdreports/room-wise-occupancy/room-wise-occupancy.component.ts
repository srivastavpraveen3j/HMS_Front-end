import { Component } from '@angular/core';
import { IpdService } from '../../../../ipdmodule/ipdservice/ipd.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterService } from '../../../../mastermodule/masterservice/master.service';

@Component({
  selector: 'app-room-wise-occupancy',
  imports: [CommonModule, FormsModule],
  templateUrl: './room-wise-occupancy.component.html',
  styleUrl: './room-wise-occupancy.component.css',
})
export class RoomWiseOccupancyComponent {
  inpatientCases: any[] = [];
  wardMaster: any[] = [];
  occupancyRecord: any[] = [];

  wards: string[] = [];
  rooms: any[] = [];

  selectedWard: string = '';
  selectedRoom: string = '';
  selectedBeds: any[] = [];

  // Loading states
  isLoading: boolean = false;
  isDataLoaded: boolean = false;

  constructor(
    private ipdService: IpdService,
    private masterService: MasterService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Load initial data with loading state management
   */
  loadInitialData(): void {
    this.isLoading = true;
    this.getAllIpdCases();
  }

  /**
   * Get all IPD cases with pagination
   */
  getAllIpdCases(page: number = 1): void {
    this.ipdService.getIPDcase(page).subscribe({
      next: (response) => {
        const ipdCases = response.data?.inpatientCases || [];
        const totalPages = response.data?.totalPages;

        this.inpatientCases.push(...ipdCases);

        if (page < totalPages) {
          // Recursively load next page
          this.getAllIpdCases(page + 1);
        } else {
          this.getRoomOccupancy();
        }
      },
      error: (error) => {
        console.error('Failed to fetch IPD cases:', error);
        this.isLoading = false;
      },
    });
  }

  /**
   * Get room occupancy data from ward master
   */
  getRoomOccupancy(): void {
    const allCases: any[] = [];

    const fetchPage = (page: number) => {
      this.masterService.getWardmasterUrl(page).subscribe({
        next: (data) => {
          const cases = data.wardMasters || [];
          allCases.push(...cases);

          const totalPages = data.totalPages || 1;

          if (page < totalPages) {
            fetchPage(page + 1);
          } else {
            this.processCases(allCases, this.inpatientCases);
            this.isLoading = false;
            this.isDataLoaded = true;
          }
        },
        error: (error) => {
          console.log('Error fetching IPD data:', error);
          this.isLoading = false;
        },
      });
    };

    // Start with page 1
    fetchPage(1);
  }

  /**
   * Process and organize cases data
   */
  processCases(ipdCases: any[], inpatientCases: any[]): void {
    const grouped: any = {};

    ipdCases.forEach((ward: any) => {
      const wardName = ward.ward_name;

      if (!Array.isArray(ward.room_id)) return;

      ward.room_id.forEach((room: any) => {
        const roomId = room._id;
        const roomNumber = room.roomNumber;
        const roomType = room.roomType || 'General';

        if (!Array.isArray(room.bed_id)) return;

        if (!grouped[wardName]) grouped[wardName] = {};
        if (!grouped[wardName][roomId]) {
          grouped[wardName][roomId] = {
            roomNumber,
            roomType,
            beds: [],
          };
        }

        room.bed_id.forEach((bed: any) => {
          const bedNumber = bed.bed_number;
          const bedId = bed._id;
          const isOccupied = bed.is_occupied;

          // Create bed ID to case mapping
          const bedIdToCaseMap = new Map<string, any>();

          this.inpatientCases.forEach((c: any) => {
            const bedId = c.bed_id?._id?.toString();
            if (bedId) {
              bedIdToCaseMap.set(bedId, c);
            }
          });

          const matchingCase = bedIdToCaseMap.get(bedId.toString());

          const patientName =
            isOccupied && matchingCase
              ? matchingCase.uniqueHealthIdentificationId?.patient_name
              : null;

          const patientId =
            isOccupied && matchingCase
              ? matchingCase.uniqueHealthIdentificationId?.patient_id ||
                matchingCase.uniqueHealthIdentificationId?._id
              : null;

          const admissionDate =
            isOccupied && matchingCase
              ? matchingCase.admissionDate || matchingCase.createdAt
              : null;

          console.log('Checking bed:', bedId, 'isOccupied:', isOccupied);

          if (matchingCase) {
            console.log(
              '✅ Match found for bed:',
              bedId,
              'Patient:',
              matchingCase?.uniqueHealthIdentificationId?.patient_name
            );
          } else if (isOccupied) {
            console.log('❌ No match found for occupied bed:', bedId);
          }

          grouped[wardName][roomId].beds.push({
            bedId,
            bedNumber,
            isOccupied,
            patientName,
            patientId,
            admissionDate,
            maintenance: bed.maintenance || false,
          });
        });
      });
    });

    this.occupancyRecord = Object.entries(grouped).map(
      ([ward, roomsObj]: any) => ({
        ward,
        rooms: Object.entries(roomsObj).map(([roomId, roomData]: any) => ({
          roomId,
          ...roomData,
        })),
      })
    );

    this.wards = this.occupancyRecord.map((item) => item.ward);
  }

  /**
   * Handle ward selection
   */
  onWardSelect(): void {
    const ward = this.occupancyRecord.find((w) => w.ward === this.selectedWard);
    this.rooms = ward?.rooms || [];
    this.selectedRoom = '';
    this.selectedBeds = [];
  }

  /**
   * Handle room selection
   */
  onRoomSelect(): void {
    const room = this.rooms.find((r) => r.roomId === this.selectedRoom);
    this.selectedBeds = room?.beds || [];
  }

  /**
   * Get count of occupied beds
   */
  getOccupiedCount(): number {
    return this.selectedBeds.filter(bed => bed.isOccupied).length;
  }

  /**
   * Get count of available beds
   */
  getAvailableCount(): number {
    return this.selectedBeds.filter(bed => !bed.isOccupied && !bed.maintenance).length;
  }

  /**
   * Get count of beds under maintenance
   */
  getMaintenanceCount(): number {
    return this.selectedBeds.filter(bed => bed.maintenance).length;
  }

  /**
   * Handle bed click event
   */
  onBedClick(bed: any): void {
    console.log('Bed clicked:', bed);
    // Add your bed click logic here
    // For example, show bed details modal or navigate to bed management
  }

  /**
   * Handle patient assignment to bed
   */
  assignPatient(bed: any): void {
    if (bed.isOccupied || bed.maintenance) {
      console.warn('Cannot assign patient to occupied or maintenance bed');
      return;
    }

    console.log('Assign patient to bed:', bed);
    // Add your patient assignment logic here
    // For example, open patient assignment modal

    // Example implementation:
    // this.openPatientAssignmentModal(bed);
  }

  /**
   * View patient details
   */
  viewPatientDetails(bed: any): void {
    if (!bed.isOccupied || !bed.patientId) {
      console.warn('No patient assigned to this bed');
      return;
    }

    console.log('View patient details:', bed);
    // Add your view patient details logic here
    // For example, navigate to patient details page or open modal

    // Example implementation:
    // this.router.navigate(['/patient-details', bed.patientId]);
  }

  /**
   * Handle patient discharge
   */
  dischargePatient(bed: any): void {
    if (!bed.isOccupied || !bed.patientId) {
      console.warn('No patient to discharge from this bed');
      return;
    }

    console.log('Discharge patient from bed:', bed);
    // Add your discharge logic here
    // For example, show discharge confirmation modal

    // Example implementation:
    // this.openDischargeModal(bed);
  }

  /**
   * Refresh all data
   */
  refreshData(): void {
    console.log('Refreshing data...');

    // Reset all data
    this.inpatientCases = [];
    this.wardMaster = [];
    this.occupancyRecord = [];
    this.wards = [];
    this.rooms = [];
    this.selectedWard = '';
    this.selectedRoom = '';
    this.selectedBeds = [];

    // Reload data
    this.loadInitialData();
  }

  /**
   * Export data to CSV or Excel
   */
  exportData(): void {
    console.log('Exporting data...');

    if (this.selectedBeds.length === 0) {
      console.warn('No data to export. Please select a ward and room.');
      return;
    }

    // Prepare export data
    const exportData = this.selectedBeds.map(bed => ({
      'Bed Number': bed.bedNumber,
      'Status': bed.isOccupied ? 'Occupied' : (bed.maintenance ? 'Maintenance' : 'Available'),
      'Patient Name': bed.patientName || '-',
      'Patient ID': bed.patientId || '-',
      'Admission Date': bed.admissionDate ? new Date(bed.admissionDate).toLocaleDateString() : '-',
      'Ward': this.selectedWard,
      'Room': this.rooms.find(r => r.roomId === this.selectedRoom)?.roomNumber || '-'
    }));

    // Convert to CSV
    this.downloadCSV(exportData, `bed-occupancy-${this.selectedWard}-${Date.now()}.csv`);
  }

  /**
   * Download data as CSV file
   */
  private downloadCSV(data: any[], filename: string): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header =>
        JSON.stringify(row[header] || '')
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Get current room info
   */
  getCurrentRoomInfo(): any {
    if (!this.selectedRoom) return null;

    return this.rooms.find(r => r.roomId === this.selectedRoom);
  }

  /**
   * Get bed occupancy percentage for current room
   */
  getOccupancyPercentage(): number {
    if (this.selectedBeds.length === 0) return 0;

    const occupied = this.getOccupiedCount();
    return Math.round((occupied / this.selectedBeds.length) * 100);
  }

  /**
   * Check if bed is available for assignment
   */
  isBedAvailable(bed: any): boolean {
    return !bed.isOccupied && !bed.maintenance;
  }

  /**
   * Get bed status text
   */
  getBedStatusText(bed: any): string {
    if (bed.maintenance) return 'Under Maintenance';
    if (bed.isOccupied) return 'Occupied';
    return 'Available';
  }

  /**
   * Get bed status class for styling
   */
  getBedStatusClass(bed: any): string {
    if (bed.maintenance) return 'maintenance';
    if (bed.isOccupied) return 'occupied';
    return 'available';
  }

  /**
   * Filter beds by status
   */
  filterBedsByStatus(status: 'all' | 'occupied' | 'available' | 'maintenance'): any[] {
    if (status === 'all') return this.selectedBeds;

    return this.selectedBeds.filter(bed => {
      switch (status) {
        case 'occupied':
          return bed.isOccupied;
        case 'available':
          return !bed.isOccupied && !bed.maintenance;
        case 'maintenance':
          return bed.maintenance;
        default:
          return true;
      }
    });
  }

  /**
   * Search beds by patient name or bed number
   */
  searchBeds(searchTerm: string): any[] {
    if (!searchTerm.trim()) return this.selectedBeds;

    const term = searchTerm.toLowerCase().trim();

    return this.selectedBeds.filter(bed =>
      bed.bedNumber.toLowerCase().includes(term) ||
      (bed.patientName && bed.patientName.toLowerCase().includes(term)) ||
      (bed.patientId && bed.patientId.toLowerCase().includes(term))
    );
  }

  /**
   * Get summary statistics for current selection
   */
  getSummaryStats(): any {
    const total = this.selectedBeds.length;
    const occupied = this.getOccupiedCount();
    const available = this.getAvailableCount();
    const maintenance = this.getMaintenanceCount();
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

    return {
      total,
      occupied,
      available,
      maintenance,
      occupancyRate
    };
  }
}
