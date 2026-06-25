import Header from "@/components/header";
import { AuthProvider } from "@/components/auth-provider";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col">
      <AuthProvider>
        <Header />
      </AuthProvider>
      <div className="flex grow items-center justify-center">
        <h2 className="text-3xl font-semibold">404 | Page Not Found</h2>
      </div>
    </div>
  );
}
