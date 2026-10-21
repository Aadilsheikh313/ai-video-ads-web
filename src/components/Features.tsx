import { useRef } from "react";
import Title from "./Title";
import { motion } from "framer-motion";
import { featuresData } from "../assets/dummy-data";

export default function Features() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <section id="features" className="py-20 2xl:py-32">
      <div className="max-w-6xl mx-auto px-4">
        <Title
          title="Features"
          heading="Built for modern brands and creators"
          description="Our AI instantly generates high-quality content, saving you time and effort. With our user-friendly interface, you can easily customize and edit your content to fit your brand's voice and style."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuresData.map((feature, i) => {
            const Icon = feature.icon;

            return (
              <motion.div
                ref={(el) => {
                  refs.current[i] = el;
                }}
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 70,
                  mass: 1,
                  delay: 0.1 + i * 0.1,
                }}
                key={feature.title}
                onAnimationComplete={() => {
                  const card = refs.current[i];

                  if (card) {
                    card.classList.add(
                      "transition",
                      "duration-300",
                      "hover:border-white/15",
                      "hover:-translate-y-1"
                    );
                  }
                }}
                className="rounded-2xl p-6 bg-white/3 border border-white/6"
              >
                <div className="w-12 h-12 rounded-lg bg-violet-900/20 flex items-center justify-center mb-4">
                  <Icon size={24} className="text-violet-400" />
                </div>

                <h3 className="text-lg font-semibold mb-2">
                  {feature.title}
                </h3>

                <p className="text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
