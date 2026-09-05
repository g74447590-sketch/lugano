const STOREFRONT_ORIGIN = "https://lugano-clothing.carlossergiogomesferreira.chatgpt.site";

export default {
  async fetch(request: Request): Promise<Response> {
    const incomingUrl = new URL(request.url);
    const upstreamUrl = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, STOREFRONT_ORIGIN);
    const upstreamResponse = await fetch(new Request(upstreamUrl, request));
    const headers = new Headers(upstreamResponse.headers);
    const location = headers.get("location");

    if (location) {
      const publicOrigin = incomingUrl.origin;
      headers.set("location", location.replace(STOREFRONT_ORIGIN, publicOrigin));
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    });
  },
};
