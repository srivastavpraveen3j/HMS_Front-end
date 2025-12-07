import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VoiceService } from '../../mastermodule/masterservice/voiceservice/voice.service';

interface CardItem {
  id: string;
  title: string;
  routerLink: string;
  voiceCommands: string[]; // Add voice command aliases
  checkFunction?: () => void;
  accessCheck?: {
    module: string;
    action?: 'read' | 'create' | 'update' | 'delete';
  };
}
@Component({
  selector: 'app-ipdui',
  imports: [CommonModule, RouterModule],
  templateUrl: './ipdui.component.html',
  styleUrl: './ipdui.component.css',
})
export class IpduiComponent {
  isCustomizing: boolean = false;

  // Define all possible cards with voice commands
  allCards: CardItem[] = [
    {
      id: 'admission',
      title: 'ADMISSION',
      routerLink: '/ipd/ipdadmissionlist',
      voiceCommands: [
        'admission',
        'admissions',
        'ipd admission',
        'admission list',
      ],
      accessCheck: { module: 'inpatientCase' },
    },
    {
      id: 'ipdDeposit',
      title: 'IPD DEPOSIT',
      routerLink: '/ipd/ipddepositlist',
      voiceCommands: [
        'deposit record',
        'ipd deposit records',
        'ipd deposit',
        'ipd deposits',
      ],
      accessCheck: { module: 'inpatientDeposit' },
    },
    {
      id: 'ipdBilling',
      title: 'IPD BILLING',
      routerLink: '/ipd/ipdbilllist',
      voiceCommands: ['ipd bill', 'bill', 'ipd billing', 'bills', 'ipd bills'],
      accessCheck: { module: 'inpatientBilling' },
    },
    {
      id: 'otSheet',
      title: 'OT SHEET',
      routerLink: '/ipd/otsheetlist',
      voiceCommands: [
        'ot sheet',
        'sheet',
        'ot sheets',
        'operation theatre sheet',
        'ot',
      ],
      accessCheck: { module: 'oprationTheatresheet' },
    },
    {
      id: 'intermBill',
      title: 'INTERIM BILL',
      routerLink: '/ipd/intermbill',
      voiceCommands: ['interim bill', 'interim', 'interim bills'],
      accessCheck: { module: 'inpatientIntermBill' },
    },
    {
      id: 'tpa',
      title: 'TPA',
      routerLink: '/ipd/tpalist',
      voiceCommands: ['tpa', 'tpa list', 'tpas', 'tpa record'],
      accessCheck: { module: 'thirdPartyAdministrator' },
    },
    {
      id: 'discharge',
      title: 'DISCHARGE',
      routerLink: '/ipd/ipddischargelist',
      voiceCommands: [
        'ipd discharge',
        'discharge',
        'ipd discharge record',
        'discharge record',
      ],
      accessCheck: { module: 'discharge' },
    },
    {
      id: 'vitalChart',
      title: 'VITAL CHART',
      routerLink: '/doctor/vitallist',
      voiceCommands: ['vital chart', 'vitals chart', 'vitals', 'vital list'],
      accessCheck: { module: 'vitals' },
    },
    {
      id: 'diagnosisSheet',
      title: 'DIAGNOSIS SHEET',
      routerLink: '/doctor/diagnosissheetlist',
      voiceCommands: [
        'diagnosis sheet',
        'diagnosis',
        'diagnos sheet',
        'diagnosis list',
      ],
      accessCheck: { module: 'diagnosisSheet' },
    },
    {
      id: 'operationNote',
      title: 'OPERATION NOTE',
      routerLink: '/doctor/otnoteslist',
      voiceCommands: [
        'ot notes',
        'ot note',
        'operation note',
        'operation notes',
      ],
      accessCheck: { module: 'operationTheatreNotes' },
    },
    {
      id: 'dischargeSummary',
      title: 'DISCHARGE SUMMARY',
      routerLink: '/doctor/doctordischargelist',
      voiceCommands: [
        'discharge summary',
        'discharge record',
        'discharge',
        'summary',
      ],
      accessCheck: { module: 'dischargeSummary' },
    },
    {
      id: 'treatmentSheet',
      title: 'TREATMENT SHEET',
      routerLink: '/doctor/tretmentordersheet',
      voiceCommands: [
        'treatment sheet',
        'treatment sheets',
        'treatment order sheet',
        'sheet',
      ],
      accessCheck: { module: 'treatmentHistorySheet' },
    },
    {
      id: 'roomType',
      title: 'Room Transfer',
      routerLink: '/master/roomtypemasterlist',
      voiceCommands: [
        'roomtype'

      ],
      accessCheck: { module: 'roomType' },
    },


  ];

  userCardOrder: CardItem[] = [];

  constructor(public voiceService: VoiceService) {}

  ngOnInit(): void {
    this.loadUserCardOrder();
  }

  // Rest of your existing methods...
  loadUserCardOrder(): void {
    const savedOrder = localStorage.getItem('opdCardOrder');
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder);
        this.userCardOrder = orderIds
          .map((id: string) => this.allCards.find((card) => card.id === id))
          .filter((card: CardItem | undefined) => card !== undefined)
          .concat(this.allCards.filter((card) => !orderIds.includes(card.id)));
      } catch (e) {
        console.error('Error loading card order:', e);
        this.userCardOrder = [...this.allCards];
      }
    } else {
      this.userCardOrder = [...this.allCards];
    }
  }

  saveUserCardOrder(): void {
    const orderIds = this.userCardOrder.map((card) => card.id);
    localStorage.setItem('opdCardOrder', JSON.stringify(orderIds));
  }

  getVisibleCards(): CardItem[] {
    return this.userCardOrder.filter((card) => this.shouldShowCard(card));
  }

  shouldShowCard(card: CardItem): boolean {
    if (!card.accessCheck) return true;
    return this.hasModuleAccess(
      card.accessCheck.module,
      card.accessCheck.action || 'read'
    );
  }

  moveCardUp(index: number): void {
    if (index > 0) {
      const temp = this.userCardOrder[index];
      this.userCardOrder[index] = this.userCardOrder[index - 1];
      this.userCardOrder[index - 1] = temp;
      this.saveUserCardOrder();
    }
  }

  moveCardDown(index: number): void {
    if (index < this.userCardOrder.length - 1) {
      const temp = this.userCardOrder[index];
      this.userCardOrder[index] = this.userCardOrder[index + 1];
      this.userCardOrder[index + 1] = temp;
      this.saveUserCardOrder();
    }
  }

  resetToDefaultOrder(): void {
    this.userCardOrder = [...this.allCards];
    this.saveUserCardOrder();
  }

  toggleCustomization(): void {
    this.isCustomizing = !this.isCustomizing;
  }

  executeCardAction(card: CardItem): void {
    if (card.checkFunction) {
      card.checkFunction();
    }
  }

  trackByCardId(index: number, card: CardItem): string {
    return card.id;
  }

  hasModuleAccess(
    module: string,
    action: 'read' | 'create' | 'update' | 'delete' = 'read'
  ): boolean {
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    return permissions.some(
      (perm: any) =>
        perm.moduleName === module && perm.permissions?.[action] === 1
    );
  }
}
