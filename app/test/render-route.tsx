import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { RouterProvider, createMemoryRouter } from "react-router";

interface RenderOptions {
  path?: string;
  url?: string;
}

/**
 * Renders one route inside a memory router, so a component can use `Link` and
 * `useParams` without a full app shell.
 */
export const renderRoute = (
  element: ReactElement,
  { path = "/", url = path }: RenderOptions = {}
) =>
  render(
    <RouterProvider
      router={createMemoryRouter([{ element, path }], {
        initialEntries: [url],
      })}
    />
  );
