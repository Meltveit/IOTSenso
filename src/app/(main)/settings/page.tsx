import SettingsClient from "@/components/settings/SettingsClient";

// Fjerner den overflødige AuthProvider-wrappen.
// SettingsClient vil automatisk motta context fra layout-filen.
export default function SettingsPage() {
  return <SettingsClient />;
}
