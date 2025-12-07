import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisposedexpiredmedComponent } from './disposedexpiredmed.component';

describe('DisposedexpiredmedComponent', () => {
  let component: DisposedexpiredmedComponent;
  let fixture: ComponentFixture<DisposedexpiredmedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisposedexpiredmedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisposedexpiredmedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
