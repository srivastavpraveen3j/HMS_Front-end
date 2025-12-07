import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalkinpathoinwardComponent } from './walkinpathoinward.component';

describe('WalkinpathoinwardComponent', () => {
  let component: WalkinpathoinwardComponent;
  let fixture: ComponentFixture<WalkinpathoinwardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalkinpathoinwardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalkinpathoinwardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
