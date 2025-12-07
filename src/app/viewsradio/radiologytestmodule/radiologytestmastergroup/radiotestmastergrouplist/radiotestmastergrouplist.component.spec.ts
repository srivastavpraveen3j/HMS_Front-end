import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiotestmastergrouplistComponent } from './radiotestmastergrouplist.component';

describe('RadiotestmastergrouplistComponent', () => {
  let component: RadiotestmastergrouplistComponent;
  let fixture: ComponentFixture<RadiotestmastergrouplistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiotestmastergrouplistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiotestmastergrouplistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
