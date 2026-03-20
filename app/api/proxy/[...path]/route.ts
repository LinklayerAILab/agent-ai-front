import { NextRequest } from 'next/server';

// 通用flowAPI代理 - handleallHTTPmethod
export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleAPIProxy(request, 'GET', resolvedParams.path);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleAPIProxy(request, 'POST', resolvedParams.path);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleAPIProxy(request, 'PUT', resolvedParams.path);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleAPIProxy(request, 'PATCH', resolvedParams.path);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleAPIProxy(request, 'DELETE', resolvedParams.path);
}

async function handleAPIProxy(request: NextRequest, method: string, pathSegments: string[]) {
  try {
    // 重建原始APIpath
    const apiPath = '/' + pathSegments.join('/');
    
    // build目标URL - based onEnvironmentvariableorconfiguration确定after端service器address
    const url = new URL(request.url);
    
    // 避免自loop：确定正确after端service器address
    let backendUrl: string;
    
    if (process.env.NEXT_PUBLIC_BACKEND_URL) {
      // ifsettings了after端URLEnvironmentvariable，use它
      backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    } else {
      // nothenusedefaultconfiguration，避免与Next.js端口冲突
      const backendPort = process.env.BACKEND_PORT || '8000'; // 默认8000端口
      const backendHost = process.env.BACKEND_HOST || 'localhost';
      backendUrl = `http://${backendHost}:${backendPort}`;
    }
    
    const targetUrl = new URL(`${backendUrl}${apiPath}`);
    // 转发allqueryparameter
    url.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });
    
    // fetchrequest体
    let body: string | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await request.text();
      } catch {
        // 忽略readbodyFailedcase
      }
    }
    
    // 转发request头
    const forwardHeaders = new Headers();
    const skipHeaders = [
      'host', 'connection', 'content-length', 'content-encoding', 
      'transfer-encoding', 'upgrade', 'keep-alive', 'te'
    ];
    
    request.headers.forEach((value, key) => {
      if (!skipHeaders.includes(key.toLowerCase())) {
        forwardHeaders.set(key, value);
      }
    });
    
    // Addflowoptimizationhead
    forwardHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    forwardHeaders.set('Pragma', 'no-cache');
    forwardHeaders.set('X-Accel-Buffering', 'no');
    

    // sendrequest到after端service器
    const response = await fetch(targetUrl.toString(), {
      method,
      headers: forwardHeaders,
      body: body || undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API代理错误: ${response.status} ${response.statusText}`, errorText);
      return new Response(errorText || `Proxy error: ${response.statusText}`, { 
        status: response.status,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // checkisnoforflowresponse
    const contentType = response.headers.get('content-type') || '';
    const isStreamingResponse = contentType.includes('text/event-stream') || 
                               contentType.includes('application/x-ndjson') ||
                               contentType.includes('text/plain');

    if (isStreamingResponse && response.body) {
      
      // flowresponse：零缓冲转发
      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body!.getReader();
          let isClosed = false;

          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                if (!isClosed) {
                  isClosed = true;
                  controller.close();
                }
                break;
              }

              // check controller isno已close
              if (isClosed) {
                break;
              }

              // immediately转发eachdata块
              controller.enqueue(value);
            }
          } catch (error) {
            console.error('API代理流式转发错误:', error);
            if (!isClosed) {
              isClosed = true;
              controller.error(error);
            }
          } finally {
            // 确保 reader 被释放
            try {
              reader.releaseLock();
            } catch (e) {
              // reader possiblealready释放
              console.log(e)
            }
          }
        },
    
      });

      // buildflowresponse头
      const responseHeaders = new Headers();
      
      // 转发重要response头
      response.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (!['connection', 'transfer-encoding', 'content-length'].includes(lowerKey)) {
          responseHeaders.set(key, value);
        }
      });
      
      // 强制settingsflowresponse头
      responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      responseHeaders.set('Pragma', 'no-cache');
      responseHeaders.set('Expires', '0');
      responseHeaders.set('X-Accel-Buffering', 'no');
      responseHeaders.set('Connection', 'keep-alive');

      return new Response(stream, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } else {
      
      // 非flowresponse：正常转发
      const responseBody = await response.arrayBuffer();
      
      const responseHeaders = new Headers();
      response.headers.forEach((value, key) => {
        responseHeaders.set(key, value);
      });

      return new Response(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }

  } catch (error) {
    console.error('API代理严重错误:', error);
    return new Response(`Internal proxy error: ${error.message}`, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}