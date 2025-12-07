import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdpaymentdetailsComponent } from './ipdpaymentdetails.component';

describe('IpdpaymentdetailsComponent', () => {
  let component: IpdpaymentdetailsComponent;
  let fixture: ComponentFixture<IpdpaymentdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdpaymentdetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdpaymentdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
