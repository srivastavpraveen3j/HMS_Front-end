import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { HeaderConfigService } from '../service/letterheader-config.service';
import { CommonModule } from '@angular/common';
import { LetterheaderComponent } from '../letterheader/letterheader.component';

@Component({
  selector: 'app-header-settings',
  templateUrl: './header-settings.component.html',
  styleUrls: ['./header-settings.component.css'],
  standalone: true,
  imports: [CommonModule, LetterheaderComponent, ReactiveFormsModule, FormsModule]
})
export class HeaderSettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  logoPreviewUrl: string = '';
  loading: boolean = false;

  constructor(private fb: FormBuilder, private headerService: HeaderConfigService) {}

  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      // Hospital Name
      hospitalName: [''],
      hospitalNameFontSize: ['2.4rem'],
      hospitalNameFontWeight: ['700'],
      hospitalNameFontColor: ['#8B4513'],
      hospitalNameFontFamily: ['Arial, sans-serif'],
      hospitalNameLineHeight: ['1.15'],
      // Subtitle
      hospitalSubtitle: [''],
      subtitleFontSize: ['1.1rem'],
      subtitleFontWeight: ['500'],
      subtitleFontColor: ['#8B4513'],
      subtitleFontFamily: ['Arial, sans-serif'],
      subtitleLineHeight: ['1.2'],
      // Tagline
      tagline: [''],
      taglineFontSize: ['1.08rem'],
      taglineFontWeight: ['400'],
      taglineFontColor: ['#555'],
      taglineFontFamily: ['Arial, sans-serif'],
      taglineLineHeight: ['1.2'],
      // Contact
      address: [''],
      phone: [''],
      email: [''],
      website: [''],
      contactFontSize: ['1.04rem'],
      contactFontWeight: ['400'],
      contactFontColor: ['#8B4513'],
      contactFontFamily: ['Arial, sans-serif'],
      contactLineHeight: ['1.1'],
      // Layout and logo
      logoUrl: [''],
      logoPosition: ['right'],
      headerAlign: ['center'],
      headerWidth: ['3in'],
      headerHeight: ['2in'],
      backgroundColor: ['#fff'],
      headerGap: ['28px'],
      marginTop: ['0'],
      marginBottom: ['0'],
      marginSides: ['auto'],
      logoMaxWidth: ['80px'],
      logoMaxHeight: ['80px'],
      logoBorderRadius: ['12px'],
    });

    this.headerService.config$.subscribe(config => {
      this.settingsForm.patchValue(config);
      this.logoPreviewUrl = config.logoUrl || '';
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.loading = true;
    this.headerService.uploadLogo(file).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: res => {
        this.logoPreviewUrl = res.logoUrl;
        this.settingsForm.patchValue({ logoUrl: res.logoUrl });
      },
      error: () => alert('Logo upload failed!')
    });
  }

  async saveSettings() {
  if (this.settingsForm.invalid) {
    const Swal = (await import('sweetalert2')).default;
    Swal.fire({
      icon: 'error',
      title: 'Validation Failed',
      text: 'Please fill in required fields.',
      toast: true,
      position: 'top-end',
      timer: 3200,
      showConfirmButton: false,
    });
    return;
  }
  this.loading = true;
  try {
    const resp = await firstValueFrom(
      this.headerService.updateConfig(this.settingsForm.value).pipe(finalize(() => this.loading = false))
    );
    const Swal = (await import('sweetalert2')).default;
    if (resp.success) {
      Swal.fire({
        icon: 'success',
        title: 'Settings Applied!',
        text: 'Header has been updated.',
        toast: true,
        position: 'top-end',
        timer: 2100,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Save Failed!',
        text: 'Something went wrong.',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    this.loading = false;
    const Swal = (await import('sweetalert2')).default;
    Swal.fire({
      icon: 'error',
      title: 'Save Failed',
      text: 'Failed to save settings. Please try again.',
      toast: true,
      position: 'top-end',
      timer: 3400,
      showConfirmButton: false,
    });
  }
}

  resetToDefault() {
    // You can call this.headerService.updateConfig(default values) or a reset API here
    this.headerService.forceRefreshConfig();
    // Optionally: reset logoPreviewUrl etc.
  }
}
