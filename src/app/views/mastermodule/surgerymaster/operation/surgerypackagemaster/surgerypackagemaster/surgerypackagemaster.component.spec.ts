import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgerypackagemasterComponent } from './surgerypackagemaster.component';

describe('SurgerypackagemasterComponent', () => {
  let component: SurgerypackagemasterComponent;
  let fixture: ComponentFixture<SurgerypackagemasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurgerypackagemasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurgerypackagemasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
