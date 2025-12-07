import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdmasterserviceComponent } from './ipdmasterservice.component';

describe('IpdmasterserviceComponent', () => {
  let component: IpdmasterserviceComponent;
  let fixture: ComponentFixture<IpdmasterserviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdmasterserviceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdmasterserviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
