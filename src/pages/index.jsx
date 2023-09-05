import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import HomeLayout from "./components/layout";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <HomeLayout>
      <div className="home content">
        <h2>Hello</h2>
        <p>I'm Zup. This is my personal website.</p>
        <br />
        <p>
          I'm a Physics student in National Taiwan University (NTU). I'm now
          learning Javascript and Web development using React.js.{" "}
        </p>
        <br />
        <p>
          The design is inspired by a Taiwanese author, CHU, YU-HSUN (朱宥勳).
          Huge shout out to him.
        </p>
        <br />
        <p>
          Check out his website!{" "}
          <a
            href="https://chuckchu.com.tw/"
            target="_blank"
            rel="noreferrer noopener"
          >
            Click Here
          </a>
        </p>
      </div>
    </HomeLayout>
  );
}
