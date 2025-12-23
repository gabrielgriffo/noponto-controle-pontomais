import { bootstrapApplication } from "@angular/platform-browser";
import { App } from "./app/app";
import { appConfig } from "./app/app.config";

document.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  return false;
});

bootstrapApplication(App, appConfig).catch((err) =>
  console.error(err),
);
