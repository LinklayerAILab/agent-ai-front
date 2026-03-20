import { LoadingOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import React from "react";

export default function Star(props: {
  loading: boolean;
  collect: boolean;
  symbol: string;
  onClick: (symbol: string, collect: boolean) => void;
}) {
  return (
    <Spin indicator={<LoadingOutlined spin />} spinning={props.loading} size="default">
      {props.collect ? (
        <StarFilled
          onClick={() => props.onClick(props.symbol, false)}
          className="cursor-pointer text-[16px] lg:text-[18px]"
          style={{ color: props.collect ? "orange" : "gray" }}
        />
      ) : (
        <StarOutlined
          className="cursor-pointer text-[16px] lg:text-[18px]"
          style={{ color: "gray" }}
          onClick={() => props.onClick(props.symbol, true)}
        />
      )}
    </Spin>
  );
}
