import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmalayoutComponent } from './pharmalayout.component';

describe('PharmalayoutComponent', () => {
  let component: PharmalayoutComponent;
  let fixture: ComponentFixture<PharmalayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmalayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmalayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
