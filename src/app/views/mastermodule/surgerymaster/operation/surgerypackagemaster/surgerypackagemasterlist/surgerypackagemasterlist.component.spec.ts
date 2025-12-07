import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgerypackagemasterlistComponent } from './surgerypackagemasterlist.component';

describe('SurgerypackagemasterlistComponent', () => {
  let component: SurgerypackagemasterlistComponent;
  let fixture: ComponentFixture<SurgerypackagemasterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurgerypackagemasterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurgerypackagemasterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
