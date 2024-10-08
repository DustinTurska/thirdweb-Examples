'use client';

import { Card, Tabs, Tab, Link } from "@nextui-org/react";
import Airdrop from "@/components/Airdrop";
import ERC20Airdrop from "@/components/ERC20Airdrop";
import ERC721Airdrop from "@/components/ERC721Airdrop";
import ERC1155Airdrop from "@/components/ERC1155Airdrop";

export default function ClientTabs() {
  return (
    <Card className="bg-black flex flex-col items-center p-4">
      <Tabs aria-label="Airdrop options">
        <Tab key="native" title="Native">
          <div className="flex justify-center w-full mb-4">
            <Link
              isExternal
              className="flex items-center gap-1 text-current"
              href="https://github.com/DustinTurska/thirdweb-Engine-Scripts/blob/main/airdropNative.ts"
              title="thirdweb Airdrop Native Engine Script"
            >
              <span className="text-default-600">See</span>
              <p className="text-primary">backendWallet.sendTransactionBatch</p>
            </Link>
          </div>
          <Airdrop />
        </Tab>
        <Tab key="erc20" title="ERC20">
          <div className="flex justify-center w-full mb-4">
            <Link
              isExternal
              className="flex items-center gap-1 text-current"
              href="https://github.com/DustinTurska/thirdweb-Engine-Scripts/blob/main/airdrop.ts"
              title="thirdweb Airdrop ERC20 Engine Script"
            >
              <span className="text-default-600">See</span>
              <p className="text-primary">erc20.mintBatchTo</p>
            </Link>
          </div>
          <ERC20Airdrop isDisabled={true} />
        </Tab>
        <Tab key="erc721" title="ERC721">
          <ERC721Airdrop isDisabled={true} />
        </Tab>
        <Tab key="erc1155" title="ERC1155">
          <div className="flex justify-center w-full mb-4">
            <Link
              isExternal
              className="flex items-center gap-1 text-current"
              href="https://github.com/DustinTurska/thirdweb-Examples/blob/main/app/api/erc1155mintBatchTo/route.ts"
              title="thirdweb Airdrop ERC1155 Engine Script"
            >
              <span className="text-default-600">See</span>
              <p className="text-primary">erc1155.mintBatchTo</p>
            </Link>
          </div>
          <ERC1155Airdrop />
        </Tab>
      </Tabs>
    </Card>
  );
}