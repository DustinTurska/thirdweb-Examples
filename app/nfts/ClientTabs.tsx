"use client";

import { Card, Tabs, Tab, Link } from "@nextui-org/react";
import ClaimTo from "@/components/ClaimTo";
import ERC1155ClaimTo from "@/components/ERC1155claimTo";

export default function ClientTabs() {
  return (
    <Card className="bg-black flex flex-col items-center p-4">
      <Tabs aria-label="Airdrop options">
        <Tab key="ERC721" title="ERC721">
          <div className="flex justify-center w-full mb-4">
            <Link
              isExternal
              className="flex items-center gap-1 text-current"
              href="https://github.com/DustinTurska/thirdweb-Engine-Scripts/blob/main/claimTo.ts"
              title="thirdweb ERC721.ClaimTo Engine Script"
            >
              <span className="text-default-600">See</span>
              <p className="text-primary">erc721.claimTo</p>
            </Link>
          </div>
          <div className="flex justify-center w-full mb-4">
            <Link
              isExternal
              className="flex items-center gap-1 text-current"
              href="https://thirdweb.com/holesky/0x48d392f5a1F5Eb3b00A8fbd00073b4882baF364A/nfts"
              title="Engine Demo NFT Drop"
            >
              <span className="text-default-600">View Contract on</span>
              <p className="text-primary">thirdweb</p>
            </Link>
          </div>
          <ClaimTo />
        </Tab>
        <Tab key="ERC1155" title="ERC1155">
          <div className="flex justify-center w-full mb-4">
            <Link
              isExternal
              className="flex items-center gap-1 text-current"
              href="https://github.com/DustinTurska/thirdweb-Engine-Scripts/blob/main/erc1155claimTo.ts"
              title="thirdweb ERC1155.ClaimTo Engine Script"
            >
              <span className="text-default-600">See</span>
              <p className="text-primary">erc1155.claimTo</p>
            </Link>
          </div>
          <div className="flex justify-center w-full mb-4">
            <Link
              isExternal
              className="flex items-center gap-1 text-current"
              href="https://thirdweb.com/holesky/0x14b4478BF17Baf901A7F1ADd1E9FaC54C4d1d329/nfts"
              title="Engine Demo Edition Drop"
            >
              <span className="text-default-600">View Contract on</span>
              <p className="text-primary">thirdweb</p>
            </Link>
          </div>
          <ERC1155ClaimTo />
        </Tab>
      </Tabs>
    </Card>
  );
}
