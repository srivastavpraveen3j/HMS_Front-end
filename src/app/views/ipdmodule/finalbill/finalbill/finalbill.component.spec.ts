import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalbillComponent } from './finalbill.component';

describe('FinalbillComponent', () => {
  let component: FinalbillComponent;
  let fixture: ComponentFixture<FinalbillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalbillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinalbillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
