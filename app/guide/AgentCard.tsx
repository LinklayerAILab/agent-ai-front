import "./AgentCard.scss";
import right from "@/app/images/agent/right.svg";
import dot from "@/app/images/agent/dots.svg";
import Image from "next/image";
export interface AgentCardPropsItem {
  name: string;
  desc: string;
  img: string;
  selected: boolean;
  id: number;
}
interface AgentCardProps {
  item: AgentCardPropsItem;
  clickAgent?: (item: AgentCardPropsItem) => void;
}
const AgentCard = (props: AgentCardProps) => {
  return (
    <div
      onClick={() => props.clickAgent && props.clickAgent(props.item)}
      className={`h-[124px] lg:h-[27vh] lg:w-[49vh] flex justify-center items-center agent-card rounded-[8px] lg:mb-[20px] relative ${
        props.item.selected ? "active" : ""
      }`}
    >
      <div className="lg:w-[5vh] lg:h-[5vh] rounded-full right-box absolute top-[0.5vh] right-[2vh] flex justify-center items-center">
        <Image src={props.item.selected ? right : dot} alt="" />
      </div>
      <div>
        <div className="flex justify-center items-center h-[60px] lg:h-[14vh]">
          <Image
            src={props.item.img}
            alt={props.item.name}
            className="h-[60px] lg:h-[14vh]"
          />
        </div>
        <div className="text-center text-[12px] lg:text-[14px] font-bold mt-[2vh]">
          {props.item.name}
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
