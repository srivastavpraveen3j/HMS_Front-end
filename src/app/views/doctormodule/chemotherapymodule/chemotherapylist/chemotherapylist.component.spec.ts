import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemotherapylistComponent } from './chemotherapylist.component';

describe('ChemotherapylistComponent', () => {
  let component: ChemotherapylistComponent;
  let fixture: ComponentFixture<ChemotherapylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChemotherapylistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChemotherapylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
