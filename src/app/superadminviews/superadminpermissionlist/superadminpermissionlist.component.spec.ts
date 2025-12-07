import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperadminpermissionlistComponent } from './superadminpermissionlist.component';

describe('SuperadminpermissionlistComponent', () => {
  let component: SuperadminpermissionlistComponent;
  let fixture: ComponentFixture<SuperadminpermissionlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperadminpermissionlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperadminpermissionlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
