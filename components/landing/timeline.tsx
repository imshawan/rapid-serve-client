import { motion } from "framer-motion";

interface Step {
  Icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
}

export function TimelineStep({ step, index }: { step: Step; index: number }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.2 }}
        className="relative flex gap-8"
      >
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {index + 1}
          </div>
          {index < 3 && <div className="w-0.5 h-full bg-blue-600/20 mt-4" />}
        </div>
        <div className="flex-1 pb-16">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-background p-6 rounded-lg border relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            {/* <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/10 to-blue-400/10 dark:from-blue-600/5 dark:to-blue-400/5 rounded-lg blur opacity-0 hover:opacity-100 transition-opacity duration-300" /> */}
  
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-600/10 rounded-lg">
                <step.Icon />
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
            </div>
            <p className="text-muted-foreground mb-4">{step.description}</p>
            <ul className="space-y-2">
              {step.features.map((feature: string, idx: number) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.div>
    );
  }