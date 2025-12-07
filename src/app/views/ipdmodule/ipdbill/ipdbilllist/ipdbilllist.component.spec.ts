import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdbilllistComponent } from './ipdbilllist.component';

describe('IpdbilllistComponent', () => {
  let component: IpdbilllistComponent;
  let fixture: ComponentFixture<IpdbilllistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdbilllistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdbilllistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
