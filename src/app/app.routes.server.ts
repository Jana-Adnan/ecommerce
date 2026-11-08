import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'search',
    renderMode: RenderMode.Client,
  },
  {
    path: 'shop',
    renderMode: RenderMode.Client,
  },
  {
    path: 'p-details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'c-details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'payment/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];

