declare module 'axios' {
  interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
  }

  interface AxiosError<T = any> extends Error {
    config: any;
    code?: string;
    request?: any;
    response?: AxiosResponse<T>;
    isAxiosError: boolean;
  }

  interface AxiosStatic {
    get<T = any>(url: string): Promise<AxiosResponse<T>>;
    delete(url: string): Promise<AxiosResponse>;
    post<T = any>(url: string, data?: any): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any): Promise<AxiosResponse<T>>;
    isAxiosError(payload: any): payload is AxiosError;
  }

  const axios: AxiosStatic;
  export default axios;
  export { AxiosResponse, AxiosError, AxiosStatic };
} 