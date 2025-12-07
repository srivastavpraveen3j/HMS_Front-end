import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountApprovalToggleComponent } from './discount-approval-toggle.component';

describe('DiscountApprovalToggleComponent', () => {
  let component: DiscountApprovalToggleComponent;
  let fixture: ComponentFixture<DiscountApprovalToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountApprovalToggleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscountApprovalToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
