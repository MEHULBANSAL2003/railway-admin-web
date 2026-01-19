import React, {Suspense} from "react";

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AppRoutes />
    </Suspense>
  )
}

export default App
