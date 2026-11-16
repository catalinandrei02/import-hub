import { createRouter, createWebHashHistory } from "vue-router";

// Hash URLs (#/costs) so GitHub Pages never 404s on refresh or shared links.
export const SECTIONS = [
  { path: "/cars", key: "cars", component: () => import("./views/CarsView.vue") },
  { path: "/costs", key: "costs", component: () => import("./views/CostsView.vue") },
  { path: "/steps", key: "process", component: () => import("./views/StepsView.vue") },
  { path: "/documents", key: "docs", component: () => import("./views/DocsView.vue") },
  // Not in the main menu (owner's request); still reachable at #/contacts.
  { path: "/contacts", key: "contacts", component: () => import("./views/ContactsView.vue"), hidden: true },
  { path: "/search", key: "search", component: () => import("./views/SearchView.vue") },
] as const;

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", redirect: "/cars" },
    ...SECTIONS.map(s => ({ path: s.path, name: s.key, component: s.component })),
    { path: "/admin", name: "admin", component: () => import("./views/AdminView.vue") }, // from the avatar menu, admins only
    { path: "/:any(.*)*", redirect: "/cars" },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
