import {
  ChangeEventHandler,
  HTMLInputTypeAttribute,
  ReactNode,
  useState,
} from "react";
import "./Input.scss";
interface InputProps {
  value?: string;
  type?: HTMLInputTypeAttribute;
  className?: string;
  placeholder?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onFocus?: () => void;
  onBlur?: () => void;
  rightIcon?: ReactNode;
  disabled?: boolean;
}
const Input = (props: InputProps) => {
  const [focus, setFocus] = useState(false);
  const handleFocus = () => {
    setFocus(true);
    if (props.onFocus) props.onFocus();
  };
  const handleBlur = () => {
    setFocus(false);
    if (props.onBlur) props.onBlur();
  };
  return (
    <div
      className={`input-box flex justify-between items-center relative ${
        props.className
      } ${focus ? "focus" : ""} ${props.disabled ? "disabled" : ""}`}
    >
      <input
        type={props.type || "text"}
        className="block"
        value={props.value}
        onFocus={handleFocus}
        disabled={props.disabled}
        onBlur={handleBlur}
        placeholder={props.placeholder || "Enter"}
        onChange={props.onChange}
      />
      {props.rightIcon ? (
        <div className="absolute right-[0.2vh] top-[0.2vh]">
          {props.rightIcon}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Input;
