import "./MusicAnimate.scss";
interface MusicAnimateProps {
  size?: "big" | "small";
}
export default function MusicAnimate(props: MusicAnimateProps) {
  return (
    <div
      className={`music-animate flex items-end ${
        props.size && props.size === "small" ? "small" : "big"
      } ${
        props.size && props.size === "small"
          ? "gap-[5px] lg:gap-[0.2vw] overflow-hidden  h-[3vh] lg:h-[5vh]"
          : "gap-[2px] lg:gap-[4px] xl:gap-[0.32vw] h-[50px] lg:h-[4vh] xl:h-[5vh]"
      }`}
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
