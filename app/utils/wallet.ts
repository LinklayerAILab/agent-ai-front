/**
 * format化钱packageaddress，Displaybefore6位andafter4位
 * @param address 钱packageaddress
 * @returns format化afteraddress
 */
export function formatAddress(address: string | undefined): string {
  if (!address) return '';
  if (address.length <= 10) return address;
  
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * 复制text到剪贴板
 * @param text 要复制text
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 兼容旧浏览器
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    console.error('复制失败:', error);
    return false;
  }
}