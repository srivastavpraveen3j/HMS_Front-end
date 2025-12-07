import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaserequestlistComponent } from './purchaserequestlist.component';

describe('PurchaserequestlistComponent', () => {
  let component: PurchaserequestlistComponent;
  let fixture: ComponentFixture<PurchaserequestlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaserequestlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaserequestlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
