import { NextRequest } from 'next/server';

// Handle streaming proxy for all HTTP methods
export async function GET(request: NextRequest) {
  return handleStreamProxy(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleStreamProxy(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleStreamProxy(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  return handleStreamProxy(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return handleStreamProxy(request, 'DELETE');
}

async function handleStreamProxy(request: NextRequest, method: string) {
  try {
    const url = new URL(request.url);
    const targetPath = url.searchParams.get('path');
    
    if (!targetPath) {
      return new Response('Missing path parameter', { status: 400 });
    }

    // Build target URL, preserving all query parameters
    const targetUrl = new URL(`http://localhost:3002${targetPath}`);
    url.searchParams.forEach((value, key) => {
      if (key !== 'path') {
        targetUrl.searchParams.set(key, value);
      }
    });
    
    // Fetch request body (if any)
    let body: string | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await request.text();
      } catch {
        // If no body or read fails, continue execution
      }
    }
    
    // Forward request headers, filtering out headers that may cause issues
    const forwardHeaders = new Headers();
    const skipHeaders = [
      'host', 'connection', 'content-length', 'content-encoding', 
      'transfer-encoding', 'upgrade', 'keep-alive'
    ];
    
    request.headers.forEach((value, key) => {
      if (!skipHeaders.includes(key.toLowerCase())) {
        forwardHeaders.set(key, value);
      }
    });
    
    // Force set streaming related headers
    forwardHeaders.set('Accept', 'text/event-stream, text/plain, */*');
    forwardHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    forwardHeaders.set('Pragma', 'no-cache');
    forwardHeaders.set('X-Accel-Buffering', 'no');
    forwardHeaders.set('Connection', 'keep-alive');


    // Send request to target server
    const response = await fetch(targetUrl.toString(), {
      method,
      headers: forwardHeaders,
      body: body || undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Proxy error: ${response.status} ${response.statusText}`, errorText);
      return new Response(`Proxy error: ${response.statusText}`, { 
        status: response.status 
      });
    }

    if (!response.body) {
      return new Response('No response body from target server', { status: 502 });
    }

    // Create true zero-buffer streaming response
    const stream = new ReadableStream({
      start(controller) {
        const reader = response.body!.getReader();
        
        const pump = async (): Promise<void> => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                controller.close();
                break;
              }
              
              // Forward data chunks immediately, zero delay
              controller.enqueue(value);
            }
          } catch (error) {
            console.error('Streaming proxy error:', error);
            controller.error(error);
          }
        };

        pump();
      }
    });

    // Build response headers, maintaining streaming features
    const responseHeaders = new Headers();

    // Forward important response headers
    ['content-type', 'content-encoding', 'content-language'].forEach(headerName => {
      const headerValue = response.headers.get(headerName);
      if (headerValue) {
        responseHeaders.set(headerName, headerValue);
      }
    });
    
    // Force set streaming response headers
    responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    responseHeaders.set('Pragma', 'no-cache');
    responseHeaders.set('Expires', '0');
    responseHeaders.set('X-Accel-Buffering', 'no');
    responseHeaders.set('Connection', 'keep-alive');
    
    // Ensure Content-Type is correct
    if (!responseHeaders.has('content-type')) {
      responseHeaders.set('Content-Type', 'text/event-stream; charset=utf-8');
    }

    
    return new Response(stream, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Critical streaming proxy error:', error);
    return new Response(`Internal proxy error: ${error.message}`, { status: 500 });
  }
}