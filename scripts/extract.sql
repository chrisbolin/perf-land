-- dump 010
SELECT
  summary.url,
  -- comment all fields below this to save on data (x1000), must comment out any payload work in WHERE, too -- 
  startedDateTime,
  urls.Alexa_rank rank2017,
  cdn,
  reqTotal,
  reqHtml,
  reqJS,
  reqCSS,
  reqImg,
  bytesTotal,
  bytesHtml,
  bytesJS,
  bytesCSS,
  bytesImg,
  TTFB,
  JSON_EXTRACT(payload,"$['_lighthouse.Performance']") performanceScore,
  REGEXP_EXTRACT(JSON_EXTRACT(payload,"$['_lighthouse.Performance.first-contentful-paint']"), r"\d*") firstContentfulPaint,
  REGEXP_EXTRACT(JSON_EXTRACT(payload,"$['_lighthouse.Performance.max-potential-fid']"), r"\d*") maxPotentialFirstInputDelay,
  REGEXP_EXTRACT(JSON_EXTRACT(payload,"$['_lighthouse.Performance.speed-index']"), r"\d*") speedIndex,
  REGEXP_EXTRACT(JSON_EXTRACT(payload,"$['_lighthouse.Performance.first-meaningful-paint']"), r"\d*") firstMeaningfulPaint,
  REGEXP_EXTRACT(JSON_EXTRACT(payload,"$['_lighthouse.Performance.first-cpu-idle']"), r"\d*") firstCPUIdle,
  REGEXP_EXTRACT(JSON_EXTRACT(payload,"$['_lighthouse.Performance.interactive']"), r"\d*") timeToInteractive,
FROM
  `httparchive.urls.20170315` urls
INNER JOIN 
  `httparchive.pages.2020_04_01_mobile` pages
  ON NET.REG_DOMAIN(pages.url) = urls.Alexa_domain
INNER JOIN
  `httparchive.summary_pages.2020_04_01_mobile` summary
  ON pages.url=summary.url
WHERE
  LENGTH(summary.url) - LENGTH(REPLACE(summary.url, ".", "")) <= 3 -- no more that 4 domains, including TLD
  AND (
    REGEXP_CONTAINS(summary.url, r"//(?:www|m|blog|shop|app)\.") -- subdomain whitelist
    OR LENGTH(summary.url) - LENGTH(REPLACE(summary.url, ".", "")) = 1 -- root domain, like https://twitter.com
  )
  AND NOT REGEXP_CONTAINS(summary.url, r"porn|xxx|adult")
  AND JSON_EXTRACT(payload,"$['_lighthouse.Performance']") IS NOT NULL -- has lighthouse data
  AND LENGTH(summary.url) <= 76 -- table limits (this doesn't exclude any notable sites)
ORDER BY
   urls.Alexa_rank
LIMIT 1000000
;
