import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiologyreqComponent } from './radiologyreq.component';

describe('RadiologyreqComponent', () => {
  let component: RadiologyreqComponent;
  let fixture: ComponentFixture<RadiologyreqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiologyreqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiologyreqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
