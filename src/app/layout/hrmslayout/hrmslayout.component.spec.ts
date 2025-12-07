import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrmslayoutComponent } from './hrmslayout.component';

describe('HrmslayoutComponent', () => {
  let component: HrmslayoutComponent;
  let fixture: ComponentFixture<HrmslayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrmslayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrmslayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
