import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasteripdserviceComponent } from './masteripdservice.component';

describe('MasteripdserviceComponent', () => {
  let component: MasteripdserviceComponent;
  let fixture: ComponentFixture<MasteripdserviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasteripdserviceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasteripdserviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
