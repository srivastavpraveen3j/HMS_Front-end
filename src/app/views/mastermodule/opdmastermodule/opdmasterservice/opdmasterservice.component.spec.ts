import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdmasterserviceComponent } from './opdmasterservice.component';

describe('OpdmasterserviceComponent', () => {
  let component: OpdmasterserviceComponent;
  let fixture: ComponentFixture<OpdmasterserviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdmasterserviceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdmasterserviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
