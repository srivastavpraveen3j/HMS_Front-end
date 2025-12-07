import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoutsecurityComponent } from './logoutsecurity.component';

describe('LogoutsecurityComponent', () => {
  let component: LogoutsecurityComponent;
  let fixture: ComponentFixture<LogoutsecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoutsecurityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoutsecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
