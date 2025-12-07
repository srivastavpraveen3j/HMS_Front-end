import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiotestmastergroupComponent } from './radiotestmastergroup.component';

describe('RadiotestmastergroupComponent', () => {
  let component: RadiotestmastergroupComponent;
  let fixture: ComponentFixture<RadiotestmastergroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiotestmastergroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiotestmastergroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
