export const metadata = {
  title: "Reliance by Tajalli",
  description: "Appliance Reliance MVP"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
