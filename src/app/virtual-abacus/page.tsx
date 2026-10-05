import { Metadata } from "next";
import VirtualAbacus from "@/components/abacus/VirtualAbacus";

export const metadata: Metadata = {
  title: "Virtual Soroban Abacus | MindBeads AI",
  description:
    "Authentic Virtual Soroban Abacus with 5 Reckoner unit dots, real-time math HUD, tactile bead physics, and 4 interactive training modes.",
};

export default function VirtualAbacusPage() {
  return <VirtualAbacus />;
}
