import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmamedcineserachComponent } from './pharmamedcineserach.component';

describe('PharmamedcineserachComponent', () => {
  let component: PharmamedcineserachComponent;
  let fixture: ComponentFixture<PharmamedcineserachComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmamedcineserachComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmamedcineserachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
