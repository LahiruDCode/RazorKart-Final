/// <reference types="@types/react-redux" />
/// <reference types="@types/axios" />
/// <reference types="react-redux" />

declare module '@reduxjs/toolkit' {
  export * from '@reduxjs/toolkit/dist/index';
  export interface ActionReducerMapBuilder<State> {
    addCase<ActionCreator extends (...args: any[]) => any>(
      actionCreator: ActionCreator,
      reducer: (state: State, action: ReturnType<ActionCreator>) => void
    ): ActionReducerMapBuilder<State>;
  }
}

declare module 'react-redux' {
  export { Provider } from 'react-redux/es/exports';
  export { useDispatch, useSelector } from 'react-redux/es/hooks/useSelector';
}

declare module 'react-router-dom';
declare module 'formik';
declare module 'yup'; 