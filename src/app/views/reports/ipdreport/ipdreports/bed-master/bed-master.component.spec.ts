import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedMasterComponent } from './bed-master.component';

describe('BedMasterComponent', () => {
  let component: BedMasterComponent;
  let fixture: ComponentFixture<BedMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
