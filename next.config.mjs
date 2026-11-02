/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // The /agents capability-map flow was retired when the funnel moved to the
      // capability blueprint. Old links, shared URLs and the /blueprints email
      // footer all land on the replacement.
      // The funnel is "Map your team" now, so the URL says what the button says. The
      // artefact is still called a blueprint; the route it lives at is not.
      { source: '/blueprint', destination: '/map-your-team', permanent: true },
      { source: '/blueprint/:id', destination: '/map-your-team/:id', permanent: true },
      { source: '/agents', destination: '/map-your-team', permanent: true },
      // The scroll-story variant of /mapping replaced the original, so it is /mapping
      // now. The experiment URL was shared while it was being judged.
      { source: '/mapping/story', destination: '/mapping', permanent: true },
      // polynize.ai is internal now (D127): middleware.ts sends every public page on
      // polynize.ai and www to polynize.io (it replaced the homepage entry of 29
      // September). Middleware never sees a path with a dot in it, so the one public
      // HTML file that is not a link sent to someone is sent from here. Host-scoped and
      // anchored, so localhost and previews still serve it.
      {
        source: '/pricing.html',
        has: [{ type: 'host', value: '^(?:www\\.)?polynize\\.ai$' }],
        destination: 'https://polynize.io/',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      { source: '/proposals/:slug', destination: '/proposals/:slug.html' },
      { source: '/pricing', destination: '/pricing.html' },
    ];
  },
  async headers() {
    return [
      {
        /**
         * Keep polynize.ai out of search engines (2 November 2026, D127).
         *
         * Every path on every host this deployment answers on: polynize.ai, www, pam and the
         * vercel.app address. polynize.io is a separate site and this does not reach it.
         * public/robots.txt lets crawlers in on purpose: a page Google may not fetch is a page
         * it never sees this header on, so a page already listed would stay listed. The
         * /proposals and /brand entries below say the same thing and stay, so taking this one
         * out later does not expose them.
         */
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        /**
         * The touch samples, readable cross-origin.
         *
         * An IMPORTED prezie is served under `Content-Security-Policy: sandbox`, which gives it an opaque
         * origin, so fetching its own server's files is a cross-origin request. Without this the clip
         * plays silently, which is the one thing the import exists to fix.
         */
        source: '/pam/sfx/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/proposals/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/brand',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
