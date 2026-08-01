import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/api/')) {
    const token = localStorage.getItem('goal_compass_token');
    if (token) {
      const cloned = req.clone({ setHeaders: { Authorization: 'Bearer '.concat(token) } });
      return next(cloned);
    }
  }
  return next(req);
};
