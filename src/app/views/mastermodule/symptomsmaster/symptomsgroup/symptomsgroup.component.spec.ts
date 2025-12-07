import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SymptomsgroupComponent } from './symptomsgroup.component';

describe('SymptomsgroupComponent', () => {
  let component: SymptomsgroupComponent;
  let fixture: ComponentFixture<SymptomsgroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SymptomsgroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SymptomsgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
