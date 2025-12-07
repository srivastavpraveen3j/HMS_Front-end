import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabmanagementComponent } from './labmanagement.component';

describe('LabmanagementComponent', () => {
  let component: LabmanagementComponent;
  let fixture: ComponentFixture<LabmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabmanagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
