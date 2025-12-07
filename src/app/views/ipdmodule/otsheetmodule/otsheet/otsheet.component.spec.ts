import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtsheetComponent } from './otsheet.component';

describe('OtsheetComponent', () => {
  let component: OtsheetComponent;
  let fixture: ComponentFixture<OtsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtsheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
