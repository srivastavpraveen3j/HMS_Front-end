import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalkinopdpharmaComponent } from './walkinopdpharma.component';

describe('WalkinopdpharmaComponent', () => {
  let component: WalkinopdpharmaComponent;
  let fixture: ComponentFixture<WalkinopdpharmaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalkinopdpharmaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalkinopdpharmaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
