import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalkinradiotestComponent } from './walkinradiotest.component';

describe('WalkinradiotestComponent', () => {
  let component: WalkinradiotestComponent;
  let fixture: ComponentFixture<WalkinradiotestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalkinradiotestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalkinradiotestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
