import "./globals.css";


export const metadata = {
  title: "Pre Deployment N5 Shield Device Project",
  description: "Pre Deployment N5 Shield Device Project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body >
        {children}
      </body>
    </html>
  );
}
