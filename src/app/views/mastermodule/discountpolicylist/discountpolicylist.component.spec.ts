import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountpolicylistComponent } from './discountpolicylist.component';

describe('DiscountpolicylistComponent', () => {
  let component: DiscountpolicylistComponent;
  let fixture: ComponentFixture<DiscountpolicylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountpolicylistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscountpolicylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
