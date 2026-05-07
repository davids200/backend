import {  Injectable,} from '@nestjs/common';
import { Request }from 'express';
import {UAParser,} from 'ua-parser-js';
import { DeviceInfo }from './device.types';

@Injectable()
export class DeviceService {

  extract(
    req: Request,
  ): DeviceInfo {

    // ================================================
    // USER AGENT
    // ================================================

    const userAgent =
      req.headers[
        'user-agent'
      ] || '';

    const parser = new UAParser( userAgent,);

    const result =
      parser.getResult();

    // ================================================
    // IP
    // ================================================

    const forwarded =
      req.headers[
        'x-forwarded-for'
      ];

    const ipAddress =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0]
        : req.ip;

    // ================================================
    // DEVICE
    // ================================================

    const deviceName =
      result.device.model ||
      'Unknown Device';

    const browser =
      result.browser.name ||
      'Unknown Browser';

    const platform =
      result.os.name ||
      'Unknown OS';

    return {

      ipAddress,

      userAgent,

      browser,

      platform,

      deviceName,
    };
  }
}