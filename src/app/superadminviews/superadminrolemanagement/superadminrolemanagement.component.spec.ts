import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperadminrolemanagementComponent } from './superadminrolemanagement.component';

describe('SuperadminrolemanagementComponent', () => {
  let component: SuperadminrolemanagementComponent;
  let fixture: ComponentFixture<SuperadminrolemanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperadminrolemanagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperadminrolemanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
