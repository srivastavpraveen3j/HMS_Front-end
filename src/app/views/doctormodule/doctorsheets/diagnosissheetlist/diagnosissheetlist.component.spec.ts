import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosissheetlistComponent } from './diagnosissheetlist.component';

describe('DiagnosissheetlistComponent', () => {
  let component: DiagnosissheetlistComponent;
  let fixture: ComponentFixture<DiagnosissheetlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagnosissheetlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosissheetlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
