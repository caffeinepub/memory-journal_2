import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ArchivePage from "./pages/ArchivePage";
import HomePage from "./pages/HomePage";
import ManagePage from "./pages/ManagePage";
import MemoryDetailPage from "./pages/MemoryDetailPage";
import SearchPage from "./pages/SearchPage";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <Outlet />
      </main>
      <Footer />
      <Toaster richColors position="top-right" />
    </>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const archiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/archive",
  component: ArchivePage,
});

const memoryDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/memory/$id",
  component: MemoryDetailPage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: SearchPage,
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) ?? "",
  }),
});

const manageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/manage",
  component: ManagePage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  archiveRoute,
  memoryDetailRoute,
  searchRoute,
  manageRoute,
]);

const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
