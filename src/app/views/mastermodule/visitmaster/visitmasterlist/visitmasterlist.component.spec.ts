import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitmasterlistComponent } from './visitmasterlist.component';

describe('VisitmasterlistComponent', () => {
  let component: VisitmasterlistComponent;
  let fixture: ComponentFixture<VisitmasterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitmasterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitmasterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
