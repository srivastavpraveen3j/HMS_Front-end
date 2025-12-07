import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddusersrolesComponent } from './addusersroles.component';

describe('AddusersrolesComponent', () => {
  let component: AddusersrolesComponent;
  let fixture: ComponentFixture<AddusersrolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddusersrolesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddusersrolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
