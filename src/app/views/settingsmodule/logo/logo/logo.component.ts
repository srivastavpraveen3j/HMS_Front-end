// logo.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LogoService } from '../logo.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, firstValueFrom, forkJoin, Subscription } from 'rxjs';

export interface ShapeConfig {
  type: 'rectangular' | 'rounded' | 'circular' | 'custom';
  borderRadius: string;
  customRadius: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
}

@Component({
  selector: 'app-logo',
  imports: [CommonModule, FormsModule],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.css'
})
export class LogoComponent implements OnInit, OnDestroy {
  logoUrl!: string;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  private logoSubscription?: Subscription;

  // File validation properties
  fileValidationMessage: string = '';
  fileValidationError: boolean = false;
  fileValidationClass: string = '';
  validationIcon: string = '';

  // File size limits (in bytes)
  readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  readonly RECOMMENDED_MAX_SIZE = 500 * 1024; // 500KB
  readonly ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

  // Shape configuration
  shapeConfig: ShapeConfig = {
    type: 'rectangular',
    borderRadius: '0px',
    customRadius: {
      topLeft: '0px',
      topRight: '0px',
      bottomLeft: '0px',
      bottomRight: '0px'
    }
  };

  showShapeControls = false;
  customRadiusValues = {
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0
  };

  constructor(
    private logoService: LogoService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.logoSubscription = this.logoService.logoUrl$.subscribe(url => {
      if (url) {
        this.logoUrl = url;
      }
    });
    this.loadCurrentLogo();
  }

  ngOnDestroy() {
    if (this.logoSubscription) {
      this.logoSubscription.unsubscribe();
    }
  }

  private loadCurrentLogo() {
    this.logoService.getLogoMeta().subscribe({
      next: (response: any) => {
        if (response.shapeConfig) {
          this.shapeConfig = response.shapeConfig;
          this.updateCustomRadiusValues();
        }
      },
      error: (error) => {
        console.error('Failed to load logo:', error);
      }
    });
  }

  // Enhanced file selection with validation
  onFileSelected(event: any) {
    const file = event.target.files[0];

    // Reset validation state
    this.resetValidation();

    if (!file) {
      this.selectedFile = null;
      this.previewUrl = null;
      return;
    }

    // Validate file
    const validation = this.validateFile(file);

    if (!validation.isValid) {
      this.showValidationError(validation.message);
      this.selectedFile = null;
      this.previewUrl = null;
      // Clear the input
      event.target.value = '';
      return;
    }

    // File is valid
    this.selectedFile = file;
    this.showValidationSuccess(validation.message);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }

  // File validation logic
  private validateFile(file: File): { isValid: boolean; message: string } {
    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        message: `❌ Invalid file type. Please select PNG, JPG, JPEG, or SVG files only.`
      };
    }

    // Check file size - Hard limit
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        message: `❌ File size ${this.getFormattedFileSize(file.size)} exceeds maximum limit of 2MB. Please compress or choose a smaller image.`
      };
    }

    // Check file size - Recommendation
    if (file.size > this.RECOMMENDED_MAX_SIZE) {
      return {
        isValid: true,
        message: `⚠️ File size ${this.getFormattedFileSize(file.size)} is larger than recommended (500KB). Consider compressing for better performance.`
      };
    }

    // File is optimal
    return {
      isValid: true,
      message: `✅ Perfect! File size ${this.getFormattedFileSize(file.size)} is optimal for web use.`
    };
  }

  // Format file size for display
  getFormattedFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Validation UI helpers
  private resetValidation() {
    this.fileValidationMessage = '';
    this.fileValidationError = false;
    this.fileValidationClass = '';
    this.validationIcon = '';
  }

  private showValidationError(message: string) {
    this.fileValidationMessage = message;
    this.fileValidationError = true;
    this.fileValidationClass = 'error';
    this.validationIcon = 'fas fa-exclamation-circle';
  }

  private showValidationSuccess(message: string) {
    this.fileValidationMessage = message;
    this.fileValidationError = false;

    if (message.includes('⚠️')) {
      this.fileValidationClass = 'warning';
      this.validationIcon = 'fas fa-exclamation-triangle';
    } else {
      this.fileValidationClass = 'success';
      this.validationIcon = 'fas fa-check-circle';
    }
  }

  onShapeTypeChange(shapeType: string) {
    this.shapeConfig.type = shapeType as any;

    switch (shapeType) {
      case 'rectangular':
        this.shapeConfig.borderRadius = '0px';
        break;
      case 'rounded':
        this.shapeConfig.borderRadius = '12px';
        break;
      case 'circular':
        this.shapeConfig.borderRadius = '50%';
        break;
      case 'custom':
        this.showShapeControls = true;
        this.updateCustomBorderRadius();
        break;
      default:
        this.showShapeControls = false;
    }

    if (shapeType !== 'custom') {
      this.showShapeControls = false;
    }
  }

  onCustomRadiusChange() {
    this.updateCustomBorderRadius();
  }

  private updateCustomBorderRadius() {
    const { topLeft, topRight, bottomLeft, bottomRight } = this.customRadiusValues;
    this.shapeConfig.customRadius = {
      topLeft: `${topLeft}px`,
      topRight: `${topRight}px`,
      bottomLeft: `${bottomLeft}px`,
      bottomRight: `${bottomRight}px`
    };

    this.shapeConfig.borderRadius = `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`;
  }

  private updateCustomRadiusValues() {
    if (this.shapeConfig.type === 'custom') {
      this.customRadiusValues = {
        topLeft: parseInt(this.shapeConfig.customRadius.topLeft) || 0,
        topRight: parseInt(this.shapeConfig.customRadius.topRight) || 0,
        bottomLeft: parseInt(this.shapeConfig.customRadius.bottomLeft) || 0,
        bottomRight: parseInt(this.shapeConfig.customRadius.bottomRight) || 0
      };
      this.showShapeControls = true;
    }
  }

  getLogoStyle() {
    return {
      'border-radius': this.shapeConfig.borderRadius,
      'width': '100%',
      'height': 'auto',
      'transition': 'border-radius 0.3s ease'
    };
  }

  async uploadLogo() {
    if (!this.selectedFile || this.fileValidationError) {
      const Swal = (await import('sweetalert2')).default;
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Please select a valid file before uploading.',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      const uploadResponse = await firstValueFrom(
        this.logoService.uploadLogoWithShape(this.selectedFile, this.shapeConfig)
      );

      this.previewUrl = null;
      this.selectedFile = null;
      this.resetValidation();

      setTimeout(() => {
        this.logoService.forceRefreshLogo();
      }, 500);

      const Swal = (await import('sweetalert2')).default;
      Swal.fire({
        icon: 'success',
        title: 'Logo Uploaded',
        text: 'Your logo with custom shape has been uploaded successfully!',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false,
      });

      this.router.navigateByUrl('/dashboard');
    } catch (error: any) {
      console.error("Logo upload failed:", error);

      const Swal = (await import('sweetalert2')).default;
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Failed to upload logo. Please try again.',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false,
      });
    }
  }

  async updateShapeOnly() {
    try {
      console.log('Updating shape:', this.shapeConfig);

      await firstValueFrom(
        this.logoService.updateLogoShape(this.shapeConfig)
      );

      const Swal = (await import('sweetalert2')).default;
      Swal.fire({
        icon: 'success',
        title: 'Shape Updated',
        text: 'Logo shape has been updated successfully!',
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        console.log('Shape update completed');
      }, 100);

    } catch (error) {
      console.error('Failed to update shape:', error);

      const Swal = (await import('sweetalert2')).default;
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update logo shape. Please try again.',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false,
      });
    }
  }

  onImageError() {
    console.error('Failed to load logo image, retrying...');
    setTimeout(() => {
      this.loadCurrentLogo();
    }, 1000);
  }

  onImageLoad() {
    console.log('Logo image loaded successfully');
  }
}
