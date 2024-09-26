'use client';

import { Card, Tabs, Tab } from "@nextui-org/react";
import Airdrop from "@/components/Airdrop";
import ERC20Airdrop from "@/components/ERC20Airdrop";
import ERC721Airdrop from "@/components/ERC721Airdrop";
import ERC1155Airdrop from "@/components/ERC1155Airdrop";

export default function ClientTabs() {
  return (
    <Card className="bg-black flex flex-col items-center p-4">
      <Tabs aria-label="Airdrop options">
        <Tab key="native" title="Native">
          <Airdrop />
        </Tab>
        <Tab key="erc20" title="ERC20">
          <ERC20Airdrop isDisabled={true} />
        </Tab>
        <Tab key="erc721" title="ERC721">
          <ERC721Airdrop isDisabled={true} />
        </Tab>
        <Tab key="erc1155" title="ERC1155">
          <ERC1155Airdrop isDisabled={true} />
        </Tab>
      </Tabs>
    </Card>
  );
}