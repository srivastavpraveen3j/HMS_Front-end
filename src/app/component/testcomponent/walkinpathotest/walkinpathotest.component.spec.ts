import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalkinpathotestComponent } from './walkinpathotest.component';

describe('WalkinpathotestComponent', () => {
  let component: WalkinpathotestComponent;
  let fixture: ComponentFixture<WalkinpathotestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalkinpathotestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalkinpathotestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
