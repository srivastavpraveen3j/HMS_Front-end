// logo.service.ts - S3 INTEGRATED VERSION
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../../../enviornment/env';

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

interface LogoMetaResponse {
  url: string;
  filename: string;
  updatedAt: string;
  mimetype: string;
  size: number;
  isDefault: boolean;
  s3Key?: string;
  s3Url?: string;
  shapeConfig: ShapeConfig;
}

@Injectable({
  providedIn: 'root'
})
export class LogoService {
  private apiUrl = `${environment.baseurl}/logo`;

  // Logo URL stream - now handles S3 URLs
  private logoUrlSubject = new BehaviorSubject<string>('');
  logoUrl$ = this.logoUrlSubject.asObservable();

  // Shape configuration stream
  private shapeConfigSubject = new BehaviorSubject<ShapeConfig>({
    type: 'rectangular',
    borderRadius: '0px',
    customRadius: {
      topLeft: '0px',
      topRight: '0px',
      bottomLeft: '0px',
      bottomRight: '0px'
    }
  });
  shapeConfig$ = this.shapeConfigSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load initial logo and shape config
    this.loadInitialLogoConfig();
  }

  private loadInitialLogoConfig() {
    this.getLogoMeta().subscribe({
      next: (response: LogoMetaResponse) => {
        if (response.url) {
          // For S3 URLs, we use different cache busting strategy
          const s3CacheBustedUrl = this.addS3CacheBusting(response.url);
          this.logoUrlSubject.next(s3CacheBustedUrl);
        }
        if (response.shapeConfig) {
          this.shapeConfigSubject.next(response.shapeConfig);
        }
      },
      error: (error) => {
        console.error('Failed to load initial logo config:', error);
        // Fallback to default S3 logo if available
        this.setDefaultS3Logo();
      }
    });
  }

  private addS3CacheBusting(s3Url: string): string {
    // For S3 URLs, we use version parameter for cache busting
    const separator = s3Url.includes('?') ? '&' : '?';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `${s3Url}${separator}v=${timestamp}&r=${randomString}`;
  }

  private setDefaultS3Logo() {
    // Set default S3 logo URL if main logo fails to load
    const defaultS3Url = 'https://digitalks-crm-bucket.s3.ap-south-1.amazonaws.com/HIMS/logos/default-logo.jpg';
    this.logoUrlSubject.next(this.addS3CacheBusting(defaultS3Url));
  }

  uploadLogo(file: File): Observable<{ url: string; s3Url?: string }> {
    const formData = new FormData();
    formData.append('logo', file);

    return this.http.post<{ url: string; s3Url?: string }>(this.apiUrl, formData).pipe(
      tap(res => {
        // Use s3Url if available, otherwise fall back to url
        const logoUrl = res.s3Url || res.url;
        const s3CacheBustedUrl = this.addS3CacheBusting(logoUrl);
        this.logoUrlSubject.next(s3CacheBustedUrl);
      }),
      catchError((error) => {
        console.error('Logo upload failed:', error);
        throw error;
      })
    );
  }

  getLogoMeta(): Observable<LogoMetaResponse> {
    const apiUrl = `${this.apiUrl}/meta?cb=${Date.now()}`;
    return this.http.get<LogoMetaResponse>(apiUrl).pipe(
      tap(res => {
        if (res.url) {
          const s3CacheBustedUrl = this.addS3CacheBusting(res.url);
          this.logoUrlSubject.next(s3CacheBustedUrl);
        }
        if (res.shapeConfig) {
          this.shapeConfigSubject.next(res.shapeConfig);
        }
      }),
      catchError((error) => {
        console.error('Failed to get logo meta:', error);
        // Return default values if API fails
        return new Observable<LogoMetaResponse>(observer => {
          observer.next({
            url: 'https://digitalks-crm-bucket.s3.ap-south-1.amazonaws.com/HIMS/logos/default-logo.jpg',
            filename: 'default-logo.jpg',
            updatedAt: new Date().toISOString(),
            mimetype: 'image/jpeg',
            size: 0,
            isDefault: true,
            shapeConfig: this.getCurrentShapeConfig()
          });
          observer.complete();
        });
      })
    );
  }

  uploadLogoWithShape(file: File, shapeConfig: ShapeConfig): Observable<any> {
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('shapeConfig', JSON.stringify(shapeConfig));

    return this.http.post(`${this.apiUrl}`, formData).pipe(
      tap((response: any) => {
        if (response.url || response.s3Url) {
          // Prefer S3 URL if available
          const logoUrl = response.s3Url || response.url;
          const s3CacheBustedUrl = this.addS3CacheBusting(logoUrl);
          this.logoUrlSubject.next(s3CacheBustedUrl);
        }
        if (response.shapeConfig) {
          this.shapeConfigSubject.next(response.shapeConfig);
        }
      }),
      catchError((error) => {
        console.error('Logo upload with shape failed:', error);
        throw error;
      })
    );
  }

  // KEY METHOD: Update shape and notify all subscribers
  updateLogoShape(shapeConfig: ShapeConfig): Observable<any> {
    return this.http.patch(`${this.apiUrl}/shape`, { shapeConfig }).pipe(
      tap((response: any) => {
        if (response.shapeConfig) {
          // Immediately update the shape config stream
          this.shapeConfigSubject.next(response.shapeConfig);
        }
        // If the response includes an updated S3 URL, update that too
        if (response.s3Url || response.url) {
          const logoUrl = response.s3Url || response.url;
          const s3CacheBustedUrl = this.addS3CacheBusting(logoUrl);
          this.logoUrlSubject.next(s3CacheBustedUrl);
        }
      }),
      catchError((error) => {
        console.error('Failed to update logo shape:', error);
        throw error;
      })
    );
  }

  resetToDefault(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reset`).pipe(
      tap((response: any) => {
        if (response.url) {
          const s3CacheBustedUrl = this.addS3CacheBusting(response.url);
          this.logoUrlSubject.next(s3CacheBustedUrl);
        }
        if (response.shapeConfig) {
          this.shapeConfigSubject.next(response.shapeConfig);
        }
      }),
      catchError((error) => {
        console.error('Failed to reset logo:', error);
        // Fallback to default S3 logo
        this.setDefaultS3Logo();
        throw error;
      })
    );
  }

  forceRefreshLogo(): void {
    this.getLogoMeta().subscribe({
      error: (err) => {
        console.error('Failed to refresh logo:', err);
        // Try to set default logo on error
        this.setDefaultS3Logo();
      }
    });
  }

  // Enhanced getter methods for current values
  getCurrentLogoUrl(): string {
    return this.logoUrlSubject.value;
  }

  getCurrentShapeConfig(): ShapeConfig {
    return this.shapeConfigSubject.value;
  }

  // Helper method to check if current logo is from S3
  isS3Logo(): boolean {
    const currentUrl = this.getCurrentLogoUrl();
    return currentUrl.includes('s3.') || currentUrl.includes('amazonaws.com');
  }

  // Helper method to get clean S3 URL without cache busting parameters
  getCleanS3Url(): string {
    const currentUrl = this.getCurrentLogoUrl();
    if (currentUrl.includes('?')) {
      return currentUrl.split('?')[0];
    }
    return currentUrl;
  }

  // Method to preload logo for better UX
  preloadLogo(): Promise<boolean> {
    return new Promise((resolve) => {
      const currentUrl = this.getCurrentLogoUrl();
      if (!currentUrl) {
        resolve(false);
        return;
      }

      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => {
        console.warn('Failed to preload logo, trying default');
        this.setDefaultS3Logo();
        resolve(false);
      };
      img.src = currentUrl;
    });
  }

  // Method to get logo loading state
  private logoLoadingSubject = new BehaviorSubject<boolean>(false);
  logoLoading$ = this.logoLoadingSubject.asObservable();

  setLogoLoading(loading: boolean): void {
    this.logoLoadingSubject.next(loading);
  }

  // Advanced cache busting for S3 with metadata
  private addAdvancedS3CacheBusting(s3Url: string, metadata?: any): string {
    const separator = s3Url.includes('?') ? '&' : '?';
    const timestamp = Date.now();
    let params = `v=${timestamp}&r=${Math.random().toString(36).substring(2, 15)}`;

    // Add metadata-based versioning if available
    if (metadata?.lastModified) {
      params += `&lm=${new Date(metadata.lastModified).getTime()}`;
    }

    return `${s3Url}${separator}${params}`;
  }
}
