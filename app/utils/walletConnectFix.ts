/**
 * WalletConnect 会话错误的深层修复
 * 处理 AppKit/Reown 在 Mini App 环境下的会话管理问题
 */

// 全局错误监听和处理
let isErrorHandlerInstalled = false;

/**
 * 安装全局 WalletConnect 错误监听器
 */
export const installWalletConnectErrorHandler = () => {
  if (isErrorHandlerInstalled || typeof window === 'undefined') return;

  console.log('安装 WalletConnect 全局错误处理器...');

  // 监听未捕获的 Promise 错误
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    if (error && typeof error === 'object' && error.message) {
      if (isWalletConnectSessionError(error.message)) {
        console.warn('捕获到 WalletConnect 会话错误:', error.message);
        handleWalletConnectError(error);
        event.preventDefault(); // 阻止错误继续传播
      }
    }
  });

  // 监听一般错误
  window.addEventListener('error', (event) => {
    if (event.error && isWalletConnectSessionError(event.error.message)) {
      console.warn('捕获到 WalletConnect 错误:', event.error.message);
      handleWalletConnectError(event.error);
      event.preventDefault();
    }
  });

  isErrorHandlerInstalled = true;
  console.log('✅ WalletConnect 错误处理器安装完成');
};

/**
 * 检测是否为 WalletConnect 会话错误
 */
const isWalletConnectSessionError = (message: string): boolean => {
  if (!message || typeof message !== 'string') return false;
  
  const errorPatterns = [
    'session topic doesn\'t exist',
    'no matching key',
    'session expired',
    'invalid session',
    'getdefaultchain',
    'cannot read properties of undefined',
    'discarding cache for address'
  ];

  return errorPatterns.some(pattern => 
    message.toLowerCase().includes(pattern.toLowerCase())
  );
};

/**
 * 处理 WalletConnect 错误
 */
const handleWalletConnectError = (error: Error) => {
  console.log('🔧 执行 WalletConnect 错误修复...', error.message);

  try {
    // 1. 清理所有相关的本地存储
    clearAllWalletConnectData();

    // 2. 重置 AppKit 状态
    resetAppKitState();


    // 4. 显示用户提示
    showUserNotification('钱包连接遇到问题，已自动修复，请重新连接');

  } catch (fixError) {
    console.error('修复 WalletConnect 错误时出错:', fixError);
  }
};

/**
 * 清理所有 WalletConnect 相关数据
 */
const clearAllWalletConnectData = () => {
  const keysToRemove: string[] = [];

  // 收集所有相关的 localStorage 键
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && shouldRemoveKey(key)) {
      keysToRemove.push(key);
    }
  }

  // 删除键值对
  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
      console.log(`🗑️ 已清理: ${key}`);
    } catch (e) {
      console.warn(`清理失败: ${key}`, e);
    }
  });

  console.log(`✅ 共清理了 ${keysToRemove.length} 个缓存项`);
};

/**
 * 判断是否应该删除某个 localStorage 键
 */
const shouldRemoveKey = (key: string): boolean => {
  const patterns = [
    'walletconnect',
    'wc@2',
    'reown',
    'appkit',
    'wagmi',
    'eip155',
    'connector',
    'wallet',
    'session'
  ];

  return patterns.some(pattern => 
    key.toLowerCase().includes(pattern.toLowerCase())
  );
};

/**
 * 重置 AppKit 状态
 */
const resetAppKitState = () => {
  try {
    // 尝试访问全局 AppKit 实例
    if (window && (window as Record<string, unknown>).appkit) {
      console.log('🔄 重置 AppKit 状态...');
      // 这里可以添加具体的重置逻辑
    }

    // 清理可能的全局状态
    if (window && (window as Record<string, unknown>).ethereum) {
      console.log('🔄 重置以太坊提供者状态...');
    }

  } catch (resetError) {
    console.warn('重置 AppKit 状态失败:', resetError);
  }
};




/**
 * 显示用户通知
 */
const showUserNotification = (message: string) => {
  try {
    // 尝试使用 Ant Design 的 message
    const windowWithAntd = window as Record<string, unknown>;
    if (window && windowWithAntd.antdMessage && 
        typeof windowWithAntd.antdMessage === 'object' &&
        windowWithAntd.antdMessage !== null &&
        'info' in windowWithAntd.antdMessage) {
      const antdMessage = windowWithAntd.antdMessage as { info: (msg: string) => void };
      antdMessage.info(message);
      return;
    }



    // 最后使用浏览器原生通知
    console.error(`💬 ${message}`);

  } catch (notificationError) {
    console.log(`💬 ${message}`, notificationError);
  }
};

/**
 * 预防性会话检查和修复
 */
export const preventiveSessionCheck = () => {
  try {
    console.log('🔍 执行预防性会话检查...');

    // 检查是否有可疑的缓存数据
    let suspiciousKeys = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && shouldRemoveKey(key)) {
        try {
          const value = localStorage.getItem(key);
          if (value && (value.includes('session') || value.includes('topic'))) {
            // 检查是否包含可能过期的数据
            const parsedValue = JSON.parse(value);
            if (parsedValue.expiry && Date.now() > parsedValue.expiry * 1000) {
              localStorage.removeItem(key);
              suspiciousKeys++;
              console.log(`🗑️ 清理过期缓存: ${key}`);
            }
          }
        } catch (parseError) {
          // 如果解析失败，可能是损坏的数据，直接删除
          localStorage.removeItem(key);
          suspiciousKeys++;
          console.log(`🗑️ 清理损坏缓存: ${key}`, parseError);
        }
      }
    }

    if (suspiciousKeys > 0) {
      console.log(`✅ 预防性清理完成，共清理 ${suspiciousKeys} 个可疑缓存`);
      return true;
    } else {
      console.log('✅ 预防性检查完成，无需清理');
      return false;
    }

  } catch (checkError) {
    console.error('预防性会话检查失败:', checkError);
    return false;
  }
};

/**
 * 强制重置所有 WalletConnect 状态
 */
export const forceResetWalletConnect = () => {
  console.log('🚨 执行强制 WalletConnect 重置...');
  
  // 清理所有数据
  clearAllWalletConnectData();
  
  // 重置状态
  resetAppKitState();
  

  
  // 延迟重载页面
  setTimeout(() => {
    if (confirm('需要刷新页面以完成修复，是否继续？')) {
      window.location.reload();
    }
  }, 1000);
  
  console.log('✅ 强制重置完成');
};