import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { InventoryitemService } from '../service/inventoryitem.service';
import { MasterService } from '../../../../views/mastermodule/masterservice/master.service';
import { MaterialrequestService } from '../../purchaserequest/service/materialrequest.service';
@Component({
  selector: 'app-inventory-lowstock',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-lowstock.component.html',
  styleUrl: './inventory-lowstock.component.css'
})
export class InventoryLowstockComponent {
    lowStockItems: any[] = [];
  selectedItems: any[] = [];

  constructor(private masterService: MasterService, private materialservice: MaterialrequestService) {}

  ngOnInit(): void {
    this.loadLowStockItems();
  }

  loadLowStockItems(): void {
    this.masterService.getlowstockmedicine().subscribe({
      next: (response) => {
        this.lowStockItems = response.data.medicines || []; // Note: using response.data.medicines based on your controller
        console.log("Low stock items loaded:", this.lowStockItems);
      },
      error: (error) => {
        console.error('Error loading low stock items:', error);
      }
    });
  }





  getSuggestedQuantity(item: any): number {
    return Math.max(50, (item.lowStockThreshold || 15) * 2);
  }

 generateMaterialRequests(): void {
  if (this.selectedItems.length === 0) {
    Swal.fire('No Items Selected', 'Please select items to generate material requests.', 'warning');
    return;
  }

  Swal.fire({
    title: 'Generate Material Requests',
    text: `Generate material requests for ${this.selectedItems.length} low stock items?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Generate'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: 'Processing...',
        text: 'Creating material requests',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.materialservice.createMaterialRequestFromLowStock(this.selectedItems).subscribe({
        next: (response) => {
          Swal.fire('Success', `${response.data?.length || this.selectedItems.length} material requests generated successfully!`, 'success');
          this.selectedItems = [];
          this.loadLowStockItems();
        },
        error: (error) => {
          console.error('Error creating material requests:', error);
          const errorMessage = error.error?.message || 'Failed to generate material requests';
          Swal.fire('Error', errorMessage, 'error');
        }
      });
    }
  });
}



  getSelectableItems(): any[] {
    return this.lowStockItems.filter(item => item.canSelect);
  }

  onItemSelect(item: any, checked: boolean): void {
    // Only allow selection if item can be selected
    if (!item.canSelect) return;

    if (checked) {
      if (!this.selectedItems.find(i => i._id === item._id)) {
        this.selectedItems.push(item);
      }
    } else {
      this.selectedItems = this.selectedItems.filter(i => i._id !== item._id);
    }
  }

  selectAll(checked: boolean): void {
    const selectableItems = this.getSelectableItems();

    if (checked) {
      this.selectedItems = [...selectableItems];
    } else {
      this.selectedItems = [];
    }
  }

  isAllSelected(): boolean {
    const selectableItems = this.getSelectableItems();
    return this.selectedItems.length === selectableItems.length && selectableItems.length > 0;
  }

  isItemSelected(item: any): boolean {
    return this.selectedItems.some(selected => selected._id === item._id);
  }

  // Update the generate button to show count of selectable items
  getSelectableCount(): number {
    return this.getSelectableItems().length;
  }

}
