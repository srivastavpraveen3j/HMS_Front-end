import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpddashboardComponent } from './opddashboard.component';

describe('OpddashboardComponent', () => {
  let component: OpddashboardComponent;
  let fixture: ComponentFixture<OpddashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpddashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpddashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
