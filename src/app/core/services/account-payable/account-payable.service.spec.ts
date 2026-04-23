import { TestBed } from '@angular/core/testing';

import { AccountPayableService } from './account-payable.service';

describe('AccountPayableService', () => {
  let service: AccountPayableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountPayableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
