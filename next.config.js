// Exposes the spec's bare paths (/feed, /swipe, /matches) alongside /api/*.
module.exports = {
  async rewrites() {
    return [
      { source: '/feed', destination: '/api/feed' },
      { source: '/swipe', destination: '/api/swipe' },
      { source: '/matches', destination: '/api/matches' },
    ];
  },
};
