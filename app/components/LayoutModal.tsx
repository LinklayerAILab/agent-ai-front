"use client";
import {
  CSSProperties,
  MouseEventHandler,
  ReactNode,
  useEffect,
  useState,
} from "react";
import "./LayoutModal.scss";
import { createPortal } from "react-dom";
import { useKeyDown } from "../hooks/useKeyDown";
import { useDispatch } from "react-redux";
import { setHasModal } from "../store/modalSlice";
import { CloseOutlined } from "@ant-design/icons";
export interface ModalProps {
  onClose: () => void;
  show: boolean | undefined;
  children?: ReactNode;
  close?: ReactNode;
  styles?: CSSProperties;
  clickMaskClose?: boolean; // default false
}



export default function LayoutModal(props: ModalProps) {
  const [modalCls, setModalCls] = useState("");
  const [showModal, setShowModal] = useState<undefined | boolean>();
  const body = document.getElementById("portal-root");
  const dispatch = useDispatch();
  useEffect(() => {
    if (showModal === true) {
      setModalCls("in");
      if (body) body.style.overflow = "hidden";
      dispatch(setHasModal(true));
    } else if (showModal === false) {
      setModalCls("out");
      const t = setTimeout(() => {
        setModalCls("out hidden");
        clearTimeout(t);
      }, 300);
      if (body) body.style.overflow = "";
      dispatch(setHasModal(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, showModal]);
  useEffect(() => {
    if (props.show === true) {
      setShowModal(true);
    } else if (props.show === false && modalCls) {
      setShowModal(false);
    }
    return () => {};
  }, [props.show, modalCls]);

  useKeyDown((e) => {
    if (e.key === "Escape") {
      setShowModal(false);
      props.onClose();
    }
  });
  const handleClose: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    setShowModal(false);
    props.onClose();
  };

  const handleMaskClick: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    if (props.clickMaskClose) {
      setShowModal(false);
      props.onClose();
    }
  };
  return createPortal(
    <div>
      <div
        className={`layout-modal-mask ${modalCls || "hidden"}`}
        onClick={handleMaskClick}
      >
        <div className="w-[100%] h-[100%] flex justify-center items-center">
          <div
            className={`layout-modal ${modalCls || "hidden"}`}
            style={props.styles}
          >
            <div className="relative">
              {props.close || (
                <div className="close" onClick={handleClose}>
                  <CloseOutlined className="text-white" />
                </div>
              )}
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </div>,
    body!
  );
}
