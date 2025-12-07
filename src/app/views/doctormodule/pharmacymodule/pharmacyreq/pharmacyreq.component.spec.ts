import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyreqComponent } from './pharmacyreq.component';

describe('PharmacyreqComponent', () => {
  let component: PharmacyreqComponent;
  let fixture: ComponentFixture<PharmacyreqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyreqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacyreqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
