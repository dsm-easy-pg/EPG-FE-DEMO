import { Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AppShell } from "@/components/app-shell"
import ApiKeys from "@/pages/api-keys"
import Dashboard from "@/pages/dashboard"
import Landing from "@/pages/landing"
import Transactions from "@/pages/transactions"

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="keys" element={<ApiKeys />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="bottom-center" />
    </>
  )
}
