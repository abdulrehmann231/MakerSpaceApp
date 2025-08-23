import AppWrapper from '@/components/AppWrapper'
import Sidebar from '@/components/Sidebar'
import ThemeController from '@/components/ThemeController'
import { Page, BookingModal } from '@/components'

export const metadata = {
  title: "MakerSpace Delft",
  description: "A platform for managing makerspace resources and bookings",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,shrink-to-fit=no,viewport-fit=cover" />
        <link rel="stylesheet" href="/vendor/bootstrap-4.1.3/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/vendor/materializeicon/material-icons.css" />
        <link id="theme" rel="stylesheet" href="/css/style.css" />
        <script src="/js/jquery-3.2.1.min.js"></script>
        <script src="/vendor/bootstrap-4.1.3/js/bootstrap.min.js"></script>
        <script src="/vendor/cookie/jquery.cookie.js"></script>
        <script src="/js/main.js"></script>
      </head>
      <body className="color-theme-blue push-content-right theme-light">
        <AppWrapper>
          <Sidebar firstname="User" />
          <Page>
            {children}
          </Page>
          <BookingModal />
          <ThemeController />
        </AppWrapper>
      </body>
    </html>
  );
}
