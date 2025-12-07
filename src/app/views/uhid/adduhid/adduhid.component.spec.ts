import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdduhidComponent } from './adduhid.component';

describe('AdduhidComponent', () => {
  let component: AdduhidComponent;
  let fixture: ComponentFixture<AdduhidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdduhidComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdduhidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
