import { useEffect, useState, useCallback, useRef } from "react";
import type { Project } from "../types";
import {
  ImageIcon,
  Loader2Icon,
  RefreshCwIcon,
  SparklesIcon,
  VideoIcon,
  DownloadIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GhostButton, PrimaryButton } from "../components/Buttons";
import { useAuth, useUser } from "@clerk/react";
import api from "../configs/axios";
import toast from "react-hot-toast";

const Result = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const [project, setProjectData] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Prevent duplicate GET requests when React effects/polling overlap.
  const isFetchingRef = useRef(false);
  // Track active unmount status to avoid state settings after page changes
  const isMountedRef = useRef(true);

  // Synchronize unmount cleanup safely
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchProjectData = useCallback(async () => {
    if (!projectId || isFetchingRef.current) return;

    isFetchingRef.current = true;

    try {
      const token = await getToken();

      const { data } = await api.get(
        `/api/user/projects/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if the component is still alive before changing state
      if (isMountedRef.current && data?.project) {
        setProjectData(data.project);
        setIsGenerating(Boolean(data.project.isGenerating));

        if (data.project.generatedVideo) {
          setGenerationError(null);
        }
      }
    } // eslint-disable-next-line @typescript-eslint/no-explicit-any 
    catch (error: any) {
      console.error("Failed to load project:", error);
      if (isMountedRef.current) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load project";
        toast.error(message);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [projectId, getToken]);

  const handleGenerateVideo = async () => {
    if (!projectId || isGenerating || !project?.generatedImage) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const token = await getToken();

      const { data } = await api.post(
        "/api/project/video",
        { projectId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data?.videoUrl && isMountedRef.current) {
        setProjectData((prev) =>
          prev
            ? {
                ...prev,
                generatedVideo: data.videoUrl,
                isGenerating: false,
              }
            : null
        );

        setIsGenerating(false);
        toast.success(data.message || "Video generated successfully!");

        await fetchProjectData();
      } else {
        throw new Error("Video was generated but no video URL was returned.");
      }
    }// eslint-disable-next-line @typescript-eslint/no-explicit-any 
    catch (error: any) {
      console.error("Video generation failed:", error);
      if (isMountedRef.current) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Video generation failed";

        setGenerationError(message);
        setIsGenerating(false);
        await fetchProjectData();
        toast.error(message);
      }
    }
  };

  const handleDownload = async (
    url: string | undefined,
    filename: string
  ) => {
    if (!url) return;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(url, "_blank", "noopener,noreferrer");
      toast("Opened the file in a new tab.");
    }
  };

  // 1. Auth guard + initial project load hook with proper guards
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      navigate("/");
      return;
    }

    if (projectId) {
      fetchProjectData();
    }
  }, [user, isLoaded, projectId, navigate, fetchProjectData]);

  // 2. Safe Polling Hook with automatic clear logic
  useEffect(() => {
    if (!user || !projectId || !isGenerating) return;

    const interval = window.setInterval(() => {
      fetchProjectData();
    }, 10000);

    return () => {
      window.clearInterval(interval);
    };
  }, [user, projectId, isGenerating, fetchProjectData]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2Icon className="animate-spin text-indigo-500 size-9" />
          <p className="text-sm text-gray-400">Loading your project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-white">
        <div className="glass-panel max-w-md w-full rounded-2xl p-8 text-center">
          <AlertCircleIcon className="size-10 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Project not found
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            This project may have been deleted or you may not have access to it.
          </p>

          <Link to="/generate">
            <PrimaryButton className="w-full">
              Create New Generation
            </PrimaryButton>
          </Link>
        </div>
      </div>
    );
  }

  const hasImage = Boolean(project.generatedImage);
  const hasVideo = Boolean(project.generatedVideo);

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 md:p-12 mt-16 md:mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-indigo-400 mb-1">
              AI AADILGROUP Studio
            </p>

            <h1 className="text-2xl md:text-3xl font-medium">
              Generation Result
            </h1>

            {project.productName && (
              <p className="text-sm text-gray-400 mt-1">
                {project.productName}
              </p>
            )}
          </div>

          <Link
            to="/generate"
            className="btn-secondary text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <RefreshCwIcon className="w-4 h-4" />
            <span>New Generation</span>
          </Link>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-2 rounded-2xl w-full">
              <div
                className={`w-full ${
                  project.aspectRatio === "9:16"
                    ? "aspect-[9/16] max-w-md mx-auto max-h-[78vh]"
                    : "aspect-video"
                } rounded-2xl bg-gray-950 overflow-hidden relative flex items-center justify-center border border-white/10 shadow-2xl`}
              >
                {hasVideo ? (
                  <video
                    key={project.generatedVideo}
                    src={project.generatedVideo}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain bg-black"
                  />
                ) : hasImage ? (
                  <>
                    <img
                      src={project.generatedImage}
                      alt="Generated product advertisement"
                      className="w-full h-full object-contain bg-black"
                    />

                    {isGenerating && (
                      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="text-center px-6">
                          <div className="mx-auto mb-4 size-14 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                            <Loader2Icon className="size-7 text-indigo-400 animate-spin" />
                          </div>

                          <h3 className="font-semibold text-lg">
                            Creating your video
                          </h3>

                          <p className="text-sm text-gray-300 mt-2 max-w-xs">
                            AI is turning your image into a short product
                            advertisement. This may take a little while.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-400 text-sm text-center px-6">
                    No generated image is available.
                  </div>
                )}
              </div>
            </div>

            {/* Generation status */}
            {isGenerating && (
              <div className="glass-panel rounded-2xl p-5 border border-indigo-500/20">
                <div className="flex items-start gap-3">
                  <Loader2Icon className="size-5 text-indigo-400 animate-spin mt-0.5 shrink-0" />

                  <div>
                    <h3 className="font-medium">
                      Video generation in progress
                    </h3>

                    <p className="text-sm text-gray-400 mt-1">
                      Please keep this page open. Your generated video will
                      appear automatically when the request finishes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {generationError && !isGenerating && (
              <div className="glass-panel rounded-2xl p-5 border border-red-500/20 bg-red-500/5">
                <div className="flex items-start gap-3">
                  <AlertCircleIcon className="size-5 text-red-400 mt-0.5 shrink-0" />

                  <div className="min-w-0">
                    <h3 className="font-medium text-red-300">
                      Video generation failed
                    </h3>

                    <p className="text-sm text-gray-400 mt-1 break-words">
                      {generationError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {hasVideo && (
              <div className="glass-panel rounded-2xl p-5 border border-green-500/20 bg-green-500/5">
                <div className="flex items-center gap-3">
                  <CheckCircle2Icon className="size-5 text-green-400 shrink-0" />

                  <div>
                    <h3 className="font-medium text-green-300">
                      Video generated successfully
                    </h3>

                    <p className="text-sm text-gray-400 mt-1">
                      Your AI product advertisement is ready.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project information */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-4">
                Project
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Product</span>
                  <span className="text-right text-gray-200">
                    {project.productName || "—"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Format</span>
                  <span className="text-gray-200">
                    {project.aspectRatio || "9:16"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Image</span>
                  <span className={hasImage ? "text-green-400" : "text-gray-500"}>
                    {hasImage ? "Ready" : "Not available"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Video</span>
                  <span className={hasVideo ? "text-green-400" : "text-gray-500"}>
                    {hasVideo ? "Ready" : "Not generated"}
                  </span>
                </div>
              </div>
            </div>

            {/* Downloads */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-4">
                Downloads
              </h3>

              <div className="flex flex-col gap-3">
                <GhostButton
                  type="button"
                  disabled={!hasImage}
                  onClick={() =>
                    handleDownload(
                      project.generatedImage,
                      "generated-image.jpg"
                    )
                  }
                  className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ImageIcon className="size-4.5" />
                  Download Image
                  <DownloadIcon className="size-4 ml-auto" />
                </GhostButton>

                <GhostButton
                  type="button"
                  disabled={!hasVideo}
                  onClick={() =>
                    handleDownload(
                      project.generatedVideo,
                      "generated-video.mp4"
                    )
                  }
                  className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <VideoIcon className="size-4.5" />
                  Download Video
                  <DownloadIcon className="size-4 ml-auto" />
                </GhostButton>
              </div>
            </div>

            {/* Video generation */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <VideoIcon className="size-24" />
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="size-5 text-indigo-400" />
                  <h3 className="text-xl font-semibold">
                    Video Magic
                  </h3>
                </div>

                <p className="text-gray-400 text-sm mb-6">
                  Turn your generated product image into a dynamic AI video
                  for social media.
                </p>

                {!hasVideo ? (
                  <PrimaryButton
                    type="button"
                    onClick={handleGenerateVideo}
                    disabled={isGenerating || !hasImage}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2Icon className="size-4 animate-spin" />
                        Generating Video...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="size-4" />
                        Generate Video
                      </>
                    )}
                  </PrimaryButton>
                ) : (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-center text-sm font-medium">
                    Video Generated Successfully!
                  </div>
                )}

                {isGenerating && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Please don't click the button again.
                  </p>
                )}
              </div>
            </div>

            {/* Create another */}
            <Link to="/generate" className="block">
              <GhostButton
                type="button"
                className="w-full justify-center py-3 rounded-xl"
              >
                <RefreshCwIcon className="size-4" />
                Create Another Ad
              </GhostButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;
