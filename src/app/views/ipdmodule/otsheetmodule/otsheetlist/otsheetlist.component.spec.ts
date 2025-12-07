import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtsheetlistComponent } from './otsheetlist.component';

describe('OtsheetlistComponent', () => {
  let component: OtsheetlistComponent;
  let fixture: ComponentFixture<OtsheetlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtsheetlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtsheetlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
