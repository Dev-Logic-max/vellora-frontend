"use client";

import { CheckCircle2, Fingerprint, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyDeviceStatus, useRegisterMyDevice } from "@/features/attendance/device-registration";
import { describePlatform } from "@/lib/device-identity";

/**
 * Employee self-service device registration (point 21). A one-time bind of THIS
 * device so the employee can clock in by scanning a store QR. One click →
 * registered. Shows the current device status when already bound.
 */
export function MyDeviceCard() {
  const { data: status, isLoading } = useMyDeviceStatus();
  const register = useRegisterMyDevice(status?.requireFingerprint ?? false);

  if (isLoading) {
    return <Skeleton className="h-56 w-full rounded-2xl" />;
  }

  if (!status?.isEmployee) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
        Device registration is for employees who clock in. Your account isn&apos;t linked to an
        employee profile.
      </div>
    );
  }

  const reg = status.registration;
  const registered = status.registered;

  const onRegister = async () => {
    try {
      await register.mutateAsync();
      toast.success("Device registered — you can now clock in.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't register this device");
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-linear-to-br from-accent-soft via-surface to-surface px-6 py-4">
        <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
          <Smartphone className="size-5.5" />
        </span>
        <div>
          <h3 className="font-display font-semibold text-foreground">Your clock-in device</h3>
          <p className="text-sm text-muted-foreground">
            Register this device once to clock in by scanning the store QR.
          </p>
        </div>
      </div>

      <div className="space-y-5 p-6">
        {registered && reg ? (
          <>
            <div className="flex items-start gap-3 rounded-xl border border-success/20 bg-success-soft/60 px-4 py-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
              <div>
                <p className="font-medium text-foreground">This account has a registered device</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {reg.label ?? "Registered device"} · since{" "}
                  {new Date(reg.registeredAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              To switch to a new device, ask your HR/admin to reset your registration, then register
              the new device here.
            </p>
          </>
        ) : (
          <>
            <div className="rounded-xl border border-border bg-background px-4 py-3">
              <p className="text-xs text-muted-foreground uppercase">Detected device</p>
              <p className="mt-0.5 font-medium text-foreground">{describePlatform()}</p>
            </div>
            {status.requireFingerprint ? (
              <p className="flex items-start gap-2 rounded-lg bg-info-soft px-3 py-2 text-xs text-info">
                <Fingerprint className="mt-px size-3.5 shrink-0" />
                Your company verifies a device fingerprint for extra security. We&apos;ll capture it
                when you register.
              </p>
            ) : null}
            <Button onClick={onRegister} disabled={register.isPending} className="w-full">
              {register.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Registering…
                </>
              ) : (
                <>
                  <ShieldCheck />
                  Register this device
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              You won&apos;t be able to clock in until your device is registered.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
