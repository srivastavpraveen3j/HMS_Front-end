import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathoreportdepartmentwiseComponent } from './pathoreportdepartmentwise.component';

describe('PathoreportdepartmentwiseComponent', () => {
  let component: PathoreportdepartmentwiseComponent;
  let fixture: ComponentFixture<PathoreportdepartmentwiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PathoreportdepartmentwiseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathoreportdepartmentwiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
