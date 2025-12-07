import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicaltestComponent } from './medicaltest.component';

describe('MedicaltestComponent', () => {
  let component: MedicaltestComponent;
  let fixture: ComponentFixture<MedicaltestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicaltestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicaltestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
