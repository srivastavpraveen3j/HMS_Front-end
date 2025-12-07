import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../../enviornment/env';
import tinycolor from 'tinycolor2';
export interface Theme {
  // Base theme properties (existing)
  sidebarColor: string;
  dropdownColor: string;
  footerColor: string;
  sidebarwidth: string;
  sidebarcollapsedwidth: string;
  navlinktext: string;
  dropdownitemtext: string;
  navlinktextcolor: string;
  dropdownitemtextcolor: string;
  dropdownitemfont: string;
  navlinkfont: string;

  // New TinyColor2 enhanced properties
  primaryColor?: string;

  // Auto-generated color variations (calculated client-side)
  sidebarLightColor?: string;
  sidebarDarkColor?: string;
  dropdownHoverColor?: string;
  dropdownActiveColor?: string;
  footerAccentColor?: string;
  footerTextColor?: string;

  // Color palette for advanced theming
  colorPalette?: {
    lighter: string;
    light: string;
    base: string;
    dark: string;
    darker: string;
    complement: string;
    triadic: string[];
    analogous: string[];
    monochromatic: string[];
  };

  // Accessibility and analysis
  contrastRatios?: {
    sidebar: number;
    dropdown: number;
    footer: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private apiUrl = `${environment.baseurl}/theme`;
  private themeSubject = new BehaviorSubject<Theme | null>(null);
  theme$ = this.themeSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Fetch from backend and enhance with TinyColor2
  loadTheme() {
    this.http.get<Theme>(this.apiUrl).subscribe((theme) => {
      const enhancedTheme = this.enhanceThemeWithTinyColor(theme);
      this.themeSubject.next(enhancedTheme);
      this.applyTheme(enhancedTheme);
    });
  }

  // Update theme with TinyColor2 enhancements
  updateTheme(theme: Theme) {
    const enhancedTheme = this.enhanceThemeWithTinyColor(theme);

    const backendTheme: Theme = {
      sidebarColor: theme.sidebarColor,
      dropdownColor: theme.dropdownColor,
      footerColor: theme.footerColor,
      sidebarwidth: theme.sidebarwidth,
      sidebarcollapsedwidth: theme.sidebarcollapsedwidth,
      navlinktext: theme.navlinktext,
      dropdownitemtext: theme.dropdownitemtext,
      navlinktextcolor: theme.navlinktextcolor,
      dropdownitemtextcolor: theme.dropdownitemtextcolor,
      primaryColor: theme.primaryColor,
      dropdownitemfont: theme.dropdownitemfont,
      navlinkfont: theme.navlinkfont,
    };

    console.log('Backend theme payload:', backendTheme);

    this.http.post<Theme>(this.apiUrl, backendTheme).subscribe({
      next: (updated) => {
        console.log('✅ SUCCESS - Response from backend:', updated);
        const finalEnhancedTheme = this.enhanceThemeWithTinyColor(updated);
        this.themeSubject.next(finalEnhancedTheme);
        this.applyTheme(finalEnhancedTheme);
      },
      error: (error) => {
        console.error('❌ ERROR - API call failed:', error); // This will show you the error
        console.error('Status:', error.status);
        console.error('Message:', error.message);
      },
    });
  }

  // Generate theme from primary color using TinyColor2
  generateThemeFromPrimary(primaryColor: string): Theme {
    const primary = tinycolor(primaryColor);

    return {
      primaryColor: primaryColor,
      sidebarColor: primary.toHexString(),
      dropdownColor: primary.clone().darken(8).toHexString(),
      footerColor: primary.clone().darken(15).toHexString(),
      sidebarwidth: '260px',
      sidebarcollapsedwidth: '90px',
      navlinktext: '16px',
      dropdownitemtext: '14px',
      navlinktextcolor: '#2d6cdf',
      dropdownitemtextcolor: '#2c87c9',
      dropdownitemfont: 'Arial, sans-serif',
      navlinkfont: 'Arial, sans-serif',
    };
  }

  // Generate complementary theme
  generateComplementaryTheme(baseColor: string): Theme {
    const base = tinycolor(baseColor);
    const complement = base.complement();

    return {
      primaryColor: baseColor,
      sidebarColor: base.toHexString(),
      dropdownColor: complement.toHexString(),
      footerColor: base.clone().darken(20).toHexString(),
      sidebarwidth: '260px',
      sidebarcollapsedwidth: '90px',
      navlinktext: '16px',
      dropdownitemtext: '14px',
      navlinktextcolor: '#2d6cdf',
      dropdownitemtextcolor: '#2c87c9',
      dropdownitemfont: 'Arial, sans-serif',
      navlinkfont: 'Arial, sans-serif',
    };
  }

  // Generate triadic theme
  generateTriadicTheme(baseColor: string): Theme {
    const base = tinycolor(baseColor);
    const triadic = base.triad();

    return {
      primaryColor: baseColor,
      sidebarColor: triadic[0].toHexString(),
      dropdownColor: triadic[1].toHexString(),
      footerColor: triadic[2].toHexString(),
      sidebarwidth: '260px',
      sidebarcollapsedwidth: '90px',
      navlinktext: '16px',
      dropdownitemtext: '14px',
      navlinktextcolor: '#2d6cdf',
      dropdownitemtextcolor: '#2c87c9',
      dropdownitemfont: 'Arial, sans-serif',
      navlinkfont: 'Arial, sans-serif',
    };
  }

  // Generate analogous theme
  generateAnalogousTheme(baseColor: string): Theme {
    const base = tinycolor(baseColor);
    const analogous = base.analogous();

    return {
      primaryColor: baseColor,
      sidebarColor: analogous[0].toHexString(),
      dropdownColor: analogous[2].toHexString(),
      footerColor: analogous[3].toHexString(),
      sidebarwidth: '260px',
      sidebarcollapsedwidth: '90px',
      navlinktext: '16px',
      dropdownitemtext: '14px',
      navlinktextcolor: '#2d6cdf',
      dropdownitemtextcolor: '#2c87c9',
      dropdownitemfont: 'Arial, sans-serif',
      navlinkfont: 'Arial, sans-serif',
    };
  }

  // Enhance theme with TinyColor2 generated colors
  private enhanceThemeWithTinyColor(theme: Theme): Theme {
    if (!theme) return theme;

    const primaryColor = theme.primaryColor || theme.sidebarColor;
    const primary = tinycolor(primaryColor);

    // Generate sidebar variations
    const sidebarBase = tinycolor(theme.sidebarColor);
    const sidebarLightColor = sidebarBase.clone().lighten(15).toHexString();
    const sidebarDarkColor = sidebarBase.clone().darken(10).toHexString();

    // Generate dropdown variations
    const dropdownBase = tinycolor(theme.dropdownColor);
    const dropdownHoverColor = dropdownBase.clone().lighten(10).toHexString();
    const dropdownActiveColor = dropdownBase.clone().darken(5).toHexString();

    // Generate footer variations
    const footerBase = tinycolor(theme.footerColor);
    const footerAccentColor = footerBase.clone().complement().toHexString();
    const footerTextColor = this.getOptimalTextColor(theme.footerColor);

    // Generate complete color palette
    const colorPalette = {
      lighter: primary.clone().lighten(30).toHexString(),
      light: primary.clone().lighten(15).toHexString(),
      base: primary.toHexString(),
      dark: primary.clone().darken(15).toHexString(),
      darker: primary.clone().darken(30).toHexString(),
      complement: primary.clone().complement().toHexString(),
      triadic: primary.triad().map((c) => c.toHexString()),
      analogous: primary
        .analogous()
        .slice(0, 5)
        .map((c) => c.toHexString()),
      monochromatic: primary
        .monochromatic()
        .slice(0, 6)
        .map((c) => c.toHexString()),
    };

    // Calculate contrast ratios for accessibility
    const contrastRatios = {
      sidebar: this.calculateContrastRatio(theme.sidebarColor, '#ffffff'),
      dropdown: this.calculateContrastRatio(theme.dropdownColor, '#ffffff'),
      footer: this.calculateContrastRatio(theme.footerColor, '#ffffff'),
    };

    return {
      ...theme,
      primaryColor,
      sidebarLightColor,
      sidebarDarkColor,
      dropdownHoverColor,
      dropdownActiveColor,
      footerAccentColor,
      footerTextColor,
      colorPalette,
      contrastRatios,
    };
  }

  // Get optimal text color (black or white) for given background
  private getOptimalTextColor(backgroundColor: string): string {
    const color = tinycolor(backgroundColor);
    return color.isLight() ? '#000000' : '#ffffff';
  }

  // Calculate WCAG contrast ratio
  private calculateContrastRatio(color1: string, color2: string): number {
    return Math.round(tinycolor.readability(color1, color2) * 100) / 100;
  }

  // Apply enhanced CSS variables
  // Apply enhanced CSS variables
  private applyTheme(theme: Theme) {
    if (!theme) return;

    const root = document.documentElement;

    // Original properties
    root.style.setProperty('--sidebar-color', theme.sidebarColor);
    root.style.setProperty('--dropdown-color', theme.dropdownColor);
    root.style.setProperty('--footer-color', theme.footerColor);
    root.style.setProperty('--sidebar-width', theme.sidebarwidth);
    root.style.setProperty(
      '--sidebar-collapsed-width',
      theme.sidebarcollapsedwidth
    );

    // 🔥 ADD THESE MISSING LINES:
    root.style.setProperty('--nav-link-text', theme.navlinktext);
    root.style.setProperty('--dropdown-item-text', theme.dropdownitemtext);
    root.style.setProperty('--navlink-text-color', theme.navlinktextcolor);
    root.style.setProperty('--dropdown-item-textcolor',theme.dropdownitemtextcolor);
      root.style.setProperty('--navlink-font', theme.navlinkfont);
        root.style.setProperty('--dropdown-item-font', theme.dropdownitemfont);
    // Rest of your existing code...
    if (theme.primaryColor) {
      root.style.setProperty('--primary-color', theme.primaryColor);
    }
    // ... rest remains the same
  }

  // Utility methods for color manipulation
  lightenColor(color: string, amount: number = 10): string {
    return tinycolor(color).lighten(amount).toHexString();
  }

  darkenColor(color: string, amount: number = 10): string {
    return tinycolor(color).darken(amount).toHexString();
  }

  saturateColor(color: string, amount: number = 10): string {
    return tinycolor(color).saturate(amount).toHexString();
  }

  desaturateColor(color: string, amount: number = 10): string {
    return tinycolor(color).desaturate(amount).toHexString();
  }

  getComplementaryColor(color: string): string {
    return tinycolor(color).complement().toHexString();
  }

  isColorDark(color: string): boolean {
    return tinycolor(color).isDark();
  }

  isColorLight(color: string): boolean {
    return tinycolor(color).isLight();
  }

  // Get current theme snapshot
  getCurrentTheme(): Theme | null {
    return this.themeSubject.value;
  }

  // Check if colors are accessible
  isAccessible(
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA'
  ): boolean {
    const ratio = tinycolor.readability(foreground, background);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }

  // Generate random theme
  generateRandomTheme(): Theme {
    const randomColor = tinycolor.random().toHexString();
    return this.generateThemeFromPrimary(randomColor);
  }
}
