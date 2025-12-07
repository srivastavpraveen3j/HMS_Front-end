import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdreceiptComponent } from './ipdreceipt.component';

describe('IpdreceiptComponent', () => {
  let component: IpdreceiptComponent;
  let fixture: ComponentFixture<IpdreceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdreceiptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdreceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
