import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioheaderComponent } from './radioheader.component';

describe('RadioheaderComponent', () => {
  let component: RadioheaderComponent;
  let fixture: ComponentFixture<RadioheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioheaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadioheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
