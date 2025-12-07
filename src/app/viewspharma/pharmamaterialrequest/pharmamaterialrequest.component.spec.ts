import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmamaterialrequestComponent } from './pharmamaterialrequest.component';

describe('PharmamaterialrequestComponent', () => {
  let component: PharmamaterialrequestComponent;
  let fixture: ComponentFixture<PharmamaterialrequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmamaterialrequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmamaterialrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
