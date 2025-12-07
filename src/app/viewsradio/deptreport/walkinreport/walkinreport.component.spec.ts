import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalkinreportComponent } from './walkinreport.component';

describe('WalkinreportComponent', () => {
  let component: WalkinreportComponent;
  let fixture: ComponentFixture<WalkinreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalkinreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalkinreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
