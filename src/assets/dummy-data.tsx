import { UploadCloud, Sparkles, Video } from "lucide-react";

// Features Section Data
export const featuresData = [
  {
    icon: UploadCloud,
    title: "Smart Upload",
    description: "Upload product & model images seamlessly to get instant, studio-grade visuals tailored for high-converting ads."
  },
  {
    icon: Sparkles,
    title: "AI Image Blend",
    description: "Leverage state-of-the-art Gemini 3 Pro AI to realistically place your product into model shots with accurate lighting."
  },
  {
    icon: Video,
    title: "Dynamic Video Magic",
    description: "Transform static merged concepts into high-engagement UGC short video ads optimized for TikTok, Reels, & Shorts."
  }
];

// Pricing Plans Data
export const plansData = [
  {
    id: "starter",
    name: "Starter",
    price: "$10",
    description: "Perfect for testing UGC ads and kickstarting small product campaigns.",
    credits: 25,
    popular: false,
    features: [
      "25 Credits",
      "Standard quality",
      "No watermark",
      "Slower generation speed",
      "Email support"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    description: "Best for growing brands and regular content creators creating daily ads.",
    credits: 80,
    popular: true,
    features: [
      "80 Credits",
      "HD quality",
      "No watermark",
      "Fast video generation",
      "Priority support"
    ]
  },
  {
    id: "ultra",
    name: "Ultra",
    price: "$99",
    description: "Designed for e-commerce agencies & high-volume scaling campaigns.",
    credits: 300,
    popular: false,
    features: [
      "300 Credits",
      "Full HD quality",
      "No watermark",
      "Ultra-fast generation speed",
      "24/7 Chat + Email support"
    ]
  }
];

// FAQs Data
export const faqData = [
  {
    question: "What is UGC AI Ad Generator?",
    answer: "It is an AI-powered platform that automatically blends product shots with human model imagery to generate studio-grade UGC style image and video ads."
  },
  {
    question: "How do credits work?",
    answer: "Each image generation consumes 5 credits, and each short UGC video generation consumes 10 credits from your plan balance."
  },
  {
    question: "Can I use generated videos commercially?",
    answer: "Yes, all generated images and UGC video ads come with full commercial rights for use across Meta, TikTok, YouTube, and website listings."
  },
  {
    question: "Which formats and aspect ratios are supported?",
    answer: "We support both 9:16 (vertical reel/shorts format) and 16:9 (horizontal format) outputs in MP4 and high-resolution PNG formats."
  }
];

// Footer Links Data
export const footerLinks = [
  {
    title: "Quick Links",
    links: [
      { name: "Home", url: "/" },
      { name: "Features", url: "/#features" },
      { name: "Pricing", url: "/plans" },
      { name: "Community", url: "/community" }
    ]
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", url: "/privacy" },
      { name: "Terms of Service", url: "/terms" }
    ]
  },
  {
    title: "Connect",
    links: [
      { name: "Twitter", url: "https://twitter.com" },
      { name: "LinkedIn", url: "https://linkedin.com" },
      { name: "GitHub", url: "https://github.com" }
    ]
  }
];