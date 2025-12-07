import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterheaderComponent } from './letterheader.component';

describe('LetterheaderComponent', () => {
  let component: LetterheaderComponent;
  let fixture: ComponentFixture<LetterheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LetterheaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LetterheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
