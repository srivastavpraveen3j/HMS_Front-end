import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedtypemasterComponent } from './bedtypemaster.component';

describe('BedtypemasterComponent', () => {
  let component: BedtypemasterComponent;
  let fixture: ComponentFixture<BedtypemasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedtypemasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedtypemasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
