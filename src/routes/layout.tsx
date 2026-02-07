import { Outlet } from '@edenx/runtime/router';
import type { JSX } from 'react';

const Layout = (): JSX.Element => (
  <div>
    <Outlet />
  </div>
);

export default Layout;
