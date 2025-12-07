import { Component, Input, OnInit } from '@angular/core';
import {
  HeaderConfig,
  HeaderConfigService,
} from '../service/letterheader-config.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-letterheader',
  templateUrl: './letterheader.component.html',
  styleUrls: ['./letterheader.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
})
export class LetterheaderComponent implements OnInit {
  @Input() documentTitle: string = '';
  config!: HeaderConfig;

  constructor(private headerService: HeaderConfigService) {}

  ngOnInit() {
    this.headerService.config$.subscribe((config) => {
      this.config = { ...config };
    });
  }

  hasContent(): boolean {
    if (!this.config) return false;
    return !!(
      this.config.hospitalName ||
      this.config.logoUrl ||
      this.config.hospitalSubtitle ||
      this.config.tagline ||
      this.hasContactInfo()
    );
  }

  hasContactInfo(): boolean {
    if (!this.config) return false;
    return !!(
      this.config.address ||
      this.config.phone ||
      this.config.email ||
      this.config.website
    );
  }

  get headerStyles() {
    if (!this.config) return {};
    return {
      width: this.config?.headerWidth || '3in',
      height: this.config?.headerHeight || '2in',
      backgroundColor: this.config?.backgroundColor || '#fff',
      margin: '0 auto',
      boxSizing: 'border-box',
      display: 'block',
      overflow: 'hidden',
      fontFamily: this.config.fontFamily,
      fontSize: this.config.fontSize,
      color: this.config.textColor,
      marginTop: this.config.marginTop,
      marginBottom: this.config.marginBottom,
      marginLeft: this.config.marginSides,
      marginRight: this.config.marginSides,
      textAlign: this.config.headerAlign,
      lineHeight: this.config.lineSpacing,
      // display: 'flex',
      flexDirection: 'column',
      alignItems: this.config.headerAlign,
      justifyContent: 'center',
      border: 'none',
    };
  }


  get logoStyles() {
    return {
      maxWidth: this.config.logoMaxWidth,
      maxHeight: this.config.logoMaxHeight,
      borderRadius: this.config.logoBorderRadius,
      objectFit: 'contain',
    };
  }

  get contentRowStyle() {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: this.config.headerAlign,
      gap: this.config.headerGap,
    };
  }

  get logoSectionStyle() {
    let order = 1;
    if (this.config.logoPosition === 'center') order = 2;
    if (this.config.logoPosition === 'right') order = 3;
    return { order, display: 'flex', alignItems: 'center' };
  }

  formatSubtitle(subtitle: string): string {
    return subtitle ? subtitle.replace(/\\n/g, '<br>') : '';
  }
}
