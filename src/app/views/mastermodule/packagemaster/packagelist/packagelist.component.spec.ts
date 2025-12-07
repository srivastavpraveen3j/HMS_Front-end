import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagelistComponent } from './packagelist.component';

describe('PackagelistComponent', () => {
  let component: PackagelistComponent;
  let fixture: ComponentFixture<PackagelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackagelistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackagelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
