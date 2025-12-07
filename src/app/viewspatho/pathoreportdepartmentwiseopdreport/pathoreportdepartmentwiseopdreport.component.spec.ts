import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathoreportdepartmentwiseopdreportComponent } from './pathoreportdepartmentwiseopdreport.component';

describe('PathoreportdepartmentwiseopdreportComponent', () => {
  let component: PathoreportdepartmentwiseopdreportComponent;
  let fixture: ComponentFixture<PathoreportdepartmentwiseopdreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PathoreportdepartmentwiseopdreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathoreportdepartmentwiseopdreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
