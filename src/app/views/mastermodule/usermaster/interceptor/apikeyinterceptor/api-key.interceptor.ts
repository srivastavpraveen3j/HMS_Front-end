import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../../../../enviornment/env';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {

  // const apiKey = environment.apiKey;
  const apiKey = '07ba0ae910688354d802ddadd5fc2618106e4c8ff6ac71b418d2dee6d371d283';

  const cloned = req.clone({
    setHeaders: {
      'x-hims-api': apiKey,
    },
  });

  return next(cloned);
};
