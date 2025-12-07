import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionlistComponent } from './permissionlist.component';

describe('PermissionlistComponent', () => {
  let component: PermissionlistComponent;
  let fixture: ComponentFixture<PermissionlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
