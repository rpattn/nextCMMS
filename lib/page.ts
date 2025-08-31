export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
  sort?: { empty: boolean; sorted: boolean; unsorted: boolean };
}

export type SearchOperator =
  | 'cn'
  | 'nc'
  | 'eq'
  | 'ne'
  | 'bw'
  | 'bn'
  | 'ew'
  | 'en'
  | 'nu'
  | 'nn'
  | 'gt'
  | 'ge'
  | 'lt'
  | 'le'
  | 'in'
  | 'inm';

export interface FilterField {
  field: string;
  value: any;
  operation: SearchOperator;
  values?: any[];
  enumName?: string;
  joinType?: 'LEFT' | 'RIGHT' | 'INNER' | null;
  alternatives?: FilterField[];
}

export type SortDirection = 'ASC' | 'DESC';
export interface SearchCriteria {
  filterFields: FilterField[];
  direction?: SortDirection;
  pageNum?: number;
  pageSize?: number;
  sortField?: string;
}
