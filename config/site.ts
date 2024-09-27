export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "thirdweb Engine Demo",
  description: "Playground for the most powerful tool in web3",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Airdrop",
      href: "/airdrop", 
    },
    {
      label: "NFTs",
      href: "/nfts",
    },
    // {
    //   label: "Pricing",
    //   href: "/pricing",
    // },
    // {
    //   label: "Blog",
    //   href: "/blog",
    // },
    // {
    //   label: "About",
    //   href: "/about",
    // },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/DustinTurska/thirdweb-Examples",
    twitter: "https://x.com/DustinTurska",
    docs: "https://portal.thirdweb.com/engine",
  },
};
