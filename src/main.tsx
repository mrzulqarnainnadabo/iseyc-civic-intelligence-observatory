import { StrictMode, useMemo, useState, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import { AdapterContext, LiteContext, initialLite, persistLite } from './lib/hooks';
import { selectAdapter } from './adapters';
import { DataProvider } from './lib/data';
import { AppShell } from './design/layout';
import { Loading } from './design/feedback';

const Overview = lazy(() => import('./pages/Overview'));
const Issues = lazy(() => import('./pages/Issues'));
const Geography = lazy(() => import('./pages/Geography'));
const Evidence = lazy(() => import('./pages/Evidence'));
const Accountability = lazy(() => import('./pages/Accountability'));
const Briefs = lazy(() => import('./pages/Briefs'));

import { adapterSearchFromLocation } from './lib/adapter-search';

function AppRoutes() {
  const location = useLocation();
  const searchKey = adapterSearchFromLocation(location.search, location.hash);
  const adapter = useMemo(() => selectAdapter(searchKey), [searchKey]);
  const [lite, setLiteState] = useState(initialLite);
  const setLite = (v: boolean) => {
    setLiteState(v);
    persistLite(v);
  };

  return (
    <AdapterContext.Provider value={adapter} key={adapter.mode + ':' + adapter.label}>
      <LiteContext.Provider value={{ lite, setLite }}>
        <DataProvider>
          <Suspense fallback={<div className="main"><Loading /></div>}>
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<Overview />} />
                <Route path="issues" element={<Issues />} />
                <Route path="geography" element={<Geography />} />
                <Route path="evidence" element={<Evidence />} />
                <Route path="accountability" element={<Accountability />} />
                <Route path="briefs" element={<Briefs />} />
                <Route
                  path="*"
                  element={
                    <div className="pagehead">
                      <h1>Page not found</h1>
                      <p className="lead">Use the navigation above to return to the Overview.</p>
                    </div>
                  }
                />
              </Route>
            </Routes>
          </Suspense>
        </DataProvider>
      </LiteContext.Provider>
    </AdapterContext.Provider>
  );
}

function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
