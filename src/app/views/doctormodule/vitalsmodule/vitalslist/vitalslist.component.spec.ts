import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VitalslistComponent } from './vitalslist.component';

describe('VitalslistComponent', () => {
  let component: VitalslistComponent;
  let fixture: ComponentFixture<VitalslistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VitalslistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VitalslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
