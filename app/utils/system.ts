export type SystemName =
  | "Windows"
  | "Mac"
  | "UNIX"
  | "Linux"
  | "IOS"
  | "Android"
  | "Other";
export type SystemInfo = {
  osName: SystemName;
  isAndroid: boolean;
  isIOS: boolean;
  isWin: boolean;
  isMac: boolean;
  isPC: boolean;
  isMobile: boolean;
};

export function getSystemOsName(): SystemName {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf("Windows") !== -1) return "Windows";
  if (userAgent.indexOf("X11") !== -1) return "UNIX";
  if (userAgent.indexOf("Linux") !== -1) return "Linux";
  if (/(iPhone|iPad|iPod|iOS)/i.test(userAgent)) return "IOS";
  if (/Android/i.test(navigator.userAgent) || /Adr/i.test(navigator.userAgent))
    return "Android";
  if (/macintosh|mac os x/i.test(userAgent)) return "Mac";
  return "Other";
}



export function getSystemInfo(): SystemInfo {
  const osName = getSystemOsName();
  const isAndroid = osName === "Android";
  const isIOS = osName === "IOS";
  const isWin = osName === "Windows";
  const isMac = osName === "Mac";
  const isPC = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? false : true;

    const isMobile = (/Mobi|Android|iPhone/i.test(navigator.userAgent))
    ? true
    : false;
  return {
    osName,
    isAndroid,
    isIOS,
    isWin,
    isMac,
    isPC,
    isMobile,

  };
}
