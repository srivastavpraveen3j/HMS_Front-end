import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface CardItem {
  id: string;
  title: string;
  routerLink: string;
  accessCheck?: {
    module: string;
    action?: 'read' | 'create' | 'update' | 'delete';
  };
}

@Component({
  selector: 'app-masteruipage',
  imports: [RouterModule, CommonModule],
  templateUrl: './masteruipage.component.html',
  styleUrl: './masteruipage.component.css',
})
export class MasteruipageComponent {
  isCustomizing: boolean = false;

  // Define all possible cards
  allCards: CardItem[] = [
    {
      id: 'services',
      title: 'SERVICES',
      routerLink: '/master/opdmasterservice',
      accessCheck: { module: 'service', action: 'create' },
    },
    {
      id: 'servicesGroup',
      title: 'SERVICES GROUP',
      routerLink: '/master/masteropdchargelist',
      accessCheck: { module: 'serviceGroup', action: 'create' },
    },
    {
      id: 'surgeryServices',
      title: 'SURGERY SERVICES',
      routerLink: '/master/surgerymasterlist',
      accessCheck: { module: 'surgeryService', action: 'create' },
    },
    {
      id: 'operationGroupmaster',
      title: 'Operation Group Master',
      routerLink: '/master/surgerypackagemasterlist',
      accessCheck: { module: 'surgeryService', action: 'create' },
    },
    {
      id: 'package',
      title: 'PACKAGE',
      routerLink: '/master/packagemasterlist',
      accessCheck: { module: 'packages', action: 'create' },
    },
    {
      id: 'symptoms',
      title: 'SYMPTOMS',
      routerLink: '/master/symptomslist',
      accessCheck: { module: 'symptoms', action: 'create' },
    },
    {
      id: 'symptomsGroup',
      title: 'SYMPTOMS GROUP',
      routerLink: '/master/symptomsgrouplist',
      accessCheck: { module: 'symptomGroup', action: 'create' },
    },
    // {
    //   id: 'testGroup',
    //   title: 'TEST GROUP',
    //   routerLink: '/master/medicaltestgrouplist',
    //   accessCheck: { module: 'testGroup', action: 'create' },
    // },
    {
      id: 'bedTypeMaster',
      title: 'BED TYPE MASTER',
      routerLink: '/master/bedtypemasterlist',
      accessCheck: { module: 'bedType', action: 'create' },
    },
    {
      id: 'bedMaster',
      title: 'BED MASTER',
      routerLink: '/master/bedmasterlist',
      accessCheck: { module: 'bed', action: 'create' },
    },
    {
      id: 'roomTypeMaster',
      title: 'ROOM TYPE MASTER',
      routerLink: '/master/roomtypemasterlist',
      accessCheck: { module: 'roomType', action: 'create' },
    },
    {
      id: 'roomMaster',
      title: 'ROOM MASTER',
      routerLink: '/master/roommasterlist',
      accessCheck: { module: 'room', action: 'create' },
    },
    {
      id: 'wardMaster',
      title: 'WARD MASTER',
      routerLink: '/master/wardmasterlist',
      accessCheck: { module: 'wardMaster', action: 'create' },
    },
    {
      id: 'medicines',
      title: 'MEDICINES',
      routerLink: '/master/medicinemasterlist',
      accessCheck: { module: 'medicine', action: 'create' },
    },
    {
      id: 'visittypemaster',
      title: 'VISIT TYPE MASTER',
      routerLink: '/master/visittypemaster',
      accessCheck: { module: 'testParameter', action: 'create' },
    },
    {
      id: 'appointmentSlot',
      title: 'APPOINTMENT SLOT MASTER',
      routerLink: '/master/slotmasterlist',
      accessCheck: { module: 'slotMaster', action: 'create' },
    },
    // {
    //   id: 'companymaster',
    //   title: 'COMPANY MASTER',
    //   routerLink: '/master/company',
    //   accessCheck: { module: 'slotMaster', action: 'create' },
    // },
    // {
    //   id: 'companymaster',
    //   title: 'COMPANY MASTER',
    //   routerLink: '/master/company',
    //   accessCheck: { module: 'slotMaster', action: 'create' },
    // },
    {
      id: 'doctormaster',
      title: 'DOCTOR MASTER',
      routerLink: '/master/doctormaster',
      accessCheck: { module: 'slotMaster', action: 'create' },
    },
    // {
    //   id: 'discountpolicy',
    //   title: 'MASTER DISCOUNT POLICY',
    //   routerLink: '/master/discountpolicy',
    // },
  ];

  // User's customized order
  userCardOrder: CardItem[] = [];

  ngOnInit(): void {
    this.loadUserCardOrder();
  }

  // Load user's saved card order from localStorage
  loadUserCardOrder(): void {
    const savedOrder = localStorage.getItem('masterCardOrder');
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder);
        // Reorder cards based on saved order
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

  // Save user's card order to localStorage
  saveUserCardOrder(): void {
    const orderIds = this.userCardOrder.map((card) => card.id);
    localStorage.setItem('masterCardOrder', JSON.stringify(orderIds));
  }

  // Get filtered cards based on permissions
  getVisibleCards(): CardItem[] {
    return this.userCardOrder.filter((card) => this.shouldShowCard(card));
  }

  // Check if card should be shown based on permissions
  shouldShowCard(card: CardItem): boolean {
    if (!card.accessCheck) return true;

    return this.hasModuleAccess(
      card.accessCheck.module,
      card.accessCheck.action || 'read'
    );
  }

  // Move card up in order
  moveCardUp(index: number): void {
    if (index > 0) {
      const temp = this.userCardOrder[index];
      this.userCardOrder[index] = this.userCardOrder[index - 1];
      this.userCardOrder[index - 1] = temp;
      this.saveUserCardOrder();
    }
  }

  // Move card down in order
  moveCardDown(index: number): void {
    if (index < this.userCardOrder.length - 1) {
      const temp = this.userCardOrder[index];
      this.userCardOrder[index] = this.userCardOrder[index + 1];
      this.userCardOrder[index + 1] = temp;
      this.saveUserCardOrder();
    }
  }

  // Reset to default order
  resetToDefaultOrder(): void {
    this.userCardOrder = [...this.allCards];
    this.saveUserCardOrder();
  }

  // Toggle customization mode
  toggleCustomization(): void {
    this.isCustomizing = !this.isCustomizing;
  }

  // Track by function for better performance
  trackByCard(index: number, card: CardItem): string {
    return card?.id || index.toString();
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

  hasAnyMasterDropdownAccess(): boolean {
    return (
      this.hasModuleAccess('doctor', 'create') ||
      this.hasModuleAccess('service', 'create') ||
      this.hasModuleAccess('serviceGroup', 'create') ||
      this.hasModuleAccess('surgeryService', 'create') ||
      this.hasModuleAccess('packages', 'create') ||
      this.hasModuleAccess('bedType', 'create') ||
      this.hasModuleAccess('bed', 'create') ||
      this.hasModuleAccess('roomType', 'create') ||
      this.hasModuleAccess('room', 'create') ||
      this.hasModuleAccess('wardMaster', 'create') ||
      this.hasModuleAccess('medicine', 'create') ||
      this.hasModuleAccess('testParameter', 'create') ||
      this.hasModuleAccess('testGroup', 'create') ||
      this.hasModuleAccess('symptoms', 'create') ||
      this.hasModuleAccess('symptomGroup', 'create') ||
      this.hasModuleAccess('discountpolicy', 'create')
    );
  }
}
