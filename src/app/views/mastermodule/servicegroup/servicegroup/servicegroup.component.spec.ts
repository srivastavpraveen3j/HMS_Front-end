import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicegroupComponent } from './servicegroup.component';

describe('ServicegroupComponent', () => {
  let component: ServicegroupComponent;
  let fixture: ComponentFixture<ServicegroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicegroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicegroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
