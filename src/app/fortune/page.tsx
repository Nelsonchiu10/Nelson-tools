import type { Metadata } from "next";
import FortuneDraw from "./fortune-draw";

export const metadata: Metadata = {
  title: "好運抽籤",
  description: "抽一支籤，看看今天的運勢",
};

export default function FortunePage() {
  return <FortuneDraw />;
}
