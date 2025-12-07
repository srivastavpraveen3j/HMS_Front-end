import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorsharinglayoutComponent } from './doctorsharinglayout.component';

describe('DoctorsharinglayoutComponent', () => {
  let component: DoctorsharinglayoutComponent;
  let fixture: ComponentFixture<DoctorsharinglayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorsharinglayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorsharinglayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
