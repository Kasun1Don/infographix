import { authRouter } from "./router/auth";
import { generateRouter } from "./router/generate";
import { imageRouter } from "./router/image";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  generate: generateRouter,
  image: imageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
