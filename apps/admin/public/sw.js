/* Online Tech Uganda — admin service worker.
   Shows the owner an alert when an order, registration or request arrives. */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "Online Tech Uganda", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Online Tech Uganda";
  const options = {
    body: data.body || "",
    icon: "/logo-mark.png",
    badge: "/logo-mark.png",
    // A unique tag per alert, so a second order does not replace the first.
    tag: `otu-admin-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    vibrate: [180, 80, 180],
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

/* Tapping the alert opens the screen where it can be dealt with. */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
