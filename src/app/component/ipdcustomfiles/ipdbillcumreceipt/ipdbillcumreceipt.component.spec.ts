import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdbillcumreceiptComponent } from './ipdbillcumreceipt.component';

describe('IpdbillcumreceiptComponent', () => {
  let component: IpdbillcumreceiptComponent;
  let fixture: ComponentFixture<IpdbillcumreceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdbillcumreceiptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdbillcumreceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
