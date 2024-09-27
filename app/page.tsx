import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { button as buttonStyles } from "@nextui-org/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import Airdrop from "@/components/Airdrop";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
      <span className={title({ color: "violet" })}>thirdweb&nbsp;</span>
        <span className={title()}>Engine&nbsp;</span>
        <br />
        <span className={title()}>
        </span>
        <div className={subtitle({ class: "mt-4" })}>
        Performant & secure scalable backend server to connect to the blockchain
        </div>
      </div>

      <div className="mt-8">
        {/* <Airdrop /> */}
      </div>
    </section>
  );
}
