import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdBillComponent } from './opd-bill.component';

describe('OpdBillComponent', () => {
  let component: OpdBillComponent;
  let fixture: ComponentFixture<OpdBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdBillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
