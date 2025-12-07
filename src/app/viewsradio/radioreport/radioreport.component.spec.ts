import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioreportComponent } from './radioreport.component';

describe('RadioreportComponent', () => {
  let component: RadioreportComponent;
  let fixture: ComponentFixture<RadioreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadioreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
