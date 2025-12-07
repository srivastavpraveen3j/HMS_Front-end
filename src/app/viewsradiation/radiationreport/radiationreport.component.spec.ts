import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiationreportComponent } from './radiationreport.component';

describe('RadiationreportComponent', () => {
  let component: RadiationreportComponent;
  let fixture: ComponentFixture<RadiationreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiationreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiationreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
