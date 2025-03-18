export const metadata = {
  title: 'Sentry Instrumentation Example',
  description: 'Sentry Intrumentation',
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
