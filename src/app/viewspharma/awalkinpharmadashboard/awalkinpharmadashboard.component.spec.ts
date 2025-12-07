import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwalkinpharmadashboardComponent } from './awalkinpharmadashboard.component';

describe('AwalkinpharmadashboardComponent', () => {
  let component: AwalkinpharmadashboardComponent;
  let fixture: ComponentFixture<AwalkinpharmadashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AwalkinpharmadashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AwalkinpharmadashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
