import { ReactNode } from "react";
import { Navbar } from "@/components/navbar";
import { NextIntlClientProvider } from "next-intl";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <NextIntlClientProvider>
        <Navbar />
        {children}
      </NextIntlClientProvider>
    </>
  );
};

export default Layout;
