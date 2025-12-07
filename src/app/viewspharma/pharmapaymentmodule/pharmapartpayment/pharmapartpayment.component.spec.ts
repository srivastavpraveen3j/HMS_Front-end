import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmapartpaymentComponent } from './pharmapartpayment.component';

describe('PharmapartpaymentComponent', () => {
  let component: PharmapartpaymentComponent;
  let fixture: ComponentFixture<PharmapartpaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmapartpaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmapartpaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
