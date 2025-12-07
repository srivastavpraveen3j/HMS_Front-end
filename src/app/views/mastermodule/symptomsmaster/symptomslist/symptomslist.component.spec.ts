import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SymptomslistComponent } from './symptomslist.component';

describe('SymptomslistComponent', () => {
  let component: SymptomslistComponent;
  let fixture: ComponentFixture<SymptomslistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SymptomslistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SymptomslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
