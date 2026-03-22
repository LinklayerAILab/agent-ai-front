"use client";
import "./page.scss";
import people from "@/app/images/graph/people.svg";

import Image from "next/image";
import { Card } from "./Card";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import node from "@/app/images/graph/node.svg";
import invite from "@/app/images/graph/invite.png";
import link1 from "@/app/images/graph/link1.svg";
import link2 from "@/app/images/graph/link2.svg";
// import icon from "@/app/images/graph/icon.svg";
import { BatteryCharging } from "./BatteryCharging";
import { AlphaEmptyState } from "../components/Alpha/AlphaEmptyState";
// import user1 from "@/app/images/graph/user.svg";
// import user2 from "@/app/images/graph/user2.svg";
// import user3 from "@/app/images/graph/user3.svg";
// import user4 from "@/app/images/graph/user4.svg";
// import user5 from "@/app/images/graph/user5.svg";
// import user6 from "@/app/images/graph/user6.svg";
import { PlatformIcons } from "./PlatformIcons";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { inviter_info, inviterInfoResponse, my_invitee_info } from "../api/agent_c";
import { addressDots } from "../utils";
export interface InviteItem {
  address: string;
  icon: string;
  cex_names: string[];
}
function Page() {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLogin = useSelector((state:RootState) => state.user.isLogin)


  const [invites, setInvites] = useState<InviteItem[]>([]);
  const [inviteInfo, setInviteInfo] = useState<inviterInfoResponse>()
  useEffect(() => {
    if(isLogin) {
      inviter_info().then(res => {
        setInviteInfo(res)
      })
      my_invitee_info().then(res => {
        const invitees = res?.data?.invitees || [];
        setInvites(invitees.map((item) => ({
          icon: item.image,
          address: item.user_id ? addressDots(item.user_id, 5, 8) : "---",
          cex_names: item.cex_names || [],
        })));
      }).catch(() => {
        setInvites([]);
      })
    } else {
      setInvites([]);
    }
  },[isLogin])
  return (
    <div className="page-graph flex flex-col-reverse lg:flex-row justify-center items-center lg:px-[2vh] lg:py-[0px] lg:px-0 lg:py-0 lg:h-[100%] w-[100%] gap-[20px]">
      <div className="lg:flex flex-col lg:flex-row lg:gap-[1vh] w-[100%] lg:rounded-[8px] lg:h-[82vh] overflow-hidden bg-[#999999] lg:bg-[#424242]">
        <div className="w-full lg:w-[680px] h-[500px] lg:h-[100%] bg-[#999999] lg:border-[2px] lg:border-black lg:border-solid lg:rounded-[8px] left-box relative">
          <div className="h-[454px] lg:h-[54vh] w-[100%] lg:w-[680px] left-box-bg absolute left-0 right-0 top-[70px] lg:top-[9vh] lg:bottom-[14vh]">
            <div className="flex h-[100%] lg:h-[54vh] w-full justify-center items-center relative">
              <div className="hidden lg:flex absolute right-[-3.1vh] top-[48.7vh] items-center">
                <div className="w-[3.5vw] h-[5px] bg-[#cf0]"></div>
                <Image src={node} alt="" className=""></Image>
              </div>
              <div className="h-[40px] lg:h-[22vh] w-full absolute top-[105px] lg:top-[14vh]">
                <div className="flex lg:gap-[1vh] justify-center relative">
                  <Image
                    src={invite}
                    alt=""
                    className="absolute w-[30px] lg:w-[5vh] left-[50%] ml-[-15px] lg:ml-[-2.5vh] top-[-9px] lg:top-[-1.1vh]"
                  ></Image>
                  <div className="flex items-center justify-center lg:gap-[1vh] h-[150px] lg:h-[25vh] relative w-full lg:w-[45vh] ">
                    {/* <Image src={left} className="h-[23vh] w-[20vh] absolute left-0 top-0" alt=""></Image>
                    <Image src={right} className="h-[23vh] w-[20vh] absolute right-0 top-0" alt=""></Image> */}
                    <div className="w-[280px] w-auto lg:w-full h-[140px] lg:h-[23vh] flex gap-[6px] lg:gap-[1vh]">
                      <div className="flex-1 icon-graph-left w-[132px] lg:w-auto p-[14px] lg:py-[3vh] lg:px-[2vh]">
                        <div className="flex items-center justify-center">
                          <div className="flex relative">
                            {
                              <div className="border-[2px] border-solid border-black rounded-full overflow-hidden">
                                <Image
                              src={inviteInfo?.data.inviter_image || 'https://cdn.linklayer.ai/userimages/0x0000000000000000000000000000000000000000.png'}
                              className="w-[36px] lg:w-[6.3vh] bg-white"
                              width={40}
                              height={40}
                              alt=""
                            ></Image>
                              </div>
                            }
                            
                            <Image
                              src={link1}
                              alt=""
                              className="absolute w-[14px] lg:w-[20px] left-[50%] ml-[-7px] lg:ml-[-10px] bottom-[-7px] lg:bottom-[-10px]"
                            ></Image>
                          </div>
                        </div>
                        <div className="text-[12px] lg:text-[14px] font-bold my-[10px] lg:my-[1.8vh] text-center underline">
                          {inviteInfo?.data.inviter_id ?addressDots(inviteInfo?.data.inviter_id,5,5) : '0x00****00000'}
                        </div>
                        <div className="flex gap-[8px]">
                          <div className="text-[12px] font-bold lg:text-[14px] rounded-[4px] flex-1 flex items-center justify-center">
                            <PlatformIcons activeValues={inviteInfo?.data.cex_names || []}></PlatformIcons>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 icon-graph-right w-[132px] lg:w-auto p-[14px] lg:py-[3vh] lg:px-[2vh]">
                        <div className="flex items-center justify-center">
                          <div className="flex relative">
                    {
                             <div className="border-[2px] border-solid border-black rounded-full overflow-hidden">
                                <Image
                              src={inviteInfo?.data.my_image || 'https://cdn.linklayer.ai/userimages/0x0000000000000000000000000000000000000000.png'}
                              className="w-[36px] lg:w-[6.3vh] bg-white"
                              width={40}
                              height={40}
                              alt=""
                            ></Image>
                              </div>
                            }
                            <Image
                              src={link2}
                              alt=""
                              className="absolute w-[14px] lg:w-[20px] left-[50%] ml-[-7px] lg:ml-[-10px] bottom-[-7px] lg:bottom-[-10px]"
                            ></Image>
                          </div>
                        </div>
                        <div className="text-[12px] lg:text-[14px] font-bold my-[10px] lg:my-[1.8vh] text-center underline">
                                 {inviteInfo?.data.my_user_id ?addressDots(inviteInfo?.data.my_user_id,5,5) : '0x00****00000'}
                        </div>{" "}
                        <div className="flex gap-[8px] px-[0] lg:px-[18px]">
                          <div className="text-[12px] font-bold lg:text-[14px] flex-1 h-[22px] lg:h-[3vh] flex items-center justify-center border-[1px] border-solid border-black rounded-[4px] bg-[#F3E9FF]">
                            {t("graph.myself")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute left-0 top-[283px] lg:top-auto lg:bottom-[6.2vh] right-0 flex items-center justify-center">
                <BatteryCharging></BatteryCharging>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 h-[100%] flex items-center justify-center p-[2vh] rounded-t-[12px] lg:rounded-t-0 bg-[#424242] lg:bg-none">
          <div className="bg-white w-[100%] h-[100%] lg:border-[2px] rounded-[8px] lg:border-solid lg:border-black p-[2vh]">
            <div className="flex justify-between items-center">
              <div className="text-[18px] lg:text-[24px] font-bold">
                {t("graph.myInvite")}
              </div>
              <div className="flex gap-[12px] items-center border-[2px] border-solid border-black rounded-[8px] px-[8px] lg:px-[14px] h-[30px] lg:h-[3.8vh]">
                <Image src={people} className="w-[20px]" alt="people"></Image>
                <span className="text-[16px] font-bold">{invites.length}</span>
              </div>
            </div>
            <div
              ref={scrollContainerRef}
              className={`h-[400px] lg:h-[66vh] overflow-y-auto w-[100%] mt-[2vh] grid content-start grid-cols-1 lg:grid-cols-[repeat(2,minmax(0,1fr))] gap-[14px] lg:gap-x-[2vh] lg:gap-y-[2vh]`}
            >
              {invites.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center border-[2px] border-solid border-black rounded-[8px]">
                  <AlphaEmptyState description={t("alpha.noDataDescription")}  imageClassName="w-[158px] lg:w-[203px]" descriptionClassName="text-[16px] lg:text-[18px]" />
                </div>
              ) : (
                invites.map((item, idx) => <Card key={idx} data={item}></Card>)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
