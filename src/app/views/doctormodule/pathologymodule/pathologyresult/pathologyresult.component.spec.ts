import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathologyresultComponent } from './pathologyresult.component';

describe('PathologyresultComponent', () => {
  let component: PathologyresultComponent;
  let fixture: ComponentFixture<PathologyresultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PathologyresultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathologyresultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
