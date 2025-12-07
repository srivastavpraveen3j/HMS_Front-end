import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Theme, ThemeService } from '../theme.service';
import tinycolor from 'tinycolor2';
interface ColorPreset {
  name: string;
  color: string;
  description: string;
}

interface ColorAnalysis {
  brightness: number;
  contrastRatio: string;
  accessibility: 'good' | 'fair' | 'poor';
}

interface PaletteColor {
  name: string;
  value: string;
}

@Component({
  selector: 'app-theme',
  imports: [CommonModule, FormsModule],
  templateUrl: './theme.component.html',
  styleUrl: './theme.component.css',
})
export class ThemeComponent implements OnInit {
  theme: Theme = {
    primaryColor: '#2d6cdf',
    sidebarColor: '#2d6cdf',
    dropdownColor: '#2d6cdf',
    footerColor: '#2d6cdf',
    sidebarwidth: '260px',
    sidebarcollapsedwidth: '90px',
    navlinktext: '16px',
    navlinktextcolor: '#ffff',
    navlinkfont: 'Arial, sans-serif',
    dropdownitemtext: '14px',
    dropdownitemtextcolor: '#0000',
    dropdownitemfont:  'Arial, sans-serif',
  };

  colorPresets: ColorPreset[] = [
    { name: 'Ocean', color: '#0077be', description: 'Professional blue theme' },
    { name: 'Forest', color: '#228B22', description: 'Natural green theme' },
    { name: 'Sunset', color: '#ff6b35', description: 'Warm orange theme' },
    { name: 'Royal', color: '#6a5acd', description: 'Elegant purple theme' },
    { name: 'Cherry', color: '#dc143c', description: 'Bold red theme' },
    { name: 'Teal', color: '#008b8b', description: 'Modern teal theme' },
    { name: 'Gold', color: '#daa520', description: 'Luxury gold theme' },
    {
      name: 'Midnight',
      color: '#2c3e50',
      description: 'Dark professional theme',
    },
  ];

  colorAnalysis: ColorAnalysis | null = null;

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    // Load theme from backend
    this.themeService.loadTheme();

    // Subscribe to theme changes
    this.themeService.theme$.subscribe((theme) => {
      if (theme) {
        this.theme = { ...theme };
        if (theme.primaryColor) {
          this.analyzeColor(theme.primaryColor);
        }
      }
    });
  }

  // Analyze color properties
  analyzeColor(color: string) {
    if (!color) return;

    const tc = tinycolor(color);
    const brightness = Math.round((tc.getBrightness() / 255) * 100);

    // Calculate contrast against white
    const contrastRatio = tinycolor.readability(color, '#ffffff');
    const accessibility =
      contrastRatio >= 7 ? 'good' : contrastRatio >= 4.5 ? 'fair' : 'poor';

    this.colorAnalysis = {
      brightness,
      contrastRatio: contrastRatio.toFixed(2),
      accessibility,
    };
  }

  // Handle primary color change
  onPrimaryColorChange(color: string) {
    this.theme.primaryColor = color;
    this.analyzeColor(color);
    this.generateFromPrimary();
  }

  // Handle general color changes
  onColorChange() {
    this.saveTheme();
  }

  // Generate theme from primary color using service
  generateFromPrimary() {
    if (this.theme.primaryColor) {
      const newTheme = this.themeService.generateThemeFromPrimary(
        this.theme.primaryColor
      );
      this.theme = { ...this.theme, ...newTheme };
      this.saveTheme();
    }
  }

  // Generate complementary theme
  generateComplementary() {
    if (this.theme.primaryColor) {
      const newTheme = this.themeService.generateComplementaryTheme(
        this.theme.primaryColor
      );
      this.theme = { ...this.theme, ...newTheme };
      this.saveTheme();
    }
  }

  // Generate triadic theme
  generateTriadic() {
    if (this.theme.primaryColor) {
      const newTheme = this.themeService.generateTriadicTheme(
        this.theme.primaryColor
      );
      this.theme = { ...this.theme, ...newTheme };
      this.saveTheme();
    }
  }

  // Generate analogous theme
  generateAnalogous() {
    if (this.theme.primaryColor) {
      const newTheme = this.themeService.generateAnalogousTheme(
        this.theme.primaryColor
      );
      this.theme = { ...this.theme, ...newTheme };
      this.saveTheme();
    }
  }

  // Use service utility methods with null checks
  lightenColor(type: 'sidebar' | 'dropdown' | 'footer') {
    const colorKey = `${type}Color` as keyof Theme;
    const currentColor = this.theme[colorKey] as string;

    if (currentColor) {
      const lightenedColor = this.themeService.lightenColor(currentColor, 10);
      (this.theme as any)[colorKey] = lightenedColor;
      this.saveTheme();
    }
  }

  darkenColor(type: 'sidebar' | 'dropdown' | 'footer') {
    const colorKey = `${type}Color` as keyof Theme;
    const currentColor = this.theme[colorKey] as string;

    if (currentColor) {
      const darkenedColor = this.themeService.darkenColor(currentColor, 10);
      (this.theme as any)[colorKey] = darkenedColor;
      this.saveTheme();
    }
  }

  // Get palette colors for display
  getPaletteColors(): PaletteColor[] {
    if (!this.theme.colorPalette) return [];

    const palette = this.theme.colorPalette;
    return [
      { name: 'Lighter', value: palette.lighter },
      { name: 'Light', value: palette.light },
      { name: 'Base', value: palette.base },
      { name: 'Dark', value: palette.dark },
      { name: 'Darker', value: palette.darker },
      { name: 'Complement', value: palette.complement },
    ];
  }

  // Apply palette color
  applyPaletteColor(color: string) {
    this.theme.primaryColor = color;
    this.generateFromPrimary();
  }

  // Apply preset theme
  applyPreset(preset: ColorPreset) {
    this.theme.primaryColor = preset.color;
    this.generateFromPrimary();
  }

  // Generate random theme
  generateRandomTheme() {
    const randomTheme = this.themeService.generateRandomTheme();
    this.theme = { ...this.theme, ...randomTheme };
    this.saveTheme();
  }

  // Check accessibility
  checkAccessibility(): boolean {
    if (!this.theme.sidebarColor) return false;
    return this.themeService.isAccessible('#ffffff', this.theme.sidebarColor);
  }

  // Reset to default theme
  resetTheme() {
    this.theme = {
      primaryColor: '#2d6cdf',
      sidebarColor: '#1e3a5f',
      dropdownColor: '#2c87c9',
      navlinktextcolor: '#fff',
      dropdownitemtextcolor: '#000',
      footerColor: '#2c3e50',
      sidebarwidth: '260px',
      sidebarcollapsedwidth: '90px',
      dropdownitemtext: '14px',
      navlinktext: '16px',
      dropdownitemfont: 'Arial, sans-serif' ,
      navlinkfont: 'Arial, sans-serif',
    };
    this.saveTheme();
  }

  // Export theme configuration
  exportTheme() {
    const dataStr = JSON.stringify(this.theme, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'theme-config.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  // Import theme configuration
  importTheme(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const importedTheme = JSON.parse(e.target.result);
          this.theme = { ...this.theme, ...importedTheme };
          this.saveTheme();
        } catch (error) {
          alert('Invalid theme file format');
        }
      };
      reader.readAsText(file);
    }
  }

  // Get current theme snapshot
  getCurrentTheme(): Theme {
    return this.themeService.getCurrentTheme() || this.theme;
  }

  // Save to backend
  saveTheme() {
    this.themeService.updateTheme(this.theme);
  }
}
