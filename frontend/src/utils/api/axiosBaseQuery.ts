/* eslint-disable @typescript-eslint/no-empty-object-type */
import axios from "axios";
import type { AxiosError, AxiosInstance } from "axios";
import type { QueryReturnValue } from "@reduxjs/toolkit/query";
import type { ApiQueryError, AxiosBaseQueryArgs } from "../../types/apiTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

export const sharedAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const createAxiosBaseQuery = (
  fallbackMessage: string,
  axiosInstance: AxiosInstance = sharedAxiosInstance
) => {
  return async <TResponse extends { message?: string }>(
    { url, method, data, headers }: AxiosBaseQueryArgs
  ): Promise<QueryReturnValue<TResponse, ApiQueryError, {} | undefined>> => {
    try {
      const result = await axiosInstance.request<TResponse>({
        url,
        method,
        data,
        headers,
      });

      return { data: result.data };
    } catch (axiosError) {
      const error = axiosError as AxiosError<TResponse>;

      return {
        error: {
          status: error.response?.status ?? 500,
          message: error.response?.data?.message ?? error.message ?? fallbackMessage,
        } as ApiQueryError,
      };
    }
  };
};
