import AppWrapper from '@/components/AppWrapper'
import ScriptLoader from '@/components/ScriptLoader'

export const metadata = {
  title: "MakerSpace Delft",
  description: "A platform for managing makerspace resources and bookings",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,shrink-to-fit=no,viewport-fit=cover" />
      </head>
      <body className="color-theme-blue push-content-right theme-light">
        <AppWrapper>
          {children}
        </AppWrapper>
        <ScriptLoader />
      </body>
    </html>
  );
}
