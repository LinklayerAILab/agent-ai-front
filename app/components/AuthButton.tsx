import { Spin } from "antd";

export interface AuthButtonProps {
  text: string;
  icon?: string;
  onClick?: () => void;
  loading?: boolean;
}
export default function AuthButton(props: AuthButtonProps) {
  const handleClick = () => {
    if (typeof props.loading === "boolean") {
      if (props.loading) {
        return;
      } else {
        if (typeof props.onClick === "function") {
          props.onClick();
        }
      }
    } else {
      if (typeof props.onClick === "function") {
        props.onClick();
      }
    }
  };
  return (
    <div
      className={`transition-all duration-300 ease-in-out border-2 border-solid rounded-lg w-full lg:w-[360px] lg:h-[52px] hover:cursor-pointer ${
        props.loading ? "border-gray-600 cursor-not-allowed" : "border-black"
      }`}
      onClick={handleClick}
    >
      <div
        className={`flex ${
          props.icon ? "justify-between" : "justify-center"
        } items-center px-6 h-11 lg:h-[50px] rounded-md transition-all duration-300 ease-in-out gap-2 ${
          props.loading 
            ? "bg-gray-600" 
            : "bg-black hover:translate-x-[3px] hover:-translate-y-[5px]"
        }`}
      >
        <div className="flex items-center text-base text-white gap-2">
          {props.text}
          {props.loading && (
            <Spin spinning={props.loading} size="small" />
          )}
        </div>
        {props.icon ? (
          <div className="flex items-center justify-center rounded-full bg-white text-black w-[30px] h-[30px]">
            <i className={props.icon}></i>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
