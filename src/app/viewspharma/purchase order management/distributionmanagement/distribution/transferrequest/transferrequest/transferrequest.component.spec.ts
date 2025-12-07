import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferrequestComponent } from './transferrequest.component';

describe('TransferrequestComponent', () => {
  let component: TransferrequestComponent;
  let fixture: ComponentFixture<TransferrequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferrequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
