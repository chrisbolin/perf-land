-- example of extract query in BigQuery
SELECT ranks.rank rank2017, summary.*, payload
FROM
`httparchive.pages.2020_03_01_mobile` pages
INNER JOIN 
`httparchive.summary_pages.2017_10_15_mobile` ranks
ON pages.url=ranks.url
INNER JOIN
`httparchive.summary_pages.2020_03_01_mobile` summary
ON summary.url=ranks.url
WHERE
ranks.rank < 10000
ORDER BY ranks.rank;