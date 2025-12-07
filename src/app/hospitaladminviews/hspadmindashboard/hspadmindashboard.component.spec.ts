import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HspadmindashboardComponent } from './hspadmindashboard.component';

describe('HspadmindashboardComponent', () => {
  let component: HspadmindashboardComponent;
  let fixture: ComponentFixture<HspadmindashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HspadmindashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HspadmindashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
