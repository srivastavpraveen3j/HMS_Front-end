import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadNoteComponent } from './thread-note.component';

describe('ThreadNoteComponent', () => {
  let component: ThreadNoteComponent;
  let fixture: ComponentFixture<ThreadNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadNoteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreadNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
