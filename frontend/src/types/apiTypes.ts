import type { AxiosRequestConfig } from 'axios';

export type AxiosBaseQueryArgs = {
  url: string;
  method: AxiosRequestConfig['method'];
  data?: unknown;
  params?: AxiosRequestConfig['params'];
  headers?: AxiosRequestConfig['headers'];
};

export type ApiQueryError = {
  status: number;
  message: string;
};

export type ApiPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiResponse<T = unknown, TPagination = ApiPagination> = {
  success?: boolean;
  message?: string;
  data?: T;
  pagination?: TPagination;
  token?: string;
};
