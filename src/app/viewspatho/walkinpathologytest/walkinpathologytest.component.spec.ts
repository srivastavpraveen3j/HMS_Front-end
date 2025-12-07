import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalkinpathologytestComponent } from './walkinpathologytest.component';

describe('WalkinpathologytestComponent', () => {
  let component: WalkinpathologytestComponent;
  let fixture: ComponentFixture<WalkinpathologytestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalkinpathologytestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalkinpathologytestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
