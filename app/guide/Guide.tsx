// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import guide from "@/app/images/guide/guide.svg";
import dapp from "@/app/images/guide/dapp.svg";
import miniapp from "@/app/images/guide/miniapp.svg";
import "./Guide.scss";
import AgentCard, { AgentCardPropsItem } from "./AgentCard.tsx";
import { message } from 'antd';
import "video.js/dist/video-js.css";
import videojs from "video.js";
// import video from "./../../assets/video/01.mp4";
const video = "";
// import MaterialSymbolsPlayCircleRounded from "./../../assets/video/MaterialSymbolsPlayCircleRounded.svg"
const Guide = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<null>(null);
  const [messageApi,messageContext] = message.useMessage();
  const [list, setList] = useState<AgentCardPropsItem[]>([
    { name: "Agent Guide", desc: "", img: guide, selected: true, id: 1 },
    { name: "Dapp Guide", desc: "", img: dapp, selected: false, id: 2 },
    { name: "MiniApp Guide", desc: "", img: miniapp, selected: false, id: 3 },
  ]);
  const handleClick = (item: AgentCardPropsItem) => {
    const oldList = [...list];
    oldList.forEach((i) => (i.selected = i.id === item.id));
    setList(oldList);
  };

  useEffect(() => {
    if (videoRef.current) {
      
      playerRef.current = videojs(videoRef.current, {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        fill: true,
      });
      playerRef.current.src({ type: "video/mp4", src: video });
      playerRef.current.on("error", () => {
        const error = playerRef.current?.error();
        if (error) {
          messageApi.error(`Video.js error: ${error.message}`);
        }
      });
    }
  }, [messageApi]);

  return (
    <div className="w-full lg:h-full">
      {messageContext}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center lg:gap-[3vh] lg:h-full">
        <div
          className="rounded-[8px] lg:h-[80vh] w-full lg:w-[52vh] overflow-y-auto card-list"
        >
          {list.map((item, index) => (
            <AgentCard key={index} item={item} clickAgent={handleClick} />
          ))}
        </div>
        <div className="rounded-[8px] h-[500px] mt-[20px] lg:mt-0 lg:h-[80vh] lg:flex-1 chat-box">
          <div className="w-full h-full rounded-[8px] bg-[#F1F1F1] flex flex-col">
            <div className="h-[40px] bg-[#cf0] chat-box-tit"></div>
            <div className="chat-con mx-[14px] lg:mx-[3vh] mb-[14px] lg:mb-[3vh] bg-white flex-1 flex items-center justify-center">
              {/* 内容 */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Guide;
