import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdestimatebillComponent } from './ipdestimatebill.component';

describe('IpdestimatebillComponent', () => {
  let component: IpdestimatebillComponent;
  let fixture: ComponentFixture<IpdestimatebillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdestimatebillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdestimatebillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
