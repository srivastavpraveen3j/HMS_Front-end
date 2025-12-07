import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioreportsComponent } from './radioreports.component';

describe('RadioreportsComponent', () => {
  let component: RadioreportsComponent;
  let fixture: ComponentFixture<RadioreportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioreportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadioreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
