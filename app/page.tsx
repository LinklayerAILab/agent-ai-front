

import { Metadata } from "next";
// import { Brc20 } from "./components/Brc20/Brc20";
import Alpha from "./components/Alpha/Alpha";
type Props = {
  searchParams:  Promise<{ invite_code?: string }>
};
export async function generateMetadata(
  { searchParams }: Props,
): Promise<Metadata> {
  const {invite_code} = await searchParams;
  let title = ""
  let desc = ""
  let image = ""
  let url = process.env.NEXT_PUBLIC_WALLET_ORIGIN
  if (invite_code) {
    title = "Empowering Web3 Trading with Agent"
    desc = "Driving Agents with real-time strategy token selection and single-token analysis, capturing trading opportunities across market cycles with actionable signal intelligence."
    url = `${url}/?invite_code=${invite_code}`
    image = "https://cdn.linklayer.ai/uploads/20250902150739_24.jpg"
  } else {
    title = "LinkLayerAI - Empowering Web3 with AI"
    desc = "LinkLayerAI-Serve hundreds of millions of  Web3 users Capture trading opportunities across market cycles，powered by high-quality token strategies and actionable signal intelligence."
    image = "https://cdn.linklayer.ai/uploads/photo_2025-12-03_11-29-56.jpg"
  }
  return {
    title,
    description: desc,
    keywords: "LinkLayerAI,LinkLayer,AI,bu,Saas,Agent",
    openGraph: {
      title,
      description: desc,
      url,
      images: [
        {
          url: image,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: desc,
      images: [image],
    }
  };
}


const Page = () => {
  return (
    <div className="flex items-center justify-center w-[100%] h-[100%]">
      <div className="max-w-[100vw] lg:w-[100%] flex justify-between gap-[20px] h-[100%] lg:h-[80vh] mx-[0]">
        <div className="rounded-[8px] w-[100%] h-[100%] lg:h-[80vh] flex flex-col-reverse lg:flex-row lg:px-[2vh]">
          <Alpha />
        </div>
      </div>
    </div>
  );
};

export default Page;
