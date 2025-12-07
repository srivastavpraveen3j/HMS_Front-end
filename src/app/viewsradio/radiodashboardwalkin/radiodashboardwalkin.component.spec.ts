import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiodashboardwalkinComponent } from './radiodashboardwalkin.component';

describe('RadiodashboardwalkinComponent', () => {
  let component: RadiodashboardwalkinComponent;
  let fixture: ComponentFixture<RadiodashboardwalkinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiodashboardwalkinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiodashboardwalkinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
