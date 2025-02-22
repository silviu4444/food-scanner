export type Dto<T> = {
  data: T;
};

export type DtoWithPagination<T> = T & {
  lastPage: number;
  page: number;
  total: number;
};
