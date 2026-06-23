import { PageHeader } from "@/components/layout/page-header";
import { MyDeviceCard } from "@/components/attendance/my-device-card";

export default function DeviceSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Device"
        description="Register the device you use to clock in at your store."
      />
      <div className="max-w-xl">
        <MyDeviceCard />
      </div>
    </div>
  );
}
