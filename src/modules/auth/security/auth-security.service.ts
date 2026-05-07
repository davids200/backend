import { Injectable,} from '@nestjs/common';
import { AuthSessionEntity } from '../entities/auth-session.entity';

@Injectable()
export class AuthSecurityService {

  // CHECK SUSPICIOUS LOGIN

  isSuspicious(params: {
    currentCountry?: string;
    currentBrowser?: string;
    currentPlatform?: string;
    previousSessions:AuthSessionEntity[];
  }) {
    const {
      currentCountry,
      currentBrowser,
      currentPlatform,
      previousSessions,
    } = params;
    
// NO HISTORY
if (previousSessions.length === 0) {
return false;
}

// COUNTRY CHECK
const knownCountries =new Set(previousSessions.map((s) => s.country).filter(Boolean),);
if (currentCountry && !knownCountries.has(currentCountry,)) {
return true;
}
// DEVICE CHECK
const knownDevices =new Set(previousSessions.map((s) =>`${s.platform}:${s.browser}`,),);
const currentDevice =`${currentPlatform}:${currentBrowser}`;
if (!knownDevices.has(currentDevice,)
) {
return true;
}

return false;
  }
}