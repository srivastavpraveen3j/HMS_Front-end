import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpduiComponent } from './ipdui.component';

describe('IpduiComponent', () => {
  let component: IpduiComponent;
  let fixture: ComponentFixture<IpduiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpduiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpduiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
