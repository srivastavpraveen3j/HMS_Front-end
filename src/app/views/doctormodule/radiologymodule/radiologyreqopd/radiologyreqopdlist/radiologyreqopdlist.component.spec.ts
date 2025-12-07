import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiologyreqopdlistComponent } from './radiologyreqopdlist.component';

describe('RadiologyreqopdlistComponent', () => {
  let component: RadiologyreqopdlistComponent;
  let fixture: ComponentFixture<RadiologyreqopdlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiologyreqopdlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiologyreqopdlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
