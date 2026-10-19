import React from "react";
import { ThemeProvider } from "@/components/constants/theme-provider";



interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {


  return (
    <div className="min-h-screen bg-white font-sans antialiased overflow-y-hidden">
      <ThemeProvider attribute='class' defaultTheme='root' enableSystem>
        <main>
          {children}
        </main>
      </ThemeProvider>
    </div>
  );
}
