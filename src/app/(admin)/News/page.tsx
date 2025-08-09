import News from "@/components/news/news";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ROOM 8"
  };

export default function HomePage() {
  return <News/>;
}


