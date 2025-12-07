import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmadashboardComponent } from './pharmadashboard.component';

describe('PharmadashboardComponent', () => {
  let component: PharmadashboardComponent;
  let fixture: ComponentFixture<PharmadashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmadashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmadashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
