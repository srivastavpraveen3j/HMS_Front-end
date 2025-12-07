import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdbillingservicesdetailesComponent } from './opdbillingservicesdetailes.component';

describe('OpdbillingservicesdetailesComponent', () => {
  let component: OpdbillingservicesdetailesComponent;
  let fixture: ComponentFixture<OpdbillingservicesdetailesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdbillingservicesdetailesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdbillingservicesdetailesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
