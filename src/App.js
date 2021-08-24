import React, { Component } from 'react';
import SwaggerUI from 'swagger-ui-react';
import Config from './organization_config.json';
import ApisConfig from './apis_config.json';
import Sidebar from './Sidebar.js'
import crypto from 'crypto-js';

const AWS_ACCESS_KEY_ID = "AKIARTD76VJNX4XVTCVT"
const AWS_SECRET_ACCESS_KEY = "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"
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organizationConfig: null,
      definitionList: null,
      clickedApi: null,
      definitionLink: null //"https://miguel-swagger.s3.amazonaws.com/swagger.json"
    }
    this.swaggerhub = this.swaggerhub.bind(this)
    this.getOrganizationData = this.getOrganizationData.bind(this)
    this.updateDefinitionLink = this.updateDefinitionLink.bind(this)
    this.getSwaggerRequest = this.getSwaggerRequest.bind(this)
  }

  componentWillMount() {
    this.setState({
      organizationConfig:  Config.orgData,
    })
  }

  swaggerhub(inputMethod, inputResource, inputParams) {
    let url = ""
    if (inputParams) {
      url = "https://api.swaggerhub.com/apis/" + inputResource + "?" + inputParams
    } else {
      url = "https://api.swaggerhub.com/apis/" + inputResource
    }
    
    return fetch(url, {
        method: inputMethod
    }).then(response => {
      if (response.ok) {
        return response.json()
      } throw new Error('There was an issue requesting the API')
    }).then(json => {
      return json
    })
  }

  getSwaggerRequest(request) {
    try {
      // our variables
      var access_key = AWS_ACCESS_KEY_ID;
      var secret_key = AWS_SECRET_ACCESS_KEY;
      var region = this.state.clickedApi.aws_region;
      var host = this.state.clickedApi.aws_api_host; 
      var myService = 'apigateway';
      var myMethod = 'GET';
      var myPath = this.state.clickedApi.aws_api_path; //'/restapis/8nw17jg2gd/stages/miguel-example/exports/swagger';
      var content_type = 'application/json';
      
      // get the various date formats needed to form our request
      var now  =  new Date();
      var amzDate = this.getAmzDate(now.toISOString())
      var authDate = amzDate.split("T")[0]
      
      // we have an empty payload here because it is a GET request
      var payload = '';
      // get the SHA256 hash value for our payload
      var hashedPayload = crypto.SHA256(payload).toString()

      // create our canonical request
      var canonicalReq =  myMethod + '\n' +
                          myPath + '\n' +
                          '\n' +
                          'host:' + host + '\n' +
                          'x-amz-date:' + amzDate + '\n' +
                          '\n' +
                          'host;x-amz-date' + '\n' +
                          hashedPayload;
      
      // hash the canonical request
      var canonicalReqHash = crypto.SHA256(canonicalReq).toString();

      // form our String-to-Sign
      var stringToSign =  'AWS4-HMAC-SHA256\n' +
                          amzDate + '\n' +
                          authDate+'/'+region+'/'+myService+'/aws4_request\n'+
                          canonicalReqHash;

      // get our Signing Key
      var signingKey = this.getSignatureKey(crypto, secret_key, authDate, region, myService);

      // Sign our String-to-Sign with our Signing Key
      var signature = crypto.HmacSHA256(stringToSign, signingKey);

      // Form our authorization header
      var authString  = 'AWS4-HMAC-SHA256 ' +
                        'Credential='+
                        access_key+'/'+
                        authDate+'/'+
                        region+'/'+
                        myService+'/aws4_request,'+
  //                      'SignedHeaders=host;x-amz-content-sha256;x-amz-date,'+
                        'SignedHeaders=host;x-amz-date,'+
                        'Signature='+signature;

      // throw our headers together
      var headers = {
        'Authorization' : authString,
        'Host' : host,
        'x-amz-date' : amzDate,
        'Accept' : content_type
//        'x-amz-content-sha256' : hashedPayload
      }
      
      request.headers = headers
      console.log(request.headers)
    } catch (error) {
      console.log(error)
    }
    
    return request
  }

  // this function converts the generic JS ISO8601 date format to the specific format the AWS API wants
  getAmzDate(dateStr) {
    var chars = [":","-"];
    for (var i=0;i<chars.length;i++) {
      while (dateStr.indexOf(chars[i]) !== -1) {
        dateStr = dateStr.replace(chars[i],"");
      }
    }
    dateStr = dateStr.split(".")[0] + "Z";
    return dateStr;
  }

  // this function gets the Signature Key, see AWS documentation for more details, this was taken from the AWS samples site
  getSignatureKey(Crypto, key, dateStamp, regionName, serviceName) {
    var kDate = Crypto.HmacSHA256(dateStamp, "AWS4" + key);
    var kRegion = Crypto.HmacSHA256(regionName, kDate);
    var kService = Crypto.HmacSHA256(serviceName, kRegion);
    var kSigning = Crypto.HmacSHA256("aws4_request", kService);
    return kSigning;
  }

  getOrganizationData(organization) {
    this.setState({
      definitionList: new Map(Object.entries(ApisConfig))
    })
  }

  updateDefinitionLink(apiData) {
    this.setState({
      clickedApi: apiData,
      definitionLink: "https://" + apiData.aws_api_host + apiData.aws_api_path
    })
  }

  render() {
    return (
      <div className="App">
        <Sidebar 
          organizationConfig={this.state.organizationConfig}
          definitionList={this.state.definitionList}
          updateDefinitionLink={this.updateDefinitionLink}
          getOrganizationData={this.getOrganizationData}
        />
        
        <div id="api-data">
          <SwaggerUI 
            url={this.state.definitionLink}
            docExpansion="list"
            requestInterceptor={this.getSwaggerRequest}
          />
        </div>
      </div>
    );
  }
}

export default App;
