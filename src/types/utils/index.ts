import axios from '../../services/axios';

export interface ErroProps {
  success: boolean;
  message: string;
  data: null;
  status?: number;
}

export interface PaginateResponse {
  data: any[];
  current_page: number;
  last_page: number;
  from: number | null;
  to: number;
  per_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  total: number;
  first_page_url: string;
  last_page_url: string;
  path: string;
}

export const axiosMethods = {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
} as const;

export type AxiosMethod = keyof typeof axiosMethods;

export interface AxiosSuccessResponse {
  success: boolean;
  message: string;
  data: PaginateResponse | any[];
  status: number;
}

export interface AxiosErrorResponse {
  success: boolean;
  message: string;
  data: any[];
  status: number;
  errors: any;
}

export interface IFindResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
