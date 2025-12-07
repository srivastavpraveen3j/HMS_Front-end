import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubphamracyexpiredmedComponent } from './subphamracyexpiredmed.component';

describe('SubphamracyexpiredmedComponent', () => {
  let component: SubphamracyexpiredmedComponent;
  let fixture: ComponentFixture<SubphamracyexpiredmedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubphamracyexpiredmedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubphamracyexpiredmedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
