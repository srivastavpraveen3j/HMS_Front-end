import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiolayoutComponent } from './radiolayout.component';

describe('RadiolayoutComponent', () => {
  let component: RadiolayoutComponent;
  let fixture: ComponentFixture<RadiolayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiolayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiolayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
