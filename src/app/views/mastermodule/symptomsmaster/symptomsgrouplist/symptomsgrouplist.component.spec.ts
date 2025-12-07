import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SymptomsgrouplistComponent } from './symptomsgrouplist.component';

describe('SymptomsgrouplistComponent', () => {
  let component: SymptomsgrouplistComponent;
  let fixture: ComponentFixture<SymptomsgrouplistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SymptomsgrouplistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SymptomsgrouplistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
