import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrmssidebarComponent } from './hrmssidebar.component';

describe('HrmssidebarComponent', () => {
  let component: HrmssidebarComponent;
  let fixture: ComponentFixture<HrmssidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrmssidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrmssidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
