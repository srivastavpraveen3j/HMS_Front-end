import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperadminpermissionComponent } from './superadminpermission.component';

describe('SuperadminpermissionComponent', () => {
  let component: SuperadminpermissionComponent;
  let fixture: ComponentFixture<SuperadminpermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperadminpermissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperadminpermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
