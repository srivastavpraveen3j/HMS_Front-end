import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdmasterchargelistComponent } from './opdmasterchargelist.component';

describe('OpdmasterchargelistComponent', () => {
  let component: OpdmasterchargelistComponent;
  let fixture: ComponentFixture<OpdmasterchargelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdmasterchargelistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdmasterchargelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
