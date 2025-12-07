import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockmanagementlayoutComponent } from './stockmanagementlayout.component';

describe('StockmanagementlayoutComponent', () => {
  let component: StockmanagementlayoutComponent;
  let fixture: ComponentFixture<StockmanagementlayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockmanagementlayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockmanagementlayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
