import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NamespaceService, Namespace } from '../../core/services/namespace.service';

@Component({
  selector: 'app-apikeymanagment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './apikeymanagment.component.html',
  styleUrls: ['./apikeymanagment.component.css']
})
export class ApikeymanagmentComponent implements OnInit {
  namespaces: Namespace[] = [];
  loading = false;
  error: string | null = null;

  constructor(private namespaceService: NamespaceService) { }

  ngOnInit(): void {
    this.getNamespaces();
  }

  // ✅ Load namespaces from backend
  getNamespaces(): void {
    this.loading = true;
    this.error = null;

    this.namespaceService.getAllNamespaces().subscribe({
      next: (res: any) => {
        this.namespaces = res.data;  // 👈 use res.data
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load namespaces';
        console.error('Error fetching namespaces:', err);
        this.loading = false;
      }
    });
  }


  // ✅ Update Namespace
  updateNamespace(ns: Namespace): void {
    this.namespaceService.updateNamespace(ns._id!, ns).subscribe({
      next: (updated) => {
        console.log('Updated Namespace:', updated);
        alert(`Namespace "${updated.name}" updated successfully!`);
      },
      error: (err) => {
        console.error('Error updating namespace:', err);
        alert('Failed to update namespace');
      }
    });
  }

  // ✅ Delete Namespace
  deleteNamespace(id: string): void {
    return;
    this.namespaceService.deleteNamespace(id).subscribe({
      next: () => {
        this.namespaces = this.namespaces.filter(ns => ns._id !== id);
        alert('Namespace deleted successfully!');
      },
      error: (err) => {
        console.error('Error deleting namespace:', err);
        alert('Failed to delete namespace');
      }
    });
  }
}
