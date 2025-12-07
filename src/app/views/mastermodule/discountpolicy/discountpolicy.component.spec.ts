import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountpolicyComponent } from './discountpolicy.component';

describe('DiscountpolicyComponent', () => {
  let component: DiscountpolicyComponent;
  let fixture: ComponentFixture<DiscountpolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountpolicyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscountpolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
