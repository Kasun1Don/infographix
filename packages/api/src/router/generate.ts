import type { TRPCRouterRecord } from "@trpc/server";
import Replicate from "replicate";
import { z } from "zod";

import { Image } from "@acme/db";

import { publicProcedure } from "../trpc";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const generateRouter = {
  generate: publicProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ input }) => {
      const output = await replicate.run("black-forest-labs/flux-schnell", {
        input: {
          prompt: input.prompt,
        },
      });

      // Cast output to array and get first item
      const imageUrl = (output as string[])[0];

      const image = await Image.create({
        prompt: input.prompt,
        imageUrl,
      });

      return {
        success: true,
        image,
      };
    }),
} satisfies TRPCRouterRecord;
