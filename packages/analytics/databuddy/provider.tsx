import { Databuddy } from "@databuddy/sdk/react";
import { keys } from "../keys";

const DATABUDDY_KEY = keys().NEXT_PUBLIC_DATABUDDY_CLIENT_ID;

export const DatabuddyProvider = () => {
  if (!DATABUDDY_KEY) {
    return null;
  }

  return (
    <Databuddy
      clientId={DATABUDDY_KEY}
      enableBatching={true}
      trackBounceRate={true}
      trackOutgoingLinks={true}
    />
  );
};
