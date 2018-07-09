import {
  MacroScriptParam,
  MacroScriptParamConstraint,
  MacroTypeDefinition,
  PageContent,
  StringAnyMap,
} from '../CommonTypes';

export interface HttpClientCall {
  /**name of the configured template*/
  name: string;
  /**optional client generated call ID to identify responses*/
  requestId?: string;
}
export interface HttpClientHeader {
  /**Header value*/
  value?: string;
  /**Header name*/
  name: string;
}
export enum HttpClientParseMode {
  /**Content is interpreted as a UTF8 character string*/
  STRING = 'STRING',
  /**Content is parsed as UTF8 JSON*/
  OBJECT = 'OBJECT',
  /**Content is not interpreted, but available as a raw array of bytes*/
  BYTES = 'BYTES',
}
export interface HttpClientRequest {
  /**Request body. String (passed as is) or complex object (serialized to json)*/
  content?: any;
  /**Headers to be sent*/
  headers?: HttpClientHeader[];
  /**HTTP method*/
  method: string;
  /**optional client generated call ID to identify responses*/
  requestId?: string;
  /**How to parse the response content*/
  parseMode: HttpClientParseMode;
  /**Remote URL. a literal string*/
  url: string;
}
export interface HttpClientResponse {
  /**received content*/
  content?: any;
  /**received headers*/
  headers?: HttpClientHeader[];
  /**response http status code*/
  httpStatus?: number;
  /**optional client generated call ID to identify responses*/
  requestId?: string;
}
export interface HttpClientSOAPRequest {
  /**Soap headers : the content of &lt;soapenv:Header&gt;*/
  soapHeaders?: any[];
  /**List of possible soap fault classes for this request*/
  soapFaults?: SoapFaultDefinition[];
  /**Request body. String (passed as is) or complex object (serialized to json)*/
  content?: any;
  /**Type reference, as returned in ZMS by 'YourClassName.class' */
  typeDefinition?: MacroTypeDefinition;
  /**Headers to be sent*/
  headers?: HttpClientHeader[];
  /**SOAP action, as defined in the WSDL, for inclusion in the generated request headers*/
  soapAction?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Remote URL. a literal string*/
  url: string;
  /**Use when the xml root type does not declare any namespace, but does need it*/
  requestWrapperNamespace?: string;
}
export interface HttpClientSOAPResponse {
  /**received content*/
  content?: any;
  /**EMPTY DESC*/
  fault?: SoapFault;
  /**received headers*/
  headers?: HttpClientHeader[];
  /**response http status code*/
  httpStatus?: number;
  /**optional client generated call ID to identify responses*/
  requestId?: string;
}
export interface HttpClientTemplate {
  /**Request body. String (passed as is) or complex object (serialized to json)*/
  content?: any;
  /**Name of the request template (primary key)*/
  name: string;
  /**Headers to be sent*/
  headers?: HttpClientHeader[];
  /**HTTP method*/
  method: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**How to parse the response content*/
  parseMode: HttpClientParseMode;
  /**Remote URL. a literal string*/
  url: string;
}
export interface SoapFault {
  /**EMPTY DESC*/
  detail?: any[];
  /**EMPTY DESC*/
  faultcode?: string;
  /**EMPTY DESC*/
  faultstring?: string;
}
export interface SoapFaultDefinition {
  /**EMPTY DESC*/
  type: MacroTypeDefinition;
  /**EMPTY DESC*/
  targetNamespace?: string;
}
