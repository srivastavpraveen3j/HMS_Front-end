import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiologyreqopdComponent } from './radiologyreqopd.component';

describe('RadiologyreqopdComponent', () => {
  let component: RadiologyreqopdComponent;
  let fixture: ComponentFixture<RadiologyreqopdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiologyreqopdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiologyreqopdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
