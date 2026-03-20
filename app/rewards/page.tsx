"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import * as echarts from "echarts";
import menu from '@/app/images/rewards/menu.svg'
import chart from '@/app/images/rewards/chart.svg'
import "./page.scss";
import { SwapBox } from "../components/SwapBox";
import { message } from "antd";
import rIcon from '@/app/images/rewards/rIcon.svg'
import Image from "next/image";
import { ChartTitle } from "./ChartTitle";
function Page() {
  // const [messageApi,messageContext] = message.useMessage()
  const { t } = useTranslation();
    const [messageApi,messageContext] = message.useMessage()
  useEffect(() => {
    let chart1: echarts.ECharts | null = null;
    let chart2: echarts.ECharts | null = null;
    let chart3: echarts.ECharts | null = null;
    let chart4: echarts.ECharts | null = null;

    // initial化 chart1 - 平滑折线graph
    const chart1Dom = document.getElementById("chart1");
    if (chart1Dom) {
      chart1 = echarts.init(chart1Dom);

      const option1: echarts.EChartsOption = {
        grid: {
          left: "3%",
          right: "4%",
          bottom: "10%",
          top: "20%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: "#666",
            },
          },
          axisLabel: {
            color: "#666",
          },
        },
        yAxis: {
          type: "value",
          axisLine: {
            show: false,
          },
          axisLabel: {
            color: "#666",
            formatter: "{value}",
          },
          splitLine: {
            lineStyle: {
              color: "#edeaeaff",
              width: 1, // 1px 实线
              type: "solid", // 实线样式
            },
          },
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "#ACD700",
          textStyle: {
            color: "#fff",
          },
          // formatter: (params: any) => {
          //   const param = params[0];
          //   return `${param.axisValue}<br/>LLA Supply: ${param.value}`;
          // }
        },
        series: [
          {
            // name: 'LLA Supply',
            type: "line",
            smooth: true, // 平滑曲线
            data: [10000, 1200, 11500, 13800, 15100, 17000, 18500],
            lineStyle: {
              color: "#ACD700",
              width: 1,
            },
            itemStyle: {
              color: "#ACD700",
              borderColor: "#fff",
              borderWidth: 1,
              
            },
            symbol: "circle",
            symbolSize: 0,
          },
        ],
      };

      chart1.setOption(option1);
    }

    // initial化 chart2 - LLA Staking 直线折线graph
    const chart2Dom = document.getElementById("chart2");
    if (chart2Dom) {
      chart2 = echarts.init(chart2Dom);

      // Generate密集模拟data
      let base = +new Date(2023, 0, 1);
      const oneDay = 24 * 3600 * 1000;
      const date: string[] = [];
      const data: number[] = [Math.random() * 500000 + 800000];

      // Addfirst个date，pair应first个data点
      const firstDate = new Date(base);
      date.push([firstDate.getMonth() + 1, firstDate.getDate()].join('/'));

      for (let i = 1; i < 365; i++) {
        const now = new Date((base += oneDay));
        date.push([now.getMonth() + 1, now.getDate()].join('/'));
        const newValue = Math.round((Math.random() - 0.5) * 600000 + data[i - 1]);
        data.push(Math.max(100000, newValue)); // 确保数据不低于100000
      }

      const option2: echarts.EChartsOption = {
        grid: {
          left: "3%",
          right: "4%",
          bottom: "10%",
          top: "20%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: date,
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: "#666",
              width: 1
            },
          },
          axisLabel: {
            color: "#666",
            show: true,
            interval: "auto",
            rotate: 0,
          },
        },
        yAxis: {
          type: "value",
          boundaryGap: [0, "100%"],
          axisLine: {
            show: false,
          },
          axisLabel: {
            color: "#666",
            formatter: "{value}",
          },
          splitLine: {
            lineStyle: {
              color: "#edeaeaff",
              width: 1,
              type: "solid",
            },
          },
        },
        tooltip: {
          trigger: "axis",
          position: function (pt) {
            return [pt[0], "10%"];
          },
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "#84A500",
          textStyle: {
            color: "#fff",
          },
        },
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 100
          },
        ],
        series: [
          {
            type: "line",
            symbol: "none",
            sampling: "lttb",
            data: data,
            itemStyle: {
              color: "#84A500",
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "#cf0",
                },
                {
                  offset: 1,
                  color: "#eff2e4",
                },
              ]),
            },
          },
        ],
      };

      chart2.setOption(option2);
    }

    // initial化 chart3 - LLAx Supply 柱状graph
    const chart3Dom = document.getElementById("chart3");
    if (chart3Dom) {
      chart3 = echarts.init(chart3Dom);

      const option3: echarts.EChartsOption = {
        grid: {
          left: "3%",
          right: "4%",
          bottom: "10%",
          top: "20%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
          axisLine: {
            lineStyle: {
              color: "#666",
            },
          },
          axisLabel: {
            color: "#666",
          },
        },
        yAxis: {
          type: "value",
          axisLine: {
            show: false,
          },
          axisLabel: {
            color: "#666",
            formatter: "{value}",
          },
          splitLine: {
            lineStyle: {
              color: "#edeaeaff",
              width: 1, // 1px 实线
              type: "solid", // 实线样式
            },
          },
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "#E9FF90",
          textStyle: {
            color: "#fff",
          },
          axisPointer: {
            type: "shadow",
          },
        },
        series: [
          {
            type: "bar",
            data: [350000, 480000, 420000, 580000, 650000, 720000, 800000],
            itemStyle: {
              color: (params) => {
                // 奇数index用 #CCFF00，偶数index用 #ACD700
                const colors = ["#CCFF00", "#ACD700"];
                return colors[params.dataIndex % 2];
              },
              borderRadius: [100, 100, 0, 0], // 半圆顶部
            },
            barWidth: "60%",
            label: {
              show: false,
              position: "top",
              color: "#333",
            },
          },
        ],
      };

      chart3.setOption(option3);
    }

    // initial化 chart4 - LLAx-LLA percentage仪表盘
    const chart4Dom = document.getElementById("chart4");
    if (chart4Dom) {
      chart4 = echarts.init(chart4Dom, null, { renderer: "svg" }); // 使用 SVG 渲染器消除锯齿

      const option4: echarts.EChartsOption = {
        series: [
          {
            type: "gauge",
            startAngle: 180,
            endAngle: 0,
            center: ["50%", "65%"],
            radius: "90%",
            min: 0,
            max: 100,
            splitNumber: 10,
            axisLine: {
              lineStyle: {
                width: 26, // 轨道宽度12px，圆角约6px
                color: [
                  [1, "#303030"], // 轨道底色
                ],
                cap: "round", // 圆角端点
                shadowBlur: 0, // 移除阴影
                shadowColor: "transparent", // 透明阴影
                opacity: 1, // 完全不透明
              },
            },
            progress: {
              show: true,
              width: 26, // 宽度8px，圆角约4px
              itemStyle: {
                color: "#cf0", // 激活颜色
                borderWidth: 0, // 移除边框
                shadowBlur: 0, // 移除阴影
                shadowColor: "transparent",
              },
              roundCap: false, // 进度条右侧圆弧
            },
            pointer: {
              show: true, // 启用指针
              length: '75%', // 指针长度
              width: 6, // 指针宽度
              offsetCenter: [-1, -1], // 指针位置偏移
              itemStyle: {
                color: '#333', // 指针颜色
                shadowBlur: 0,
                shadowColor: 'transparent'
              }
            },
            anchor: {
              show: true, // 显示指针锚点（圆心）
              showAbove: true,
              size: 10, // 锚点大小
              itemStyle: {
                color: '#333',
                borderWidth: 3,
                borderColor: '#fff',
                shadowBlur: 0,
                shadowColor: 'transparent'
              }
            },
            axisLabel: {
              show: true, // 显示刻度数字
              distance: -20, // 标签与轨道的距离（负数向内，正数向外）
              color: '#666',
              fontSize: 14,
              formatter: function(value: number) {
                // 只Display 0 and 100
                if (value === 0) {
                  return '{left|0%}'; // 左侧标签使用 left 样式
                } else if (value === 100) {
                  return '{right|100%}'; // 右侧标签使用 right 样式
                }
                return '';
              },
              rich: {
                left: {
                  fontSize: 14,
                  color: '#666',
                  fontWeight: 'bold', // 加粗
                  padding: [30, 0, 0, 0], // 0% 的垂直偏移 [上, 右, 下, 左]
                },
                right: {
                  fontSize: 14,
                  color: '#666',
                  fontWeight: 'bold', // 加粗
                  padding: [30, 0, 0, 0], // 100% 的垂直偏移 [上, 右, 下, 左]
                }
              }
            },
            axisTick: {
              show: false, // 隐藏小刻度线
            },
            splitLine: {
              show: false, // 隐藏大刻度线
            },
            title: {
              show: false,
            },
            detail: {
              show: false, // 隐藏中间的百分比数字
            },
            data: [
              {
                value: 68.5,
                name: "LLAx-LLA",
              },
            ],
          },
        ],
      };

      chart4.setOption(option4);
    }

    // response式调整
    const handleResize = () => {
      chart1?.resize();
      chart2?.resize();
      chart3?.resize();
      chart4?.resize();
    };
    window.addEventListener("resize", handleResize);

    // Clearfunction
    return () => {
      window.removeEventListener("resize", handleResize);
      chart1?.dispose();
      chart2?.dispose();
      chart3?.dispose();
      chart4?.dispose();
    };
  }, []);
  interface TabItem {
    label: string;
    key: string;
    select: boolean;
  }
  const [tabs, setTabs] = useState<TabItem[]>([
    { label: t("exchange.exchange"), key: "swap", select: true },
    { label: t("exchange.stake"), key: "stake", select: false },
  ]);
  const handleTab = (item: TabItem) => {
    if(item.key === 'stake'){
      messageApi.warning(t('common.coming'))
      return
    }
    setTabs(
      tabs.map((e) => ({
        ...e,
        select: e.key === item.key,
      }))
    );
  };

  const selectTab = useMemo(() => tabs.find((item) => item.select), [tabs]);

  return (
    <div className="page-exchange flex flex-col-reverse lg:flex-row justify-center items-center lg:px-[2vh] lg:py-[0px] lg:px-0 lg:py-0 lg:h-[100%] w-[100%] gap-[20px]">
      {messageContext}
      <div className="lg:flex flex-col lg:gap-[1vh] w-[100%] lg:w-[68%] rounded-[8px] lg:h-[82vh] overflow-hidden">
        <div className="h-[120px] lg:h-[16vh] w-[100%] p-[2px] flex gap-[10px] mb-[14px] lg:mb-0">
          <div className="flex-1 flex items-center justify-center border-[2px] border-solid border-black rounded-[4px]">
          <div className="flex flex-col gap-3 lg:gap-2">
              {/* <div className="text-center text-[12px] lh-[24px] lg:text-[18px] font-bold" style={{lineHeight:'24px'}}>
                {t("exchange.llaTotalSupply")}
              </div> */}
              <div className="text-center text-[18px]">soon...</div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center border-[2px] border-solid border-black rounded-[4px]">
          <div className="flex flex-col gap-3 lg:gap-2">
              {/* <div className="text-center text-[12px] lg:text-[18px] font-bold" style={{lineHeight:'24px'}}>
                {t("exchange.llaTotalStaking")}
              </div> */}
              <div className="text-center text-[18px]">soon...</div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center border-[2px] border-solid border-black rounded-[4px]">
            <div className="flex flex-col gap-3 lg:gap-2">
              {/* <div className="text-center text-[12px] lg:text-[18px] font-bold" style={{lineHeight:'24px'}}>
                {t("exchange.llaxTotalSupply")}
              </div> */}
              <div className="text-center text-[18px]">soon...</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row w-[100%] gap-[14px] lg:gap-[1vh] h-[520px] lg:h-[32vh]">
          <div className="relative flex-1 flex">
            <div
              className="flex-1 border-[2px] border-solid border-black rounded-[8px]"
              id="chart1"
            ></div>
            <ChartTitle
              color="bg-[#cf0]"
              position="absolute right-3 top-4"
              title="LLA Supply"
            ></ChartTitle>
          </div>
          <div className="relative flex-1 flex">
            <div
              className="flex-1 border-[2px] border-solid border-black rounded-[8px] relative"
              id="chart2"
            ></div>
            <ChartTitle
              color="bg-[#cf0]"
              position="absolute right-3 top-4"
              title="LLA Staking "
            ></ChartTitle>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row w-[100%] gap-[14px] lg:gap-[1vh] h-[520px] lg:h-[32vh]  mt-[14px] lg:mt-0">
          <div className="relative flex-1 flex">
            <div
              className="flex-1 border-[2px] border-solid border-black rounded-[8px]"
              id="chart3"
            ></div>
            <ChartTitle
              color="bg-[#84A500]"
              position="absolute right-3 top-4"
              title="LLAx Supply "
            ></ChartTitle>
          </div>
     <div className="relative flex-1 flex border-[2px] border-solid border-black rounded-[8px] pt-[6vh] net-bg">
          <div
            className="flex-1 "
            id="chart4"
          ></div>
                <div className="flex items-center absolute justify-center left-0 right-0 top-[3vh] text-[18px] gap-[6px] font-bold"><span>LLAx</span> <Image src={rIcon} alt="rIcon"></Image> <span>LLA</span><span>:--%</span></div>

     </div>

        </div>
      </div>
      <div className="lg:flex lg:border-[2px] lg:border-solid lg:border-black rounded-[8px] bg-white h-auto lg:h-[100%] overflow-hidden flex lg:flex-1 flex-col rounded-[8px] w-[100%] h-[100%] lg:h-[82vh] flex flex-col lg:justify-center lg:items-center gap-[20px] right-box">
        <div className="w-[100%] lg:px-[2vh]">
          <div className="flex w-[100%] relative">
            <div className="absolute right-0 top-[1.2vh] flex items-center gap-2">
              <div className="flex items-center gap-2 h-[24px] lg:h-[2.6vh] px-[8px] rounded-full bg-white justify-center">
                <Image src={menu} className="w-[14px] h-[14px] lg:h-[14px] lg:w-[14px]" alt="menu"></Image>
                <span>0%</span>
              </div>
              <Image src={chart} alt="chart" className="lg:w-[1.6vh] w-[14px] h-[14px] lg:h-[1.6vh]"></Image>
            </div>
            {tabs.map((item) => (
              <div
                key={item.key}
                className={`px-4 py-3 bg-gray-200 tab-item ${item.key} cursor-pointer text-[16px] ${
                  item.select ? "select" : ""
                }`}
                onClick={() => handleTab(item)}
              >
                {item.label}
              </div>
            ))}
          </div>
          <div className="p-4 bg-[#cf0] rounded-b-[8px] rounded-tr-[8px]">
            {selectTab?.key === "swap" ? (
              <SwapBox className="lg:py-[1vh] tab-content" />
            ) : (
              <div className="lg:h-[42vh] bg-[#cf0] tab-content"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
