import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdbillComponent } from './ipdbill.component';

describe('IpdbillComponent', () => {
  let component: IpdbillComponent;
  let fixture: ComponentFixture<IpdbillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdbillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdbillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
