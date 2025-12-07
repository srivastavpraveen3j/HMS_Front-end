import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged, combineLatest, startWith } from 'rxjs';
import { IndianCurrencyPipe } from '../../../../pipe/indian-currency.pipe';

@Component({
  selector: 'app-opdmastercharge',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule, IndianCurrencyPipe],
  templateUrl: './opdmastercharge.component.html',
  styleUrl: './opdmastercharge.component.css',
})
export class OpdmasterchargeComponent {
  servicegroup: FormGroup;
  servicegroupId: string | null = null;
  editMode: boolean = false;
  service: any[] = [];
  selectedServices: any[] = [];
  userPermissions: any = {};

  // Service search and pagination
  ServiceSearchControl = new FormControl('');
  serviceTypeFilter = new FormControl('all'); // Initialize with 'all'
  filteredservcies: any[] = [];
  allServices: any[] = [];
  ServicePage = 1;
  Servcielimit = 50;
  totalServices = 0;
  isLoading = false;

  // Multi-select functionality
  focusedRowIndex = -1;
  lastSelectedIndex = -1;
  shiftStartIndex = -1;

  // Service types available (matching your schema)
  serviceTypes = [
    { value: 'all', label: 'All' },
    { value: 'opd', label: 'OPD' },
    { value: 'ipd', label: 'IPD' },
    { value: 'radiology', label: 'Radiology' }
  ];

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.servicegroup = this.fb.group({
      group_name: ['', Validators.required],
      type: ['', Validators.required],
      services: [[], Validators.required],
    });
  }

  ngOnInit(): void {
    // Load permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'serviceGroup'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // Check for edit mode
    this.route.queryParams.subscribe((params) => {
      const servicegroupId = params['_id'];
      if (servicegroupId) {
        this.editMode = true;
        this.servicegroupId = servicegroupId;
        this.loadservicegroup(servicegroupId);
      } else {
        this.editMode = false;
      }
    });

    // Setup combined search and filter functionality with proper initialization
    combineLatest([
      this.ServiceSearchControl.valueChanges.pipe(
        startWith(''), // Start with empty string
        debounceTime(300),
        distinctUntilChanged()
      ),
      this.serviceTypeFilter.valueChanges.pipe(
        startWith('all') // Start with 'all'
      )
    ]).subscribe(([searchQuery, typeFilter]) => {
      console.log('Filter changed:', { searchQuery, typeFilter }); // Debug log
      this.ServicePage = 1;
      this.loadAndFilterServices(searchQuery || '', typeFilter || 'all');
    });

    // Don't load initial services here - let the combineLatest handle it
  }

  loadAndFilterServices(searchQuery: string, typeFilter: string): void {
    this.isLoading = true;

    console.log('Loading services with:', {
      page: this.ServicePage,
      limit: this.Servcielimit,
      search: searchQuery,
      type: typeFilter
    }); // Debug log

    // Fix: Use correct method name (single 's')
    this.masterService
      .getServices(this.ServicePage, this.Servcielimit, searchQuery.trim(), typeFilter === 'all' ? '' : typeFilter)
      .subscribe({
        next: (res: any) => {
          console.log('API Response:', res); // Debug log
          this.filteredservcies = res.services || res.data || [];
          this.totalServices = res.total || 0;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading services:', err);
          this.isLoading = false;
          this.filteredservcies = [];
        }
      });
  }

  // Rest of your methods remain the same...
  onTableKeyDown(event: KeyboardEvent, service?: any, index?: number): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (service) {
        this.toggleServiceSelection(service, null, false);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (this.focusedRowIndex > 0) {
          this.focusedRowIndex--;
          if (event.shiftKey) {
            this.selectRange(this.shiftStartIndex, this.focusedRowIndex);
          }
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (this.focusedRowIndex < this.filteredservcies.length - 1) {
          this.focusedRowIndex++;
          if (event.shiftKey) {
            this.selectRange(this.shiftStartIndex, this.focusedRowIndex);
          }
        }
        break;
      case ' ':
        event.preventDefault();
        if (this.filteredservcies[this.focusedRowIndex]) {
          this.toggleServiceSelection(this.filteredservcies[this.focusedRowIndex], null, false);
        }
        break;
    }
  }

  onRowClick(service: any, index: number, event: MouseEvent): void {
    event.preventDefault();
    this.focusedRowIndex = index;

    if (event.ctrlKey || event.metaKey) {
      this.toggleServiceSelection(service, null, false);
      this.lastSelectedIndex = index;
    } else if (event.shiftKey && this.lastSelectedIndex !== -1) {
      this.selectRange(this.lastSelectedIndex, index);
    } else {
      this.selectedServices = [service];
      this.updateServiceIdsInForm();
      this.lastSelectedIndex = index;
    }
  }

  selectRange(startIndex: number, endIndex: number): void {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);

    const rangeServices = this.filteredservcies.slice(start, end + 1);

    rangeServices.forEach(service => {
      if (!this.isServiceSelected(service)) {
        this.selectedServices.push(service);
      }
    });

    this.updateServiceIdsInForm();
  }

  toggleServiceSelection(service: any, event: any, updateLastIndex = true): void {
    if (event) {
      event.stopPropagation();
    }

    const index = this.selectedServices.findIndex(s => s._id === service._id);
    if (index > -1) {
      this.selectedServices.splice(index, 1);
    } else {
      this.selectedServices.push(service);
    }

    if (updateLastIndex) {
      this.lastSelectedIndex = this.filteredservcies.findIndex(s => s._id === service._id);
      this.shiftStartIndex = this.lastSelectedIndex;
    }

    this.updateServiceIdsInForm();
  }

  toggleAllServices(event: any): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.areAllServicesSelected()) {
      this.filteredservcies.forEach(service => {
        const index = this.selectedServices.findIndex(s => s._id === service._id);
        if (index > -1) {
          this.selectedServices.splice(index, 1);
        }
      });
    } else {
      this.filteredservcies.forEach(service => {
        if (!this.isServiceSelected(service)) {
          this.selectedServices.push(service);
        }
      });
    }
    this.updateServiceIdsInForm();
  }

  areAllServicesSelected(): boolean {
    if (this.filteredservcies.length === 0) return false;
    return this.filteredservcies.every(service => this.isServiceSelected(service));
  }

  areSomeServicesSelected(): boolean {
    return this.filteredservcies.some(service => this.isServiceSelected(service)) &&
           !this.areAllServicesSelected();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.ServicePage = page;
      const currentQuery = this.ServiceSearchControl.value || '';
      const currentType = this.serviceTypeFilter.value || 'all';
      this.loadAndFilterServices(currentQuery, currentType);
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalServices / this.Servcielimit);
  }

  loadservicegroup(servicegroupId: string): void {
    this.masterService.getServiceGroup().subscribe((res: any) => {
      const group = res.groups.find((g: any) => g._id === servicegroupId);

      if (group) {
        const groupServiceIds = group.services.map((s: any) => s._id);
        this.selectedServices = group.services.filter((s: any) =>
          groupServiceIds.includes(s._id)
        );

        this.servicegroup.patchValue({
          group_name: group.group_name,
          type: group.type,
          services: this.selectedServices.map((s) => s._id),
        });
      } else {
        console.error('Service group not found');
      }
    });
  }

  onSubmit(): void {
    if (this.servicegroup.invalid) {
      this.servicegroup.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill in all required fields before submitting.',
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
      return;
    }

    const formData = {
      ...this.servicegroup.value,
      services: this.selectedServices.map((s) => s._id),
    };

    if (this.editMode && this.servicegroupId) {
      this.masterService
        .updateServiceGroup(this.servicegroupId, formData)
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Service Group Updated',
              text: 'Service Group has been updated successfully.',
              position: 'top-end',
              toast: true,
              timer: 3000,
              showConfirmButton: false,
              customClass: {
                popup: 'hospital-toast-popup',
                title: 'hospital-toast-title',
                htmlContainer: 'hospital-toast-text',
              },
            });

            this.servicegroup.reset();
            this.router.navigateByUrl('/master/masteropdchargelist');
          },
          error: (err) => {
            console.error('Error updating Service Group:', err);
            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text: err?.error?.message || 'Something went wrong while updating the Service Group.',
              customClass: {
                popup: 'hospital-swal-popup',
                title: 'hospital-swal-title',
                htmlContainer: 'hospital-swal-text',
                confirmButton: 'hospital-swal-button',
              },
            });
          },
        });
    } else {
      this.masterService.postServiceGroup(formData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Service Group Created',
            text: 'New Service Group has been added successfully.',
            position: 'top-end',
            toast: true,
            timer: 3000,
            showConfirmButton: false,
            customClass: {
              popup: 'hospital-toast-popup',
              title: 'hospital-toast-title',
              htmlContainer: 'hospital-toast-text',
            },
          });

          this.servicegroup.reset();
          this.router.navigateByUrl('/master/masteropdchargelist');
        },
        error: (err) => {
          console.error('Error creating Service Group:', err);
          Swal.fire({
            icon: 'error',
            title: 'Creation Failed',
            text: err?.error?.message || 'Something went wrong while creating the Service Group.',
            customClass: {
              popup: 'hospital-swal-popup',
              title: 'hospital-swal-title',
              htmlContainer: 'hospital-swal-text',
              confirmButton: 'hospital-swal-button',
            },
          });
        },
      });
    }
  }

  removeService(service: any): void {
    this.selectedServices = this.selectedServices.filter(
      (s) => s._id !== service._id
    );
    this.updateServiceIdsInForm();
  }

  isServiceSelected(service: any): boolean {
    return this.selectedServices.some((s) => s._id === service._id);
  }

  updateServiceIdsInForm(): void {
    this.servicegroup.patchValue({
      services: this.selectedServices.map((s) => s._id),
    });
  }
}
