import type { AxiosRequestConfig } from "axios";

export type AxiosBaseQueryArgs = {
  url: string;
  method: AxiosRequestConfig["method"];
  data?: unknown;
  headers?: AxiosRequestConfig["headers"];
};

export type ApiQueryError = {
  status: number;
  message: string;
};
