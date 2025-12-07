import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdmasterchargeComponent } from './opdmastercharge.component';

describe('OpdmasterchargeComponent', () => {
  let component: OpdmasterchargeComponent;
  let fixture: ComponentFixture<OpdmasterchargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdmasterchargeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdmasterchargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
