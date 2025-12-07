import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathologyreqlistComponent } from './pathologyreqlist.component';

describe('PathologyreqlistComponent', () => {
  let component: PathologyreqlistComponent;
  let fixture: ComponentFixture<PathologyreqlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PathologyreqlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathologyreqlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
