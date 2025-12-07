import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodreceivenoteviewComponent } from './goodreceivenoteview.component';

describe('GoodreceivenoteviewComponent', () => {
  let component: GoodreceivenoteviewComponent;
  let fixture: ComponentFixture<GoodreceivenoteviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoodreceivenoteviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoodreceivenoteviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
