import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicaltestlistComponent } from './medicaltestlist.component';

describe('MedicaltestlistComponent', () => {
  let component: MedicaltestlistComponent;
  let fixture: ComponentFixture<MedicaltestlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicaltestlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicaltestlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
