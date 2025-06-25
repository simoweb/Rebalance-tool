<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="s">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html>
      <head>
        <title>Sitemap</title>
        <style type="text/css">
          body { font-family: Arial, sans-serif; background: #f9f9f9; color: #222; }
          h1 { color: #2b6cb0; }
          table { border-collapse: collapse; width: 100%; background: #fff; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background: #2b6cb0; color: #fff; }
          tr:nth-child(even) { background: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Sitemap</h1>
        <table>
          <tr>
            <th>URL</th>
            <th>Ultima modifica</th>
            <th>Frequenza</th>
            <th>Priorità</th>
          </tr>
          <xsl:for-each select="s:urlset/s:url">
            <tr>
              <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
              <td><xsl:value-of select="s:lastmod"/></td>
              <td><xsl:value-of select="s:changefreq"/></td>
              <td><xsl:value-of select="s:priority"/></td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet> 