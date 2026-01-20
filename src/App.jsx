import React, {Suspense} from "react";
import AppRoutes from "./routes/AppRoutes.jsx";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner.jsx";

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AppRoutes />
    </Suspense>
  )
}

export default App
