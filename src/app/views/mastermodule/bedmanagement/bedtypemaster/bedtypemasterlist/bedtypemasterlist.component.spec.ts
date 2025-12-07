import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedtypemasterlistComponent } from './bedtypemasterlist.component';

describe('BedtypemasterlistComponent', () => {
  let component: BedtypemasterlistComponent;
  let fixture: ComponentFixture<BedtypemasterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedtypemasterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedtypemasterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
