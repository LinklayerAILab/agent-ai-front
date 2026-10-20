
import insight from '@/app/images/components/menus/insight.svg'
import alpha from '@/app/images/components/menus/alpha.svg'
import subscribe from '@/app/images/components/menus/subscribe.svg'
import brc20 from '@/app/images/components/menus/brc20.svg'

export type MenuRouteItem = {
  path: string;
  index: number;
  name: string;
  prev: null | string;
  needLogin: boolean;
  next: null | string;
  icon: string
};

export const MENU_ROUTES = [

  {
    path: "/",
    index: 1,
    name: "menu.brc20",
    prev: "/rewards",
    needLogin: false,
    next: "/alpha",
    type: "route",
    icon: brc20
  },
    {
    path: "/alpha",
    index: 2,
    type: "route",
    name: "menu.alpha",
    prev: "/",
    needLogin: false,
    next: "/insight",
    icon: alpha
  },
    {
    path: "/insight",
    index: 3,
    name: "menu.insight",
    prev: "/",
    needLogin: false,
    next: "/graph",
    type: "route",
    icon: insight
  },
  {
    path: "/graph",
    index: 5,
    type: "route",
    name: "menu.graph",
    prev: "/insight",
    needLogin: false,
    next: null,
    icon: subscribe
  },

];
