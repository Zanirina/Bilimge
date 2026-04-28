import { Route, Routes } from "react-router-dom";
import { routes, type AppRoute } from "./routes";

const render = (r: AppRoute, key: string) => {
  if (r.children?.length) {
    return (
      <Route key={key} path={r.path} element={r.element}>
        {r.children.map((c, i) => render(c, `${key}-${i}`))}
      </Route>
    );
  }
  return <Route key={key} path={r.path} index={r.index} element={r.element} />;
};

export default function AppRouter() {
  return <Routes>{routes.map((r, i) => render(r, String(r.path ?? i)))}</Routes>;
}
