import { useSyncExternalStore } from "react";

const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 1000);
  return () => window.clearInterval(timer);
}

/** The time in Dhaka as "HH:MM". Empty until the page is running in the browser. */
export function useDhakaTime() {
  return useSyncExternalStore(
    subscribe,
    () => clock.format(Date.now()),
    () => "",
  );
}
