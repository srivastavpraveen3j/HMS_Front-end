import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoommasterComponent } from './roommaster.component';

describe('RoommasterComponent', () => {
  let component: RoommasterComponent;
  let fixture: ComponentFixture<RoommasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoommasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoommasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
