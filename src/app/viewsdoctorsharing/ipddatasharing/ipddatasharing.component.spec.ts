import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpddatasharingComponent } from './ipddatasharing.component';

describe('IpddatasharingComponent', () => {
  let component: IpddatasharingComponent;
  let fixture: ComponentFixture<IpddatasharingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpddatasharingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpddatasharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
