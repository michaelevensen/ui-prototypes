import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");

    if (!url) {
        // if (!url || !url.startsWith("https://d38dx69po70177.cloudfront.net/")) {
        return new Response(
            JSON.stringify({ error: "Invalid or missing URL" }),
            {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }

    try {
        const proxiedRes = await fetch(url);

        console.log(proxiedRes);

        if (!proxiedRes.ok || !proxiedRes.body) {
            return new Response(
                JSON.stringify({ error: "Failed to fetch target video" }),
                {
                    status: proxiedRes.status,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        const headers = new Headers({
            "Content-Type":
                proxiedRes.headers.get("content-type") ||
                "application/octet-stream",
            "Access-Control-Allow-Origin": "*", // ✅ Needed for canvas access
            "Cache-Control": "public, max-age=3600", // optional caching
        });

        return new Response(proxiedRes.body, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error("Proxy error:", error);
        return new Response(JSON.stringify({ error: "Proxy failed" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}
