
import insight from '@/app/images/components/menus/insight.svg'
// import ranking from '@/app/images/components/menus/ranking.svg'
// import alpha from '@/app/images/components/menus/alpha.svg'
// import rewards from '@/app/images/components/menus/rewards.svg'
import piloter from '@/app/images/components/menus/piloter.svg'
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
    name: "menu.alpha",
    prev: "/rewards",
    needLogin: false,
    next: "/insight",
    type: "route",
    icon: brc20
  },
  //   {
  //   path: "/alpha",
  //   index: 2,
  //   type: "route",
  //   name: "menu.alpha",
  //   prev: "/",
  //   needLogin: false,
  //   next: "/insight",
  //   icon: alpha
  // },
    {
    path: "/insight",
    index: 3,
    name: "menu.insight",
    prev: "/",
    needLogin: false,
    next: "/piloter",
    type: "route",
    icon: insight
  },
  {
    path: "/piloter",
    index: 4,
    type: "route",
    name: "menu.piloter",
    prev: "/insight",
    needLogin: false,
    next: "/graph",
    icon: piloter
  },
  // {
  //   path: "/tracker",
  //   index: 2,
  //   type: "route",
  //   name: "menu.tracker",
  //   prev: "/piloter",
  //   needLogin: false,
  //   next: "/picker",
  // },
  // {
  //   path: "/picker",
  //   index: 3,
  //   type: "route",
  //   name: "menu.picker",
  //   prev: "/tracker",
  //   needLogin: false,
  //   next: "/board",
  // },
  {
    path: "/graph",
    index: 5,
    type: "route",
    name: "menu.graph",
    prev: "/piloter",
    needLogin: false,
    next: null,
    icon: subscribe
  },
  // {
  //   path: "/ranking",
  //   index: 5,
  //   name: "menu.tribe",
  //   type: "route",
  //   prev: "/graph",
  //   needLogin: false,
  //   next: "/rewards",
  //   icon: ranking
  // },

  // {
  //   path: "/rewards",
  //   index: 6,
  //   type: "route",
  //   name: "menu.exchange",
  //   prev: "/graph",
  //   needLogin: false,
  //   next: null,
  //   icon: rewards
  // },

];
