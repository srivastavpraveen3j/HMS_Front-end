import { ServiceGroupService } from './../../core/services/service-group.service';
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-service-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-search.component.html',
  styleUrls: ['./service-search.component.css']
})
export class ServiceSelectorComponent implements OnInit, OnChanges {

  constructor(private serviceGroupService: ServiceGroupService) { }

  @Input() groups: any[] = [];
  @Input() prefilledServices: any[] = []; // <-- old bill services
  @Output() servicesSelected = new EventEmitter<any[]>();

  serviceGroups: any[] = [];
  selectedGroup: any = null;
  selectedServices: any[] = [];
  searchTerm: string = '';
  page: number = 1;
  limit: number = 10;
  search: string = '';
  loading: boolean = false;

  ngOnInit(): void {
    this.loadServiceGroups();

    if (this.prefilledServices?.length) {
      this.prefilledServices.forEach((service: any) => {
        const exists = this.selectedServices.some(s => s._id === service._id);
        if (!exists) {
          this.selectedServices.push({
            ...service,
            isBilled: true // ensure old services are marked as billed
          });
        }
      });
      this.servicesSelected.emit(this.selectedServices);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const prefilled = changes['prefilledServices'];
    if (prefilled && prefilled.currentValue) {
      prefilled.currentValue.forEach((service: any) => {
        const exists = this.selectedServices.some(s => s._id === service._id);
        if (!exists) {
          this.selectedServices.push({
            ...service,
            isBilled: true // mark only if new
          });
        }
      });
      this.servicesSelected.emit(this.selectedServices);
    }
  }

  // Load groups from API
  loadServiceGroups() {
    this.loading = true;
    this.serviceGroupService.getServiceGroup(this.page, this.limit, this.search)
      .subscribe({
        next: (res) => {
          this.serviceGroups = res.groups || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching service groups', err);
          this.loading = false;
        }
      });
  }

  // Click on a group
  selectGroup(group: any) {
    this.selectedGroup = group;
    this.searchTerm = '';
  }

  // Add a service
  addService(service: any) {
    if (!this.selectedServices.find(s => s._id === service._id)) {
      this.selectedServices.push({ ...service });
      this.servicesSelected.emit(this.selectedServices);
    }
  }

  // Remove a service
  removeService(service: any) {
    this.selectedServices = this.selectedServices.filter(s => s._id !== service._id);
    this.servicesSelected.emit(this.selectedServices);
  }

  // Filter services by searchTerm
  get filteredServices() {
    if (!this.selectedGroup) return [];
    if (!this.searchTerm.trim()) return this.selectedGroup.services || [];
    return (this.selectedGroup.services || []).filter((s: any) =>
      s.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Optional: trackBy for *ngFor
  trackById(index: number, item: any) {
    return item._id;
  }
}
