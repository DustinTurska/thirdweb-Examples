import { title } from "@/components/primitives";
import Airdrop from "@/components/Airdrop";
import ERC20Airdrop from "@/components/ERC20Airdrop";
import ERC721Airdrop from "@/components/ERC721Airdrop"

export default function DocsPage() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="mt-8">
        <Airdrop />
        <ERC20Airdrop isDisabled={true} />
        <ERC721Airdrop isDisabled={true} />
      </div>
    </section>
  );
}
