import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdreturnlistComponent } from './ipdreturnlist.component';

describe('IpdreturnlistComponent', () => {
  let component: IpdreturnlistComponent;
  let fixture: ComponentFixture<IpdreturnlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdreturnlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdreturnlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
