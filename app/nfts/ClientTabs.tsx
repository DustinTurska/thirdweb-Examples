"use client";

import { Card, Tabs, Tab, Link } from "@nextui-org/react";
import ClaimTo from "@/components/ClaimTo";

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
          <ClaimTo />
        </Tab>
        <Tab key="ERC1155" title="ERC1155"></Tab>
      </Tabs>
    </Card>
  );
}