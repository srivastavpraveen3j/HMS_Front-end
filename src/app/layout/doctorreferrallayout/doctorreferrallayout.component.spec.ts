import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorreferrallayoutComponent } from './doctorreferrallayout.component';

describe('DoctorreferrallayoutComponent', () => {
  let component: DoctorreferrallayoutComponent;
  let fixture: ComponentFixture<DoctorreferrallayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorreferrallayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorreferrallayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
