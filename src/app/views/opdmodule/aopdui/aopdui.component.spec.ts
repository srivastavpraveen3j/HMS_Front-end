import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AopduiComponent } from './aopdui.component';

describe('AopduiComponent', () => {
  let component: AopduiComponent;
  let fixture: ComponentFixture<AopduiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AopduiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AopduiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
