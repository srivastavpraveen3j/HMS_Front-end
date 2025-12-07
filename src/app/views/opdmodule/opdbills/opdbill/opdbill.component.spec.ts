import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdbillComponent } from './opdbill.component';

describe('OpdbillComponent', () => {
  let component: OpdbillComponent;
  let fixture: ComponentFixture<OpdbillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdbillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdbillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
