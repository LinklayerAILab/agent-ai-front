// import { message } from "antd"; // 不再使用message组件
export function request<TResponse>(
  url: string,
  // `RequestInit` is a type for configuring
  // a `fetch` request. By default, an empty object.
  config: RequestInit = {},
  options: {
    timeout?: number; // 超时时间（毫秒），默认 60000ms (60秒)
  } = {}

  // This function is async, it will return a Promise:
): Promise<TResponse> {
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeout = options.timeout ?? 60000; // 默认 60 秒
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Add abort signal to config
  config.signal = controller.signal;
  const access_token = localStorage.getItem("access_token");
  const address = localStorage.getItem("address");
  const webAppData = localStorage.getItem("webAppData");

  if (access_token && address) {
    // 确保 config.headers 存在
    if (!config.headers) {
      config.headers = new Headers();
    }
    
    // 将 headers 转换为 Headers 对象以使用 set 方法
    if (!(config.headers instanceof Headers)) {
      config.headers = new Headers(config.headers);
    }
    config.headers.set("Source", '1');
    config.headers.set("Authorization", `Bearer ${access_token || ""}`);
    config.headers.set("Address", `${address || ""}`);
    config.headers.set("Web-App-Data", webAppData
      || ''
    );
  }
  // Inside, we call the `fetch` function with
  // a URL and config given:
  return (
    fetch(url, config)
      // When got a response call a `json` method on it
      .then((response) => {
        clearTimeout(timeoutId); // Clear timeout on successful response
        return response.json();
      })
      // and return the result data.
      .then((data) => {
        if (data.code === 401) {
          // modalFlag = true;
          // message.warning("The login is invalid");
          window.dispatchEvent(new Event('unauthorized'));
          return Promise.reject(data);
        } else if(data.code !== 0) {
          // 不使用message提示错误，由调用方处理
          return Promise.reject(data);
        }
        return data as TResponse;
      }).catch((error) => {
        clearTimeout(timeoutId); // Clear timeout on error
        // 不使用message提示错误，由调用方处理
        console.error(error);
        throw error;
      })
  );

  // We also can use some post-response
  // data-transformations in the last `then` clause.
}

export async function* streamingRequest<TResponse>(
  url: string,
  config: RequestInit = {},
  options: {
    delimiter?: string;
    parseMode?: 'json' | 'ndjson' | 'sse';
    abortController?: AbortController;
    endFun?: () => void;
    timeout?: number; // 超时时间（毫秒），默认 60000ms (60秒)
  } = {},

): AsyncGenerator<TResponse> {
  console.log('🔄 streamingRequest 被调用:', { url, config, options });
  const controller = options.abortController || new AbortController();
  const timeout = options.timeout ?? 60000; // 默认 60 秒
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  config.signal = controller.signal;
  
  const access_token = localStorage.getItem("access_token");
  const address = localStorage.getItem("address");
  const webAppData = localStorage.getItem("webAppData");

  
  if (access_token && address) {
    if (!config.headers) {
      config.headers = new Headers();
    }
    if (!(config.headers instanceof Headers)) {
      config.headers = new Headers(config.headers);
    }
    config.headers.set("Source", '1');
    config.headers.set("Authorization", `Bearer ${access_token}`);
    config.headers.set("Address", address);
    config.headers.set("Web-App-Data", webAppData || '');
  }

  // 添加防止代理缓存的头部
  if (!config.headers) {
    config.headers = new Headers();
  }
  if (!(config.headers instanceof Headers)) {
    config.headers = new Headers(config.headers);
  }
  
  config.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  config.headers.set("Pragma", "no-cache");
  config.headers.set("Expires", "0");
  config.headers.set("X-Accel-Buffering", "no");
  config.headers.set("Accept", "text/event-stream");
  
  // 添加防缓存时间戳
  const urlObj = new URL(url, window.location.origin);
  urlObj.searchParams.set('_t', Date.now().toString());
  const finalUrl = urlObj.toString();

  try {
    console.log('🌐 发起fetch请求:', finalUrl);
    const response = await fetch(finalUrl, config);
    console.log('✅ fetch响应收到:', response.status, response.statusText);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.code === 401) {
        // message.warning("The login is invalid");
        window.dispatchEvent(new Event('unauthorized'));
        throw new Error(errorData.message || 'Unauthorized');
      } else if (errorData.code !== 0) {
        // 不使用message提示错误，由调用方处理
        throw new Error(errorData.message || 'Request failed');
      }
    }
    
    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    const contentType = response.headers.get('content-type');
    const isSSE = contentType?.includes('text/event-stream') || options.parseMode === 'sse';
    
    console.log('开始读取流式数据...', { contentType, isSSE });
    let chunkCount = 0;
    
    while (true) {
      // 检查请求是否被取消
      if (controller.signal.aborted) {
        console.log('🚫 流式请求被取消');
        throw new DOMException('Request aborted', 'AbortError');
      }
      
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('流式数据读取完成');
        break;
      }
      
      chunkCount++;
      const chunk = decoder.decode(value, { stream: true });
      console.log(`🎯 第${chunkCount}个数据块:`, chunk.length, '字节', '时间戳:', Date.now());
      console.log(`🎯 数据块内容预览:`, chunk.substring(0, 200));
      
      buffer += chunk;
      
      if (isSSE) {
        // 实时处理每个完整的SSE事件
        while (buffer.includes('\n\n')) {
          // 再次检查请求是否被取消
          if (controller.signal.aborted) {
            console.log('🚫 SSE处理被取消');
            throw new DOMException('Request aborted', 'AbortError');
          }
          
          const eventEndIndex = buffer.indexOf('\n\n');
          const event = buffer.slice(0, eventEndIndex);
          buffer = buffer.slice(eventEndIndex + 2);
          
          if (event.trim()) {
            console.log('处理单个事件:', event.substring(0, 100) + '...');
            const lines = event.split('\n');
            let eventData = '';
            
            for (const line of lines) {
              if (line.startsWith('data:')) {
                // 提取data:后面的内容，可能有空格也可能没有
                const dataContent = line.startsWith('data: ') ? line.slice(6) : line.slice(5);
                console.log('🔧 提取data行:', JSON.stringify(line));
                console.log('🔧 data内容:', JSON.stringify(dataContent));
                eventData += dataContent;
              }
            }
            
            console.log('🔧 完整eventData:', JSON.stringify(eventData));
            console.log('🔧 eventData长度:', eventData.length);
            
            if (eventData.trim()) {
              try {
                eventData = eventData.trim();
                console.log('🧪 准备解析的eventData:', JSON.stringify(eventData));
                console.log('🧪 eventData长度:', eventData.length);
                const parsedData = JSON.parse(eventData);
                console.log('🔍 解析后的SSE数据:', parsedData);
                
                // 检查是否是消息事件，并提取answer字段
                if (parsedData.event === 'message' && parsedData.answer !== undefined) {
                  console.log('⚡ 准备yield消息内容:', parsedData.answer);
                  yield parsedData as TResponse;
                  console.log('⚡ yield消息内容完成');
                } else if (parsedData.event === 'workflow_started' || 
                          parsedData.event === 'workflow_finished' || 
                          parsedData.event === 'message_end') {
                  // 也yield工作流事件，以便前端可以处理状态
                  console.log('⚡ 准备yield工作流事件:', parsedData.event);
                  yield parsedData as TResponse;
                  console.log('⚡ yield工作流事件完成');
                  options.endFun?.()
                }
              } catch (e) {
                console.warn('❌ JSON解析失败:', eventData, e);
                yield eventData as TResponse;
              }
            }
          }
        }
      } else {
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              console.log('解析到 NDJSON 数据:', data);
              yield data as TResponse;
            } catch (e) {
              console.warn('Failed to parse JSON line:', line, e);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ streamingRequest 错误:', error);
    clearTimeout(timeoutId);
    // 不使用message提示错误，由调用方处理
    throw error;
  }
}
