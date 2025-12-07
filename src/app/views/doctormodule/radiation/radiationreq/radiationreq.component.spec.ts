import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiationreqComponent } from './radiationreq.component';

describe('RadiationreqComponent', () => {
  let component: RadiationreqComponent;
  let fixture: ComponentFixture<RadiationreqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiationreqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiationreqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
