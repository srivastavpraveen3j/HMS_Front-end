import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubpharmacyComponent } from './subpharmacy.component';

describe('SubpharmacyComponent', () => {
  let component: SubpharmacyComponent;
  let fixture: ComponentFixture<SubpharmacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubpharmacyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubpharmacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
