import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockreqCenteralStoreComponent } from './stockreq-centeral-store.component';

describe('StockreqCenteralStoreComponent', () => {
  let component: StockreqCenteralStoreComponent;
  let fixture: ComponentFixture<StockreqCenteralStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockreqCenteralStoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockreqCenteralStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
