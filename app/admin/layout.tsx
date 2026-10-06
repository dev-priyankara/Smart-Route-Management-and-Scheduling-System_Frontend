import { AppShell } from "@/ui/AppShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      title="System Administrator"
      subtitle="Complete system management, user administration, and depot oversight"
    >
      {children}
    </AppShell>
  );
}
