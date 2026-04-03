export function request<TResponse>(
  url: string,
  // `RequestInit` is a type for configuring
  // a `fetch` request. By default, an empty object.
  config: RequestInit = {},
  options: {
    timeout?: number; 
  } = {}

  // This function is async, it will return a Promise:
): Promise<TResponse> {
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeout = options.timeout ?? 60000;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Add abort signal to config
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
          return Promise.reject(data);
        }
        return data as TResponse;
      }).catch((error) => {
        clearTimeout(timeoutId); // Clear timeout on error
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
    timeout?: number;
  } = {},

): AsyncGenerator<TResponse> {
  const controller = options.abortController || new AbortController();
  const timeout = options.timeout ?? 60000;
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
  
  const urlObj = new URL(url, window.location.origin);
  urlObj.searchParams.set('_t', Date.now().toString());
  const finalUrl = urlObj.toString();

  try {
    const response = await fetch(finalUrl, config);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.code === 401) {
        // message.warning("The login is invalid");
        window.dispatchEvent(new Event('unauthorized'));
        throw new Error(errorData.message || 'Unauthorized');
      } else if (errorData.code !== 0) {
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
    
    while (true) {
      if (controller.signal.aborted) {
        throw new DOMException('Request aborted', 'AbortError');
      }
      
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
 
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      if (isSSE) {
        while (buffer.includes('\n\n')) {
          if (controller.signal.aborted) {
            throw new DOMException('Request aborted', 'AbortError');
          }
          
          const eventEndIndex = buffer.indexOf('\n\n');
          const event = buffer.slice(0, eventEndIndex);
          buffer = buffer.slice(eventEndIndex + 2);
          
          if (event.trim()) {
            const lines = event.split('\n');
            let eventData = '';
            
            for (const line of lines) {
              if (line.startsWith('data:')) {
                const dataContent = line.startsWith('data: ') ? line.slice(6) : line.slice(5);
                eventData += dataContent;
              }
            }
            
            
            if (eventData.trim()) {
              try {
                eventData = eventData.trim();
                const parsedData = JSON.parse(eventData);
                
                if (parsedData.event === 'message' && parsedData.answer !== undefined) {
                  yield parsedData as TResponse;
                } else if (parsedData.event === 'workflow_started' || 
                          parsedData.event === 'workflow_finished' || 
                          parsedData.event === 'message_end') {
                  yield parsedData as TResponse;
                  options.endFun?.()
                }
              } catch {
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
              yield data as TResponse;
            } catch (e) {
              console.warn('Failed to parse JSON line:', line, e);
            }
          }
        }
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
