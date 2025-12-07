import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdfinalbillComponent } from './ipdfinalbill.component';

describe('IpdfinalbillComponent', () => {
  let component: IpdfinalbillComponent;
  let fixture: ComponentFixture<IpdfinalbillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdfinalbillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdfinalbillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
