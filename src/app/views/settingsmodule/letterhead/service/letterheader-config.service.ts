import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../../../../enviornment/env';

export interface HeaderConfig {
  hospitalName: string;
  hospitalSubtitle: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  s3Key?: string;
  logoPosition: 'left' | 'center' | 'right';
  headerAlign: 'left' | 'center' | 'right';
  headerWidth: string;
  headerHeight: string;
  backgroundColor: string;
  fontFamily: string;
  fontSize: string;
  textColor: string;
  lineSpacing: string;
  marginTop: string;
  marginBottom: string;
  marginSides: string;
  logoMaxWidth: string;
  logoMaxHeight: string;
  logoBorderRadius: string;
  headerGap: string;
}

@Injectable({ providedIn: 'root' })
export class HeaderConfigService {
  private baseUrl = `${environment.baseurl}/header`;

  private configSubject = new BehaviorSubject<HeaderConfig>(this.defaultConfig());
  config$ = this.configSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadConfig();
  }

  private defaultConfig(): HeaderConfig {
    return {
      hospitalName: '',
      hospitalSubtitle: '',
      tagline: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      logoUrl: '',
      logoPosition: 'left',
      headerAlign: 'center',
      headerWidth: '100%',
      headerHeight: '120px',
      backgroundColor: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      textColor: '#8B4513',
      lineSpacing: '1.4',
      marginTop: '0px',
      marginBottom: '0px',
      marginSides: 'auto',
      logoMaxWidth: '120px',
      logoMaxHeight: '120px',
      logoBorderRadius: '12px',
      headerGap: '24px',
    };
  }

  loadConfig(): void {
    this.http.get<{success: boolean, config: HeaderConfig}>(`${this.baseUrl}/config`)
      .pipe(
        tap(res => { if (res?.success && res.config) this.configSubject.next(res.config); }),
        catchError(err => {
          console.error('Failed to load header config:', err);
          this.configSubject.next(this.defaultConfig());
          throw err;
        })
      ).subscribe();
  }

  updateConfig(settings: Partial<HeaderConfig>): Observable<{success: boolean, config: HeaderConfig}> {
    return this.http.put<{success: boolean, config: HeaderConfig}>(`${this.baseUrl}/config`, settings)
      .pipe(
        tap(res => { if (res?.success && res.config) this.configSubject.next(res.config); }),
        catchError(err => { throw err; })
      );
  }

  uploadLogo(file: File): Observable<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post<{ logoUrl: string }>(`${this.baseUrl}/logo`, formData)
      .pipe(
        tap(res => {
          const config = { ...this.configSubject.value, logoUrl: res.logoUrl };
          this.configSubject.next(config);
        }),
        catchError(error => { throw error; })
      );
  }

  forceRefreshConfig(): void {
    this.loadConfig();
  }
}
