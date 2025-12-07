import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathoreportsComponent } from './pathoreports.component';

describe('PathoreportsComponent', () => {
  let component: PathoreportsComponent;
  let fixture: ComponentFixture<PathoreportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PathoreportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathoreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
