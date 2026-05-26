"use client";

import { signOut } from "next-auth/react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export default function SignOutItem() {
  return (
    <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
      Se déconnecter
    </DropdownMenuItem>
  );
}
