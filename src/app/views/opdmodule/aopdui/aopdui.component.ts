import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { OpdService } from '../opdservice/opd.service';
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
  selector: 'app-aopdui',
  imports: [RouterModule, CommonModule],
  templateUrl: './aopdui.component.html',
  styleUrl: './aopdui.component.css',
})
export class AopduiComponent {
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
      id: 'appointment',
      title: 'APPOINTMENT',
      routerLink: '/opd/opdappointmentlist',
      voiceCommands: ['appointment', 'appointments', 'book appointment', 'appointment list'],
      accessCheck: { module: 'appointment' }
    },
    {
      id: 'appointmentRecord',
      title: 'APPOINTMENT RECORD',
      routerLink: '/opd/opdappointmentquelist',
      voiceCommands: ['appointment record', 'appointment records', 'appointment queue', 'records'],
      accessCheck: { module: 'appointment_record', action: 'read' },
    },
    {
      id: 'opdBill',
      title: 'OPD BILL',
      routerLink: '/opd/listopbills',
      voiceCommands: ['opd bill', 'bill', 'billing', 'bills', 'opd billing'],
      accessCheck: { module: 'outpatientBill', action: 'create' }
    },
    {
      id: 'opdCase',
      title: 'OPD CASE',
      routerLink: '/opd/opdcases',
      voiceCommands: ['opd case', 'case', 'cases', 'patient case', 'opd cases'],
      checkFunction: () => this.checkId()
    },
    {
      id: 'opdDiagnosis',
      title: 'OPD DIAGNOSIS',
      routerLink: '/opd/opddiagnosissheetlist',
      voiceCommands: ['diagnosis', 'opd diagnosis', 'diagnosis sheet', 'medical diagnosis'],
      accessCheck: { module: 'diagnosisSheet', action: 'create' }
    },
    {
      id: 'opdReports',
      title: 'OPD Reports',
      routerLink: '/report/opdreport',
      voiceCommands: ['opd report', 'report opd', 'reports of opd', 'opd reports'],
      checkFunction: () => this.checkId()
    }
  ];

  userCardOrder: CardItem[] = [];

  constructor(
    private opdservice: OpdService,
    public voiceService: VoiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserCardOrder();
    this.setupVoiceRecognition();
  }

  private setupVoiceRecognition(): void {
    // Subscribe to voice recognition events
    this.voiceService.isListening$.subscribe(isListening => {
      this.isVoiceListening = isListening;
    });

    this.voiceService.transcript$.subscribe(transcript => {
      this.lastTranscript = transcript;
    });

    this.voiceService.command$.subscribe(command => {
      this.handleVoiceCommand(command);
    });

    this.voiceService.error$.subscribe(error => {
      this.voiceError = error;
      setTimeout(() => this.voiceError = '', 3000); // Clear error after 3 seconds
    });
  }

  private handleVoiceCommand(command: {action: string, target: string}): void {
    this.lastCommand = `${command.action} ${command.target}`;

    // Find matching card based on voice commands
    const matchingCard = this.allCards.find(card =>
      card.voiceCommands.some(voiceCmd =>
        voiceCmd.toLowerCase().includes(command.target) ||
        command.target.includes(voiceCmd.toLowerCase())
      )
    );

    if (matchingCard) {
      // Check if user has access to this card
      if (this.shouldShowCard(matchingCard)) {
        console.log(`Voice command: Navigating to ${matchingCard.title}`);

        // Execute any special function first
        if (matchingCard.checkFunction) {
          matchingCard.checkFunction();
        }

        // Navigate to the card
        this.router.navigate([matchingCard.routerLink]);
      } else {
        this.voiceError = `Access denied: You don't have permission to access ${matchingCard.title}`;
        setTimeout(() => this.voiceError = '', 3000);
      }
    } else {
      this.voiceError = `Command not recognized: "${command.target}"`;
      setTimeout(() => this.voiceError = '', 3000);
    }
  }

  // Voice control methods
  startVoiceRecognition(): void {
    if (this.voiceService.isSupported()) {
      this.voiceError = '';
      this.voiceService.startListening();
    } else {
      this.voiceError = 'Speech recognition not supported in this browser';
    }
  }

  stopVoiceRecognition(): void {
    this.voiceService.stopListening();
  }

  // Rest of your existing methods...
  loadUserCardOrder(): void {
    const savedOrder = localStorage.getItem('opdCardOrder');
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder);
        this.userCardOrder = orderIds
          .map((id: string) => this.allCards.find(card => card.id === id))
          .filter((card: CardItem | undefined) => card !== undefined)
          .concat(this.allCards.filter(card => !orderIds.includes(card.id)));
      } catch (e) {
        console.error('Error loading card order:', e);
        this.userCardOrder = [...this.allCards];
      }
    } else {
      this.userCardOrder = [...this.allCards];
    }
  }

  saveUserCardOrder(): void {
    const orderIds = this.userCardOrder.map(card => card.id);
    localStorage.setItem('opdCardOrder', JSON.stringify(orderIds));
  }

  // onDrop(event: CdkDragDrop<CardItem[]>): void {
  //   if (event.previousIndex !== event.currentIndex) {
  //     moveItemInArray(this.userCardOrder, event.previousIndex, event.currentIndex);
  //     this.saveUserCardOrder();
  //   }
  // }

  getVisibleCards(): CardItem[] {
    return this.userCardOrder.filter(card => this.shouldShowCard(card));
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

  checkId() {
    const user = localStorage.getItem('authUser');
    const userStr = user ? JSON.parse(user) : null;
    const userid = userStr ? userStr._id : null;
    this.userId = userid;
    const name = userStr ? userStr.role?.name : null;

    if (name === 'doctor') {
      this.sessionStart();
    }
  }

  sessionStart() {
    this.opdservice.startSession(this.userId).subscribe(
      (response) => {
        console.log('Response:', response);
      },
      (error) => {
        console.error('Error starting session:', error);
      }
    );
  }
}
