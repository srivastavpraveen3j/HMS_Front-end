import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasteripdservicelistComponent } from './masteripdservicelist.component';

describe('MasteripdservicelistComponent', () => {
  let component: MasteripdservicelistComponent;
  let fixture: ComponentFixture<MasteripdservicelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasteripdservicelistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasteripdservicelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
