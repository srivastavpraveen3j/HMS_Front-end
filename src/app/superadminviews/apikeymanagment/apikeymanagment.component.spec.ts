import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApikeymanagmentComponent } from './apikeymanagment.component';

describe('ApikeymanagmentComponent', () => {
  let component: ApikeymanagmentComponent;
  let fixture: ComponentFixture<ApikeymanagmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApikeymanagmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApikeymanagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
