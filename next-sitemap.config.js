/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://dev.khaoyaiart.org',
  generateRobotsTxt: false, // robots.txt is managed manually in public/robots.txt
  outDir: './out',
  exclude: ['/404', '/500'],
  changefreq: 'weekly',
  priority: 0.7,
  transform: async (config, path) => {
    // Higher priority for home and listing pages
    const highPriority = ['/', '/bk', '/kyaf', '/bk/exhibitions', '/kyaf/exhibitions'];
    return {
      loc: path,
      changefreq: highPriority.includes(path) ? 'daily' : 'weekly',
      priority: highPriority.includes(path) ? 1.0 : 0.7,
      lastmod: new Date().toISOString(),
    };
  },
};
