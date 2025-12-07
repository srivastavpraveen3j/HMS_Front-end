import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemotherapyComponent } from './chemotherapy.component';

describe('ChemotherapyComponent', () => {
  let component: ChemotherapyComponent;
  let fixture: ComponentFixture<ChemotherapyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChemotherapyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChemotherapyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
