import { DownloadOutlined, ShareAltOutlined } from "@ant-design/icons";

export const CopyGroup = (props: {
  hasTrade?: boolean;
  hasTitle?: boolean;
}) => {
  const handleDownload = () => {
    // Download logic
  };

  const handleShare = () => {
    // Share logic
  };

  return (
    <div className="flex items-center gap-[14px]">
      {/* Download button */}
      <div
        onClick={handleDownload}
        className={`w-[36px] lg:px-[9px] gap-1 lg:w-auto h-[36px] rounded-full border-[1px] border-solid border-black flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors ${props.hasTitle && 'w-[36px]'}`}
      >
        {props.hasTitle && (
          <span className="hidden lg:block font-bold text-[12px]">COPY</span>
        )}{" "}
        <DownloadOutlined style={{ fontSize: "16px" }} />
      </div>

      {/* Share button */}
      <div
        onClick={handleShare}
        className={`w-[36px] lg:px-[9px] gap-1 lg:w-auto h-[36px] rounded-full border-[1px] border-solid border-black flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors ${props.hasTitle && 'w-[36px]'}`}
      >
        {props.hasTitle && (
          <span className="hidden lg:block font-bold text-[12px]">DOWNLOAD</span>
        )}

        <ShareAltOutlined style={{ fontSize: "16px" }} />
      </div>
      {props.hasTrade && (
        <div className={`w-[36px] lg:px-[9px] gap-1 lg:w-auto h-[36px] rounded-full border-[1px] border-solid border-black flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors ${props.hasTitle && 'w-[36px]'}`}>
          {props.hasTitle && (
            <span className="hidden lg:block font-bold text-[12px]">TRADING</span>
          )}

          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="0.511064"
              y="0.511064"
              width="14.9779"
              height="14.9779"
              rx="7.48894"
              fill="#CCFF00"
            />
            <rect
              x="0.511064"
              y="0.511064"
              width="14.9779"
              height="14.9779"
              rx="7.48894"
              stroke="black"
              stroke-width="1.02213"
            />
            <path
              d="M5.62109 10.7332L10.7317 5.62256M10.7317 5.62256H5.62109M10.7317 5.62256V10.7332"
              stroke="black"
              stroke-width="1.53319"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
