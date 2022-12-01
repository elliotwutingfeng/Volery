import "../styles/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <body>{children}</body>
      </head>
    </html>
  );
}
