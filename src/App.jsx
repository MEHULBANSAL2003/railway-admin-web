import React, { Suspense } from "react";
import AppRoutes from "./routes/AppRoutes.jsx";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner.jsx";
import { useAuthInit } from "./hooks/useAuthInit.js";

function App() {
  const { isValidating } = useAuthInit();

  // Show loading spinner while validating tokens
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
