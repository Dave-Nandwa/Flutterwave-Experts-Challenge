import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlutterwaveComponent } from './flutterwave.component';

describe('FlutterwaveComponent', () => {
  let component: FlutterwaveComponent;
  let fixture: ComponentFixture<FlutterwaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlutterwaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlutterwaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
