"use client";

import React from "react";
import { PulseBearProvider, usePulseBear } from "@pulsebear/events";

const EventsPage = () => {
  return (
    <PulseBearProvider appKey="your-app-key">
      <TrackEventButton />
    </PulseBearProvider>
  );
};

const TrackEventButton = () => {
  const { track } = usePulseBear();

  const handleClick = () => {
    track("user_action", {
      action: "button_click",
      description: "User clicked the track button",
      fields: { buttonId: "trackButton" },
    });
  };

  return <button onClick={handleClick}>Track User Action</button>;
};

export default EventsPage;
