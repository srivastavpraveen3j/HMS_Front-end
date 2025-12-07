import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiologyreqlistComponent } from './radiologyreqlist.component';

describe('RadiologyreqlistComponent', () => {
  let component: RadiologyreqlistComponent;
  let fixture: ComponentFixture<RadiologyreqlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiologyreqlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiologyreqlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
