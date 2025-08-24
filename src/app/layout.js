import Script from "next/script";

export const metadata = {
  title: "MakerSpace Delft",
  description: "A platform for managing makerspace resources and bookings",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,shrink-to-fit=no,viewport-fit=cover" />
        {/* CSS Files */}
        <link rel="stylesheet" href="/vendor/bootstrap-4.1.3/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/vendor/materializeicon/material-icons.css" />
        <link id="theme" rel="stylesheet" href="/css/style.css" />
      </head>
      <body className="color-theme-blue push-content-right theme-light">
        {children}
        
        {/* JavaScript Files - Load in correct order */}
        <Script 
          src="/js/jquery-3.2.1.min.js" 
          strategy="beforeInteractive"
          
        />
        
        <Script 
          src="/vendor/cookie/jquery.cookie.js" 
          strategy="beforeInteractive"
          
        />
        
        <Script 
          src="/vendor/bootstrap-4.1.3/js/bootstrap.min.js" 
          strategy="afterInteractive"
          
        />
        
        <Script 
          src="/js/main.js" 
          strategy="afterInteractive"
          
        />
      </body>
    </html>
  );
}
