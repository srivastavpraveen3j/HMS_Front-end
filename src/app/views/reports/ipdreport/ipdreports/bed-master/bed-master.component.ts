import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterService } from '../../../../mastermodule/masterservice/master.service';
import { IpdService } from '../../../../ipdmodule/ipdservice/ipd.service';
import { LoaderComponent } from "../../../../loader/loader.component";

@Component({
  selector: 'app-bed-master',
  imports: [CommonModule, FormsModule],
  templateUrl: './bed-master.component.html',
  styleUrl: './bed-master.component.css',
})
export class BedMasterComponent {
  title: string = '';
  ipdCases: any[] = [];
  allBeds: any[] = [];
  patientBedRecord: any[] = [];
  wards: any[] = [];
  occupiedBedsMap: Map<string, Date> = new Map();
  patientNameMap: Map<string, string> = new Map();

  selectedFilter: 'today' | 'week' | 'month' | 'year' = 'today';
  activeTab: 'Available' | 'Occupied' = 'Available';
  @ViewChild('pdfContent') pdfContent!: ElementRef;

  constructor(
    private ipdService: IpdService,
    private masterService: MasterService
  ) {}

  ngOnInit(): void {
     this.getIPDcases().then(() => {
       this.getRoomOccupancy(); // ==> Now runs AFTER IPD cases & patient names fully loaded
     });
  }

  getIPDcases(): Promise<void> {
    return new Promise((resolve, reject) => {
      const allCases: any[] = [];

      const fetchPage = (page: number) => {
        this.ipdService.getIPDcase(page).subscribe({
          next: (data) => {
            const cases = data.data?.inpatientCases || [];
            allCases.push(...cases);

            const totalPages = data.data?.totalPages || 1;

            if (page < totalPages) {
              fetchPage(page + 1);
            } else {
              this.ipdCases = allCases;
              console.log("ipd data",this.ipdCases);
              this.occupiedBedsMap = new Map();
              this.patientNameMap = new Map();

              this.ipdCases.forEach((ipd) => {
                if(ipd.isDischarge === false){
                  const bedId = ipd.bed_id?._id || ipd.bed_id;

                  if (bedId) {
                    this.occupiedBedsMap.set(bedId, new Date(ipd.createdAt));

                    const patientName =
                      ipd.uniqueHealthIdentificationId?.patient_name?.trim() ||
                      'N/A';

                      console.log(patientName);

                    this.patientNameMap.set(bedId, patientName);
                  }
                }

              });

              resolve(); // ✅ Done loading IPD cases
            }
          },
          error: (err) => {
            console.error('Error fetching IPD cases:', err);
            reject(err);
          },
        });
      };

      fetchPage(1);
    });
  }

  getRoomOccupancy() {
    const allCases: any[] = [];

    const fetchPage = (page: number) => {
      this.masterService.getWardmasterUrl(page).subscribe({
        next: (data) => {
          console.log("ward",data);
          allCases.push(...(data.wardMasters || []));
          const totalPages = data.totalPages || 1;

          if (page < totalPages) {
            fetchPage(page + 1);
          } else {
            this.processCases(allCases);
          }
        },
        error: (err) => console.error('Error fetching IPD data:', err),
      });
    };

    fetchPage(1);
  }

  processCases(ipdCases: any[]) {
    const grouped: any = {};
    this.allBeds = [];

    ipdCases.forEach((ward: any) => {
      const wardName = ward.ward_name;
      if (!Array.isArray(ward.room_id)) return;

      ward.room_id.forEach((room: any) => {
        const roomId = room._id;
        const roomNumber = room.roomNumber;
        if (!Array.isArray(room.bed_id)) return;

        if (!grouped[wardName]) grouped[wardName] = {};
        if (!grouped[wardName][roomId]) {
          grouped[wardName][roomId] = {
            roomNumber,
            beds: [],
          };
        }

        room.bed_id.forEach((bed: any) => {
          const bedInfo = {
            bedId: bed._id,
            bedNumber: bed.bed_number,
            isOccupied: bed.is_occupied,
            ward: wardName,
            roomId,
            roomNumber,
            room_type_id: room.room_type_id,
            bed_type_id: bed.bed_type_id,
            patientName: this.patientNameMap.get(bed._id),
          };

          grouped[wardName][roomId].beds.push(bedInfo);
          this.allBeds.push(bedInfo);
          // console.log('grouped', grouped);
        });
      });
    });

    this.patientBedRecord = Object.entries(grouped).map(
      ([ward, roomsObj]: any) => ({
        ward,
        rooms: Object.entries(roomsObj).map(([roomId, roomData]: any) => ({
          roomId,
          ...roomData,
        })),
      })
    );

    console.log('bed record', this.patientBedRecord);

    this.wards = this.patientBedRecord.map((item) => item.ward);
  }

  setFilter(type: 'today' | 'week' | 'month' | 'year') {
    this.selectedFilter = type;
  }

  // get filteredPatients() {
  //   const now = new Date();

  //   return this.allBeds.filter((bed: any) => {
  //     const isOccupied = bed.isOccupied === true;
  //     const isTabMatch =
  //       this.activeTab === 'Occupied' ? isOccupied : !isOccupied;

  //     if (!isTabMatch) return false;

  //     if (isOccupied) {
  //       const createdDate = this.occupiedBedsMap.get(bed.bedId);
  //       if (!createdDate) return false;

  //       switch (this.selectedFilter) {
  //         case 'today':
  //           return (
  //             createdDate.getDate() === now.getDate() &&
  //             createdDate.getMonth() === now.getMonth() &&
  //             createdDate.getFullYear() === now.getFullYear()
  //           );
  //         case 'week': {
  //           const startOfWeek = new Date(now);
  //           startOfWeek.setDate(now.getDate() - now.getDay());
  //           startOfWeek.setHours(0, 0, 0, 0);
  //           const endOfWeek = new Date(startOfWeek);
  //           endOfWeek.setDate(endOfWeek.getDate() + 6);
  //           return createdDate >= startOfWeek && createdDate <= endOfWeek;
  //         }
  //         case 'month':
  //           return (
  //             createdDate.getMonth() === now.getMonth() &&
  //             createdDate.getFullYear() === now.getFullYear()
  //           );
  //         case 'year':
  //           return createdDate.getFullYear() === now.getFullYear();
  //       }
  //     }

  //     return true;
  //   });
  // }

  get filteredPatients() {
    const now = new Date();

    // console.log('all beds', this.allBeds);
    return this.allBeds.filter((bed: any) => {
      const isOccupied = bed.isOccupied === true;
      const isTabMatch =
        this.activeTab === 'Occupied' ? isOccupied : !isOccupied;

      if (!isTabMatch) return false;

      // ==> If occupied, always include (not yet discharged)
      if (isOccupied) {
        return true;
      }

      // ==> for available beds, filter by discharge
      const createdDate = this.occupiedBedsMap.get(bed.bedId);
      if (!createdDate) return true;

      switch (this.selectedFilter) {
        case 'today':
          return (
            createdDate.getDate() === now.getDate() &&
            createdDate.getMonth() === now.getMonth() &&
            createdDate.getFullYear() === now.getFullYear()
          );
        case 'week': {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(endOfWeek.getDate() + 6);
          return createdDate >= startOfWeek && createdDate <= endOfWeek;
        }
        case 'month':
          return (
            createdDate.getMonth() === now.getMonth() &&
            createdDate.getFullYear() === now.getFullYear()
          );
        case 'year':
          return createdDate.getFullYear() === now.getFullYear();
      }

      return true;
    });
  }

  setActiveTab(tab: 'Available' | 'Occupied') {
    this.activeTab = tab;
  }

  getBedCount(type: 'Occupied' | 'Available'): number {
    return this.allBeds.filter(
      (bed) =>
        (type === 'Occupied' && bed.isOccupied) ||
        (type === 'Available' && !bed.isOccupied)
    ).length;
  }

  async downloadPDF() {
    const element = this.pdfContent.nativeElement;

    const elementsToHide = document.querySelectorAll(
      '.no-print, .d-print-none, .filter-tabs'
    );
    elementsToHide.forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });

    const html2canvas = (await import('html2canvas')).default;
    const { default: jsPDF } = await import('jspdf');

    setTimeout(async () => {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let position = 0;

      if (imgHeight < pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        let heightLeft = imgHeight;

        while (heightLeft > 0) {
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          position -= pageHeight;
          if (heightLeft > 0) pdf.addPage();
        }
      }

      pdf.save('Bed_Report.pdf');
      elementsToHide.forEach((el) => {
        (el as HTMLElement).style.display = '';
      });
    }, 100);
  }
}
