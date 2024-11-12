"use client";

import { useEffect, useState } from "react";
import { Download, Heart } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Skeleton } from "@acme/ui/skeleton";

import { api } from "~/trpc/react";

interface Image {
  _id: string;
  prompt: string;
  imageUrl: string;
  likes: number;
}

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<Image[]>([]);
  const [generating, setGenerating] = useState(false);

  // auto-refetch images every 30 seconds
  const { data: imagesData, isLoading } = api.image.getImages.useQuery(
    undefined,
    {
      refetchInterval: 30000,
    },
  );

  useEffect(() => {
    if (imagesData?.images) {
      setImages(imagesData.images);
    }
  }, [imagesData]);

  const generateMutation = api.generate.generate.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setImages((prev) => [
          { ...data.image, _id: data.image._id.toString() },
          ...prev,
        ]);
        setPrompt("");
      }
    },
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await generateMutation.mutateAsync({ prompt });
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setGenerating(false);
    }
  };

  const likeMutation = api.image.like.useMutation({
    onMutate: (likedImage) => {
      setImages((prev) =>
        prev.map((img) =>
          img._id === likedImage.imageId
            ? { ...img, likes: img.likes + 1 }
            : img,
        ),
      );
    },
  });

  const handleLike = async (imageId: string) => {
    try {
      await likeMutation.mutateAsync({ imageId });
    } catch (error) {
      console.error("Error liking image:", error);
    }
  };

  return (
      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleGenerate} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt..."
              className="flex-1 rounded-lg border px-4 py-2"
              disabled={generating}
            />
            <Button type="submit" disabled={generating}>
              {generating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[300px] w-full" />
              ))
            : images.map((image) => (
                <div key={image._id} className="group relative">
                  <img
                    src={image.imageUrl}
                    alt={image.prompt}
                    className="h-[300px] w-full rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-4 rounded-lg bg-black bg-opacity-50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => window.open(image.imageUrl, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => handleLike(image._id)}
                    >
                      <Heart className="h-4 w-4"/>
                      <span className="text-xs ml-1">{image.likes}</span>
                    </Button>
                  </div>
                </div>
              ))}
        </div>
      </main>
  );
}
