import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedpackagelistComponent } from './medpackagelist.component';

describe('MedpackagelistComponent', () => {
  let component: MedpackagelistComponent;
  let fixture: ComponentFixture<MedpackagelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedpackagelistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedpackagelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
