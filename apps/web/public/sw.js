/* Online Tech Uganda — service worker for Web Push notifications. */

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
    icon: "/icon-192.png",
    badge: "/favicon-32.png",
    image: data.image || undefined,
    tag: "otu-offer",
    renotify: true,
    data: { url: data.url || "/shop" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

/* Tapping the notification opens (or focuses) the shop. */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/shop";
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
