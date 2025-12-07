import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdreturnComponent } from './ipdreturn.component';

describe('IpdreturnComponent', () => {
  let component: IpdreturnComponent;
  let fixture: ComponentFixture<IpdreturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdreturnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdreturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
