import "@/styles/style.scss";
import Providers from "@/app/providers";
import { HiringConsoleLog } from "@/app/_components";
import { WebVitalsReporter } from "@/features/monitoring";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <HiringConsoleLog />
        <WebVitalsReporter />
        <Providers>{children}</Providers>
        <div id="modal-overlay-container" />
        <div id="modal-dialog-container" />
        <div id="popper-container" />
      </body>
    </html>
  );
}
