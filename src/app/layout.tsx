import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Reservas | Parroquia Santo Tomás Moro",
  description: "Agenda los salones de la Parroquia Santo Tomás Moro.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="es" className={poppins.variable}><body>{children}</body></html>;
}
