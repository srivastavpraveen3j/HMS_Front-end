import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperadminrolelistComponent } from './superadminrolelist.component';

describe('SuperadminrolelistComponent', () => {
  let component: SuperadminrolelistComponent;
  let fixture: ComponentFixture<SuperadminrolelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperadminrolelistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperadminrolelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
