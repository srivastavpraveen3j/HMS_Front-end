import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatholayoutComponent } from './patholayout.component';

describe('PatholayoutComponent', () => {
  let component: PatholayoutComponent;
  let fixture: ComponentFixture<PatholayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatholayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatholayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
