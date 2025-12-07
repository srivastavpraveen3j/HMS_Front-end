import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { OpdService } from '../../views/opdmodule/opdservice/opd.service';
import { VoiceService } from '../../views/mastermodule/masterservice/voiceservice/voice.service';

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
  selector: 'app-hospitaladminui',
  imports: [RouterModule],
  templateUrl: './hospitaladminui.component.html',
  styleUrl: './hospitaladminui.component.css',
})
export class HospitaladminuiComponent {
  userId: string = '';
  isCustomizing: boolean = false;

  // Voice recognition properties
  isVoiceListening = false;
  lastTranscript = '';
  lastCommand = '';
  voiceError = '';

  // Define all possible cards with voice commands
  allCards: CardItem[] = [
    {
      id: 'patientmanagement',
      title: 'PATIENT MANAGEMENT',
      routerLink: '/urm/patientmanagement',
      voiceCommands: ['patient management', 'manage patients'],
      accessCheck: { module: 'patientmanagement' },
    },
    {
      id: 'doctormanagement',
      title: 'DOCTOR MANAGEMENT',
      routerLink: '/urm/doctormanagement',
      voiceCommands: [
        'doctor management',
        'manage doctors',
        'doctor list',
        'records',
      ],
      accessCheck: { module: 'doctormanagement' },
    },
    {
      id: 'staffmanagement',
      title: 'STAFF MANAGEMENT',
      routerLink: '/urm/staffmanagement',
      voiceCommands: ['staff management', 'manage staff', 'staff list'],
      accessCheck: { module: 'staffmanagement', action: 'read' },
    },
  ];

  userCardOrder: CardItem[] = [];

  constructor(
    private opdservice: OpdService,
    public voiceService: VoiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserCardOrder();
    // this.setupVoiceRecognition();
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
    // return this.userCardOrder.filter((card) => this.shouldShowCard(card));
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
