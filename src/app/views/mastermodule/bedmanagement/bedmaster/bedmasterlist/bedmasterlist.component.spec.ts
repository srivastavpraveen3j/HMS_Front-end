import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedmasterlistComponent } from './bedmasterlist.component';

describe('BedmasterlistComponent', () => {
  let component: BedmasterlistComponent;
  let fixture: ComponentFixture<BedmasterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedmasterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedmasterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
