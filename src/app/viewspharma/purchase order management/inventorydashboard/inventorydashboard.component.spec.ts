import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorydashboardComponent } from './inventorydashboard.component';

describe('InventorydashboardComponent', () => {
  let component: InventorydashboardComponent;
  let fixture: ComponentFixture<InventorydashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventorydashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventorydashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
