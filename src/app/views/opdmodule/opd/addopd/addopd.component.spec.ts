import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddopdComponent } from './addopd.component';

describe('AddopdComponent', () => {
  let component: AddopdComponent;
  let fixture: ComponentFixture<AddopdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddopdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddopdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
