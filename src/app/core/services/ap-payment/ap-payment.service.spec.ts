import { TestBed } from '@angular/core/testing';

import { ApPaymentService } from './ap-payment.service';

describe('ApPaymentService', () => {
  let service: ApPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
