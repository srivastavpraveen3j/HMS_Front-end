import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpddischargeComponent } from './ipddischarge.component';

describe('IpddischargeComponent', () => {
  let component: IpddischargeComponent;
  let fixture: ComponentFixture<IpddischargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpddischargeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpddischargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
