import type { RouteObject } from "react-router-dom";
import RoughIndex from "@/pages/rough/RoughIndex";
import CarouselPage from "@/pages/rough/CarouselPage";
import CounterPage from "@/pages/rough/CounterPage";
import VehiclePage from "@/pages/rough/VehiclePage";

export const roughRoutes: RouteObject = {
  path: "rough",
  children: [
    {
      index: true,
      element: <RoughIndex />,
    },
    {
      path: "carousel",
      element: <CarouselPage />,
    },
    {
      path: "counter",
      element: <CounterPage />,
    },
    {
      path: "vehicle",
      element: <VehiclePage />,
    },
    // Easy to add more rough/testing routes here:
    // { path: 'buttons', element: <ButtonsPage /> },
    // { path: 'forms', element: <FormsPage /> },
  ],
};
