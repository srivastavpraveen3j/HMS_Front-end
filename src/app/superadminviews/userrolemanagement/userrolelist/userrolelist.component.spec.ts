import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserrolelistComponent } from './userrolelist.component';

describe('UserrolelistComponent', () => {
  let component: UserrolelistComponent;
  let fixture: ComponentFixture<UserrolelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserrolelistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserrolelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
