import { motion } from "framer-motion";
import { FadeInWhenVisible } from "../animations/fade-in-when-visible";
import { footerLinks } from "@/common/meta";
import { Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-muted/50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <FadeInWhenVisible>
              <div>
                <h3 className="text-xl font-bold mb-4">
                  Rapid<span className="text-blue-600">Serve</span>
                </h3>
                <p className="text-muted-foreground mb-4">
                  Enterprise-grade content distribution network for seamless file storage and delivery
                </p>
                <div className="flex gap-4">
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    href="https://twitter.com/shawan_sm"
                    className="text-muted-foreground hover:text-blue-600"
                  >
                    <Twitter className="w-5 h-5" />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    href="https://www.linkedin.com/in/shawan-mandal"
                    className="text-muted-foreground hover:text-blue-600"
                  >
                    <Linkedin className="w-5 h-5" />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    href="https://github.com/imshawan"
                    className="text-muted-foreground hover:text-blue-600"
                  >
                    <Github className="w-5 h-5" />
                  </motion.a>
                </div>
              </div>
            </FadeInWhenVisible>
            {footerLinks.map((section, index) => (
              <FadeInWhenVisible key={index} delay={index * 0.1}>
                <div>
                  <h3 className="font-semibold mb-4">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.links.map((link, idx) => (
                      <motion.li
                        key={idx}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <a
                          href={link.href}
                          className="text-muted-foreground hover:text-blue-600"
                        >
                          {link.label}
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="border-t pt-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 RapidServe. All rights reserved.
              </p>
              <div className="flex gap-6">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  href="#"
                  className="text-sm text-muted-foreground hover:text-blue-600"
                >
                  Privacy Policy
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  href="#"
                  className="text-sm text-muted-foreground hover:text-blue-600"
                >
                  Terms of Service
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  href="#"
                  className="text-sm text-muted-foreground hover:text-blue-600"
                >
                  Cookie Policy
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    )
}