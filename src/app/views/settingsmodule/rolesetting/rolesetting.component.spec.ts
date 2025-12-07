import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesettingComponent } from './rolesetting.component';

describe('RolesettingComponent', () => {
  let component: RolesettingComponent;
  let fixture: ComponentFixture<RolesettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
