self.addEventListener("message", event => {
  if (!event.data) {
    return;
  }

  switch (event.data) {
    case "skipWaiting":
      console.info("Skipping waiting at user's request");
      self.skipWaiting();
      break;
    default:
      // NOOP
      break;
  }
});
