import React, { Suspense } from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner.jsx';
import { useAuthInit } from './hooks/useAuthInit.js';

function App() {
  const { isValidating } = useAuthInit();

  if (isValidating) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AppRoutes />
    </Suspense>
  );
}

export default App;
