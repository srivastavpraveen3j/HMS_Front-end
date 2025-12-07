import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicinemasterComponent } from './medicinemaster.component';

describe('MedicinemasterComponent', () => {
  let component: MedicinemasterComponent;
  let fixture: ComponentFixture<MedicinemasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicinemasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicinemasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
