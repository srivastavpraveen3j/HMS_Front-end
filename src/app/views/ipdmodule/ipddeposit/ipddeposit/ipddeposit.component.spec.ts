import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpddepositComponent } from './ipddeposit.component';

describe('IpddepositComponent', () => {
  let component: IpddepositComponent;
  let fixture: ComponentFixture<IpddepositComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpddepositComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpddepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
