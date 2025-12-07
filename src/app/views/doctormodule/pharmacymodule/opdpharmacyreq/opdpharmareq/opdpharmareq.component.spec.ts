import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdpharmareqComponent } from './opdpharmareq.component';

describe('OpdpharmareqComponent', () => {
  let component: OpdpharmareqComponent;
  let fixture: ComponentFixture<OpdpharmareqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdpharmareqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdpharmareqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
