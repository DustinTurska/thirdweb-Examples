// import { ClientCard, ClientTabs, ClientTab } from "@/components/ClientWrapper";
// import Airdrop from "@/components/Airdrop";
// import ERC20Airdrop from "@/components/ERC20Airdrop";
// import ERC721Airdrop from "@/components/ERC721Airdrop";
// import ERC1155Airdrop from "@/components/ERC1155Airdrop";

// export default function AirdropPage() {
//   return (
//     <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
//       <div className="mt-8 w-full max-w-3xl">
//         <ClientCard>
//           <ClientTabs aria-label="Airdrop options">
//             <ClientTab key="native" title="Native">
//               <Airdrop />
//             </ClientTab>
//             <ClientTab key="erc20" title="ERC20">
//               <ERC20Airdrop isDisabled={true} />
//             </ClientTab>
//             <ClientTab key="erc721" title="ERC721">
//               <ERC721Airdrop isDisabled={true} />
//             </ClientTab>
//             <ClientTab key="erc1155" title="ERC1155">
//               <ERC1155Airdrop isDisabled={true} />
//             </ClientTab>
//           </ClientTabs>
//         </ClientCard>
//       </div>
//     </section>
//   );
// }
import ClientTabs from './ClientTabs';

export default function AirdropPage() {
  return <ClientTabs />;
}