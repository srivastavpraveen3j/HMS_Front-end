import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdpharmadashboardComponent } from './opdpharmadashboard.component';

describe('OpdpharmadashboardComponent', () => {
  let component: OpdpharmadashboardComponent;
  let fixture: ComponentFixture<OpdpharmadashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdpharmadashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdpharmadashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
