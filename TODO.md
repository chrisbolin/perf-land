### App

- loading indicator
- host on perf.land

### Function

- handle OPTIONS request quickly
- cache responses
  - cloudflare - probably simplest
  - google
    - load balancing
    - CDN

### DB

- sort results by likelihood
  - domain: .com
  - length: return shortest results from search. hey.com first, not hey.com.tw (note that this also serves as a % match too. bk is 40% of bk.com, but only 10% of bkdeals.com). Possibly remove http bias from this
  - alexa domain ranking: i believe this is out of 500,000
