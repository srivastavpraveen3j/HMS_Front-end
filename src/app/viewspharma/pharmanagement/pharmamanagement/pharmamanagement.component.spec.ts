import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmamanagementComponent } from './pharmamanagement.component';

describe('PharmamanagementComponent', () => {
  let component: PharmamanagementComponent;
  let fixture: ComponentFixture<PharmamanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmamanagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmamanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
