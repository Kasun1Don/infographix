import type { TRPCRouterRecord } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import { z } from "zod";

import { Image } from "@acme/db"; // Replace with your actual Image model import

// Initialize TRPC
const t = initTRPC.create();

// Helper for public procedures with centralized error logging
const publicProcedure = t.procedure.use(async ({ path, next }) => {
  try {
    return await next();
  } catch (error) {
    console.error(`Error in TRPC route ${path}:`, error);
    throw new Error(`Failed in route ${path}`);
  }
});

// Define the router
export const imageRouter = {
  // Test endpoint to ensure serverless environment is working correctly
  ping: publicProcedure.query(() => {
    return { message: "pong" };
  }),

  // Increment 'likes' for an image
  like: publicProcedure
    .input(z.object({ imageId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const image = await Image.findByIdAndUpdate(
          input.imageId,
          { $inc: { likes: 1 } },
          { new: true },
        );
        if (!image) {
          throw new Error("Image not found");
        }
        return { success: true, image };
      } catch (error) {
        console.error("Like mutation error:", error);
        throw new Error("Failed to like image");
      }
    }),

  // Retrieve images
  getImages: publicProcedure.query(async () => {
    try {
      const images = await Image.find().sort({ createdAt: -1 }).lean().exec();
      return {
        success: true,
        images: images.map((image) => ({
          ...image,
          _id: image._id.toString(),
          createdAt: image.createdAt.toISOString(),
        })),
      };
    } catch (error) {
      console.error("Image fetch error:", error);
      throw new Error("Failed to fetch images");
    }
  }),
} satisfies TRPCRouterRecord;
