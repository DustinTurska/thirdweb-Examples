'use client';

import { Card, Tabs, Tab } from "@nextui-org/react";
import ClaimTo from "@/components/ClaimTo";

export default function ClientTabs() {
  return (
    <Card className="bg-black flex flex-col items-center p-4">
      <Tabs aria-label="Airdrop options">
        <Tab key="ERC721" title="ERC721">
          <ClaimTo />
        </Tab>
        <Tab key="ERC1155" title="ERC1155">
        </Tab>
      </Tabs>
    </Card>
  );
}