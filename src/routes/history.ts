import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

/**
 * The subset of the react-router v5 `history` object this app ever used.
 * v6+ dropped the prop in favour of `useNavigate`, so class components get
 * this adapter passed down instead.
 */
export interface AppHistory<S = { key: string }> {
  push(path: string, state?: S): void;
  replace(path: string, state?: S): void;
}

export function useAppHistory<S = { key: string }>(): AppHistory<S> {
  const navigate = useNavigate();

  return useMemo(
    () => ({
      push: (path: string, state?: S) => navigate(path, { state }),
      replace: (path: string, state?: S) =>
        navigate(path, { replace: true, state }),
    }),
    [navigate],
  );
}
