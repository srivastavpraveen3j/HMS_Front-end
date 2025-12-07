import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiationreqlistComponent } from './radiationreqlist.component';

describe('RadiationreqlistComponent', () => {
  let component: RadiationreqlistComponent;
  let fixture: ComponentFixture<RadiationreqlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiationreqlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiationreqlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
