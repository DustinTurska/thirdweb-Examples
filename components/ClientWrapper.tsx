'use client'

import { Card, Tabs, Tab } from "@nextui-org/react";

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientCard({ children }: ClientWrapperProps) {
  return <Card>{children}</Card>;
}

export function ClientTabs({ children }: ClientWrapperProps) {
  return <Tabs>{children}</Tabs>;
}

export function ClientTab({ children, ...props }: ClientWrapperProps & any) {
  return <Tab {...props}>{children}</Tab>;
}