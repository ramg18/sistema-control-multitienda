import { TestBed } from '@angular/core/testing';

import { ExpenseCategoryService } from './expense-category.service';

describe('ExpenseCategoryService', () => {
  let service: ExpenseCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
