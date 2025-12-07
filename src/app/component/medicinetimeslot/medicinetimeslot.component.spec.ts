import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicinetimeslotComponent } from './medicinetimeslot.component';

describe('MedicinetimeslotComponent', () => {
  let component: MedicinetimeslotComponent;
  let fixture: ComponentFixture<MedicinetimeslotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicinetimeslotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicinetimeslotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
