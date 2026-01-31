import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type {ReactNode} from 'react';

interface PageHeaderState {
  title: string | null;
  right: ReactNode | null;
  actions: ReactNode | null;
}

interface PageHeaderContextType extends PageHeaderState {
  setHeader: (state: PageHeaderState) => void;
  clearHeader: () => void;
}

const PageHeaderContext = createContext<PageHeaderContextType | undefined>(undefined);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PageHeaderState>({
    title: null,
    right: null,
    actions: null,
  });

  const setHeader = useCallback((newState: PageHeaderState) => {
    setState(newState);
  }, []);

  const clearHeader = useCallback(() => {
    setState({ title: null, right: null, actions: null });
  }, []);

  const value = useMemo(() => ({ ...state, setHeader, clearHeader }), [state, setHeader, clearHeader]);

  return (
    <PageHeaderContext.Provider value={value}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  const context = useContext(PageHeaderContext);
  if (!context) {
    // Return a dummy object if provider is missing to prevent crashes
    return { title: null, right: null, actions: null, setHeader: () => {}, clearHeader: () => {} };
  }
  return context;
}