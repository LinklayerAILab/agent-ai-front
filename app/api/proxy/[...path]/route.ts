import { NextRequest } from 'next/server';

// Universal streaming API proxy - handle all HTTP methods
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
    // Reconstruct the original API path
    const apiPath = '/' + pathSegments.join('/');

    // Build target URL - determine backend server address based on environment variables or configuration
    const url = new URL(request.url);

    // Avoid self-loop: determine correct backend server address
    let backendUrl: string;

    if (process.env.NEXT_PUBLIC_BACKEND_URL) {
      // If backend URL environment variable is set, use it
      backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    } else {
      // Otherwise use default configuration, avoid conflict with Next.js port
      const backendPort = process.env.BACKEND_PORT || '8000'; // Default port 8000
      const backendHost = process.env.BACKEND_HOST || 'localhost';
      backendUrl = `http://${backendHost}:${backendPort}`;
    }

    const targetUrl = new URL(`${backendUrl}${apiPath}`);
    // Forward all query parameters
    url.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });

    // Fetch request body
    let body: string | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await request.text();
      } catch {
        // Ignore cases where reading body fails
      }
    }

    // Forward request headers
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

    // Add streaming optimization headers
    forwardHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    forwardHeaders.set('Pragma', 'no-cache');
    forwardHeaders.set('X-Accel-Buffering', 'no');


    // Send request to backend server
    const response = await fetch(targetUrl.toString(), {
      method,
      headers: forwardHeaders,
      body: body || undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API proxy error: ${response.status} ${response.statusText}`, errorText);
      return new Response(errorText || `Proxy error: ${response.statusText}`, { 
        status: response.status,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if it's a streaming response
    const contentType = response.headers.get('content-type') || '';
    const isStreamingResponse = contentType.includes('text/event-stream') ||
                               contentType.includes('application/x-ndjson') ||
                               contentType.includes('text/plain');

    if (isStreamingResponse && response.body) {

      // Streaming response: zero-buffer forwarding
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

              // Check if controller is already closed
              if (isClosed) {
                break;
              }

              // Immediately forward each data chunk
              controller.enqueue(value);
            }
          } catch (error) {
            console.error('API proxy streaming forwarding error:', error);
            if (!isClosed) {
              isClosed = true;
              controller.error(error);
            }
          } finally {
            // Ensure reader is released
            try {
              reader.releaseLock();
            } catch (e) {
              // Reader may already be released
              console.log(e)
            }
          }
        },
    
      });

      // Build streaming response headers
      const responseHeaders = new Headers();

      // Forward important response headers
      response.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (!['connection', 'transfer-encoding', 'content-length'].includes(lowerKey)) {
          responseHeaders.set(key, value);
        }
      });

      // Force set streaming response headers
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

      // Non-streaming response: normal forwarding
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
    console.error('API proxy critical error:', error);
    return new Response(`Internal proxy error: ${error.message}`, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}