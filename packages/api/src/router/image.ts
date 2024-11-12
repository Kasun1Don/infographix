import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { Image } from "@acme/db";

import { publicProcedure } from "../trpc";

export const imageRouter = {
  like: publicProcedure
    // Validate input with imageId as a required string
    .input(z.object({ imageId: z.string() }))
    .mutation(async ({ input }) => {
      // Find image by ID and increment likes count
      // Returns the updated document due to { new: true }
      const image = await Image.findByIdAndUpdate(
        input.imageId,
        { $inc: { likes: 1 } }, // Increment likes field by 1 (mongodb operator)
        { new: true }, // save the updated document
      );
      if (!image) {
        throw new Error("Image not found");
      }

      return { success: true, image };
    }),

  getImages: publicProcedure.query(async () => {
    try {
      const images = await Image.find()
        .sort({ createdAt: -1 }) // Sort by newest first
        .lean(); // Convert to plain JavaScript objects

      return {
        success: true,
        images: images.map((image) => ({
          ...image,
          _id: image._id.toString(), // Convert ObjectId to string
        })),
      };
    } catch (error) {
      throw new Error("Failed to fetch images", { cause: error });
    }
  }),
} satisfies TRPCRouterRecord;
