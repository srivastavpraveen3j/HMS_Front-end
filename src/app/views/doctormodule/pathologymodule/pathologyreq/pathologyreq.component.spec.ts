import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathologyreqComponent } from './pathologyreq.component';

describe('PathologyreqComponent', () => {
  let component: PathologyreqComponent;
  let fixture: ComponentFixture<PathologyreqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PathologyreqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathologyreqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
