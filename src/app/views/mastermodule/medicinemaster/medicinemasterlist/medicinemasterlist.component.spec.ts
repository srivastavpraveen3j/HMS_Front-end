import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicinemasterlistComponent } from './medicinemasterlist.component';

describe('MedicinemasterlistComponent', () => {
  let component: MedicinemasterlistComponent;
  let fixture: ComponentFixture<MedicinemasterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicinemasterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicinemasterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
