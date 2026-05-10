import {
  UAParser,
} from 'ua-parser-js';

export function parseDevice(
  userAgent?: string,
) {

  const parser =new UAParser(userAgent,);

  const result =parser.getResult();

  return {

    browser:result.browser.name,

    platform:result.os.name,

    deviceName:result.device.model ||

      result.device.vendor ||  'Unknown Device',
  };
}