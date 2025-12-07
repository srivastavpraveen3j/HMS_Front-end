import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpddepositlistComponent } from './ipddepositlist.component';

describe('IpddepositlistComponent', () => {
  let component: IpddepositlistComponent;
  let fixture: ComponentFixture<IpddepositlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpddepositlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpddepositlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
