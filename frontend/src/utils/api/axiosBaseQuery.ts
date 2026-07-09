/* eslint-disable @typescript-eslint/no-empty-object-type */
import axios from 'axios';
import type { AxiosError, AxiosInstance } from 'axios';
import type { QueryReturnValue } from '@reduxjs/toolkit/query';
import type { ApiQueryError, AxiosBaseQueryArgs } from '../../types/apiTypes';
import { API_HTTP_BASE_URL, buildApiPath } from '../../config/api';

export const sharedAxiosInstance = axios.create({
  baseURL: API_HTTP_BASE_URL,
  withCredentials: true,
});

export const createAxiosBaseQuery = (
  fallbackMessage: string,
  axiosInstance: AxiosInstance = sharedAxiosInstance,
) => {
  return async <TResponse>({
    url,
    method,
    data,
    params,
    headers,
  }: AxiosBaseQueryArgs): Promise<QueryReturnValue<TResponse, ApiQueryError, {} | undefined>> => {
    try {
      const result = await axiosInstance.request<TResponse>({
        url: buildApiPath(url),
        method,
        data,
        params,
        headers,
      });

      return { data: result.data };
    } catch (axiosError) {
      const error = axiosError as AxiosError<TResponse>;
      const responseData = error.response?.data as { message?: string } | undefined;

      return {
        error: {
          status: error.response?.status ?? 500,
          message: responseData?.message ?? error.message ?? fallbackMessage,
        } as ApiQueryError,
      };
    }
  };
};
