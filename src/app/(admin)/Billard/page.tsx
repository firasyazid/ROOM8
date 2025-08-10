import Billard from "@/components/Billard/billard";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ROOM 8 - Billard"
  };

export default function HomePage() {
  return <Billard/>;
}


