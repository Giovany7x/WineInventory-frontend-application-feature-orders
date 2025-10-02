import { TestBed } from '@angular/core/testing';

import { ToolbarTitleService } from './toolbar-title.service';

describe('ToolbarTitleService', () => {
  let service: ToolbarTitleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToolbarTitleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
