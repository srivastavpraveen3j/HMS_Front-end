import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalkinpharmaComponent } from './walkinpharma.component';

describe('WalkinpharmaComponent', () => {
  let component: WalkinpharmaComponent;
  let fixture: ComponentFixture<WalkinpharmaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalkinpharmaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalkinpharmaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
