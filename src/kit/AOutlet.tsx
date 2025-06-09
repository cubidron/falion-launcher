import {
  Outlet,
  RouterContextProvider,
  getRouterContext,
  useMatch,
  useMatches,
} from "@tanstack/react-router";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import cloneDeep from "lodash/cloneDeep";
import { useContext, useRef } from "react";

export const AnimatedOutlet = (
  props: React.ComponentProps<typeof motion.div> & {
    mode?: "wait" | "sync" | "popLayout";
  },
) => {
  const matches = useMatches();
  const match = useMatch({ strict: false });
  const nextMatchIndex = matches.findIndex((d) => d.id === match.id) + 1;
  const nextMatch = matches[nextMatchIndex];

  const RouterContext = getRouterContext();
  const routerContext = useContext(RouterContext);
  const renderedContext = useRef(routerContext);
  const isPresent = useIsPresent();

  if (isPresent) {
    try {
      const clone = cloneDeep(routerContext);
      renderedContext.current = clone;
    } catch (error) {
      console.error(
        "cloneDeep failed, falling back to original routerContext",
        error,
      );
      renderedContext.current = routerContext;
    }
  }

  // console.log('Animated', isPresent, renderedContext.current);

  // console.log('Animated', isPresent, renderedContext.current.latestLocation);
  const { key, mode, ...others } = { ...props };
  return (
    <AnimatePresence mode={mode ?? "wait"}>
      <motion.div key={nextMatch?.pathname} {...others}>
        <RouterContextProvider router={renderedContext.current}>
          <Outlet />
        </RouterContextProvider>
      </motion.div>
    </AnimatePresence>
  );
};
