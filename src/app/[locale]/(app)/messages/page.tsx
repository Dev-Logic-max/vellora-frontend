import { PageHeader } from "@/components/layout/page-header";
import { MessagingView } from "@/components/messaging/messaging-view";

export default function MessagesPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Messages" description="Direct messages, channels, and email." />
      <MessagingView />
    </div>
  );
}
