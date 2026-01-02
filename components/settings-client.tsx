"use client"

import { useState } from 'react';
import { UserSettings, updateUserSettings } from '@/lib/actions/settings';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

type SettingsClientProps = {
  userId: string;
  initialSettings: UserSettings;
};

export function SettingsClient({ userId, initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [saving, setSaving] = useState(false);

  const handleToggle = async (key: keyof UserSettings, checked: boolean) => {
    const newSettings = { ...settings, [key]: checked };
    setSettings(newSettings);
    
    if (key === 'notificationsPush') {
      await handlePushNotificationsChange(checked);
    }
    
    try {
      await updateUserSettings(userId, newSettings);
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handlePushNotificationsChange = async (checked: boolean) => {
    try {
      if (checked) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        });
        
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription,
            userId
          })
        });
      } else {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endpoint: subscription.endpoint,
              userId
            })
          });
          await subscription.unsubscribe();
        }
      }
    } catch (error) {
      toast.error('Failed to update push notifications');
      console.error(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/profilo" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8">
        <ArrowLeft className="w-4 h-4" />
        Torna al profilo
      </Link>

      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-8">Impostazioni</h1>

        <div className="mb-8 pb-8 border-b border-border">
          <h2 className="text-xl font-semibold mb-6">Notifiche</h2>
          <div className="space-y-4">
            {[
              {
                key: "notificationsEmail" as keyof UserSettings,
                label: "Email per nuove risposte",
                description: "Ricevi email quando qualcuno risponde ai tuoi post",
              },
              {
                key: "notificationsPush" as keyof UserSettings,
                label: "Notifiche push",
                description: "Ricevi notifiche push sul browser",
              },
              {
                key: "newsletter" as keyof UserSettings,
                label: "Newsletter settimanale",
                description: "Ricevi un riepilogo settimanale dell'attività della classe",
              },
            ].map((notif) => (
              <label key={notif.key} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted cursor-pointer">
                {notif.key === "notificationsPush" ? (
                  <Switch 
                    checked={settings[notif.key]} 
                    onCheckedChange={(checked) => handleToggle(notif.key, checked)}
                    disabled={saving}
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={settings[notif.key]}
                    onChange={() => handleToggle(notif.key, !settings[notif.key])}
                    className="w-4 h-4 mt-1 rounded"
                  />
                )}
                <div>
                  <p className="font-medium">{notif.label}</p>
                  <p className="text-sm text-foreground/60">{notif.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-8 pb-8 border-b border-border">
          <h2 className="text-xl font-semibold mb-6">Privacy</h2>
          <div className="space-y-4">
            {[
              {
                key: "publicProfile" as keyof UserSettings,
                label: "Profilo pubblico",
                description: "Consenti agli altri di visualizzare il tuo profilo",
              },
              {
                key: "privateMessages" as keyof UserSettings,
                label: "Messaggi privati",
                description: "Consenti ai compagni di mandarti messaggi privati",
              },
              {
                key: "showActivity" as keyof UserSettings,
                label: "Mostra attività",
                description: "Mostra la tua attività recente agli altri",
              },
            ].map((privacy) => (
              <label key={privacy.key} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[privacy.key]}
                  onChange={() => handleToggle(privacy.key, !settings[privacy.key])}
                  className="w-4 h-4 mt-1 rounded"
                />
                <div>
                  <p className="font-medium">{privacy.label}</p>
                  <p className="text-sm text-foreground/60">{privacy.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={() => {
              // Save all settings
              handleToggle('notificationsPush', settings.notificationsPush);
            }} 
            disabled={saving} 
            className="bg-primary hover:bg-primary/90"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvataggio...
              </>
            ) : (
              "Salva Impostazioni"
            )}
          </Button>
          <Link href="/profilo">
            <Button variant="outline">Annulla</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
