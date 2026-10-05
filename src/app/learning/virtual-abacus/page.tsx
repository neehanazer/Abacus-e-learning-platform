import { Metadata } from "next";
import VirtualAbacus from "@/components/abacus/VirtualAbacus";

export const metadata: Metadata = {
  title: "Virtual Soroban Abacus | MindBeads AI Learning",
  description:
    "Interactive Soroban tool for daily abacus practice, mental math Flash Anzan, and tactile bead visualization.",
};

export default function LearningVirtualAbacusPage() {
  return <VirtualAbacus />;
}
