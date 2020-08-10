import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckordersComponent } from './checkorders.component';

describe('CheckordersComponent', () => {
  let component: CheckordersComponent;
  let fixture: ComponentFixture<CheckordersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckordersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckordersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
