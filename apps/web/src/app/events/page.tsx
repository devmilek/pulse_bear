"use client";

import React from "react";
import { PulseBearProvider, usePulseBear } from "@pulsebear/events";

const EventsPage = () => {
  return (
    <PulseBearProvider apiKey="sk_cme72owgu0000zosec1e46jo5">
      <TrackEventButton />
    </PulseBearProvider>
  );
};

const TrackEventButton = () => {
  const { track } = usePulseBear();

  const handleClick = () => {
    track("bug", {
      action: "button_click",
      description: "User clicked the track button",
      fields: { buttonId: "trackButton" },
    });
  };

  return <button onClick={handleClick}>Track User Action</button>;
};

export default EventsPage;
