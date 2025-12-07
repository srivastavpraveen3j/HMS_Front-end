import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakereturnComponent } from './makereturn.component';

describe('MakereturnComponent', () => {
  let component: MakereturnComponent;
  let fixture: ComponentFixture<MakereturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MakereturnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MakereturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
