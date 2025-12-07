import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpddischargelistComponent } from './ipddischargelist.component';

describe('IpddischargelistComponent', () => {
  let component: IpddischargelistComponent;
  let fixture: ComponentFixture<IpddischargelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpddischargelistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpddischargelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
