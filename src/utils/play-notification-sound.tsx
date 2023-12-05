import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

function detachNotificationAudioElement() {
  const element = document.querySelector("#notification-audio-container");
  if (element) {
    document.removeChild(element);
  }
}

export function playNotificationSound() {
  const notificationSound = require("../img/notification.mp3");
  const element = (
    <audio
      id="notification-audio"
      autoPlay={false}
      src={notificationSound}
      style={{ display: "none" }}
      onEnded={() => {
        detachNotificationAudioElement();
      }}
    />
  );

  const container = document.createElement("div");
  container.id = "notification-audio-container";
  container.innerHTML = renderToStaticMarkup(element);

  document.body.appendChild(container);

  setTimeout(() =>
    (document.querySelector("#notification-audio") as HTMLAudioElement | null)?.play()
  );
}
