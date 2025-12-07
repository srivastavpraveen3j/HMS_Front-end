import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdpatientinfoComponent } from './ipdpatientinfo.component';

describe('IpdpatientinfoComponent', () => {
  let component: IpdpatientinfoComponent;
  let fixture: ComponentFixture<IpdpatientinfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdpatientinfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdpatientinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
