"use client";

import { Button } from "@/components/ui/button";
import { FadeInWhenVisible } from "@/components/animations/fade-in-when-visible";
import { GradientCursor } from "@/components/animations/gradient-cursor";
import { ScrollProgress } from "@/components/animations/scroll-progress";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Github,
  Linkedin,
  Twitter,
  Sparkles
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {faqs, howItWorks, mission, stats, team, technologies, testimonials, values } from "@/common/meta";
import { Contact, Footer, NavigationBar, TestimonialCarousel, TimelineStep } from "@/components/landing";
import { CountUpAnimation } from "@/components/animations/count-up";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ScrollProgress />
      <GradientCursor />

      {/* Navigation */}
      <NavigationBar />

      <main className="flex-1">
        <div className="relative">
          <div className="relative">

            {/* Hero Section */}
            <section className="relative overflow-hidden flex justify-center">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:20px] [mask-image:radial-gradient(white,transparent_85%)]"></div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="h-[400px] w-[400px] rounded-full bg-gradient-to-r from-red-500/10 via-yellow-500/10 via-green-500/10 via-blue-500/10 to-purple-500/10 blur-3xl">
                  </div>
                </div>
              </div>
              <div className="container z-10 lg:pt-48 pt-36 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mx-auto"
                  >
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                      Empowering Lightning-Fast Global Content Delivery <span className="text-primary">🚀</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8">
                      RapidServe is revolutionizing how businesses deliver content worldwide through our advanced CDN infrastructure and innovative technology solutions.
                    </p>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex gap-4 justify-center"
                    >
                      <Button
                        className="bg-blue-600 dark:text-white group hover:bg-blue-700 transition-all duration-300 hover:scale-105 px-4 py-3 text-sm sm:px-6 sm:py-4 sm:text-sm 
             md:px-10 md:py-5 md:text-md"
                        onClick={() => router.push("/login")}
                      >
                        Get Started
                        <Sparkles className="w-5 h-5 mx-1 group-hover:animate-pulse" />
                      </Button>
                      <Button
                        variant="outline"
                        className="transition-all group duration-300 hover:scale-105 px-4 py-3 text-sm sm:px-6 sm:py-4 sm:text-sm 
             md:px-10 md:py-5 md:text-sm"
                      >
                        View Documentation
                      </Button>
                    </motion.div>
                  </motion.div>
                  <div className="grid grid-cols-1 md:grid-cols-2 mt-16 lg:grid-cols-4 gap-8">
                    {technologies.map((tech, index) => (
                      <FadeInWhenVisible key={index} delay={index * 0.1}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="relative group"
                        >
                          <div key={index} className="relative min-h-[238px] p-8 bg-background rounded-lg border hover:border-blue-500/50 transition-colors duration-300">
                            <div className="p-4 bg-blue-600/10 rounded-full w-16 h-16 mx-auto mb-4 grid place-items-center">
                              <tech.Icon className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold mb-2">{tech.name}</h3>
                            <p className="text-sm text-muted-foreground">{tech.description}</p>
                          </div>
                        </motion.div>
                      </FadeInWhenVisible>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Mission Section */}
            <section id="mission" className="py-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
                    <p className="text-xl text-muted-foreground mb-8">
                      At RapidServe, we're on a mission to revolutionize content delivery by building the most reliable, secure, and performant CDN infrastructure in the world. We believe in a future where businesses of all sizes can deliver content globally without compromise.
                    </p>
                    <div className="space-y-4">
                      {mission.map((item, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="p-2 bg-blue-600/10 rounded-lg">
                            <item.Icon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">{item.title}</h3>
                            <p className="text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -inset-4 bg-blue-500/20 rounded-xl blur-3xl" />
                    <div className="relative aspect-square rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 p-1">
                      <div className="h-full w-full rounded-lg bg-background p-8">
                        <img
                          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000"
                          alt="Data Center"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Values Section - Fixed for dark mode */}
            <section id="values" className="py-24 relative">
              <div className="absolute inset-0 bg-muted/50" />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <FadeInWhenVisible>
                  <h2 className="text-3xl font-bold text-center tracking-tight sm:text-4xl md:text-5xl mb-4">
                    Redefining
                    <span className="bg-gradient-to-br from-blue-700 to-blue-300 bg-clip-text text-transparent"> Content Delivery </span>
                    for the Modern World.
                  </h2>
                  <p className="text-xl text-muted-foreground text-center mb-16 max-w-[700px] mx-auto">
                    Slow, unreliable content delivery is a thing of the past. RapidServe shatters bottlenecks, delivering your files instantly, anywhere in the world with unmatched speed, security, and scalability.
                  </p>
                </FadeInWhenVisible>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {values.map((value, index) => (
                    <FadeInWhenVisible key={index} delay={index * 0.1}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="relative group h-full"
                      >
                        <div className="absolute min-h-[274px] -inset-2 bg-gradient-to-r from-blue-600/10 to-blue-400/10 dark:from-blue-600/5 dark:to-blue-400/5 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative min-h-[274px] h-full p-8 bg-background rounded-lg border hover:border-blue-500/50 transition-colors duration-300">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="p-3 bg-blue-600/10 dark:bg-blue-500/5 rounded-lg w-fit mb-4"
                          >
                            <value.Icon className="w-6 h-6 text-blue-600" />
                          </motion.div>
                          <h3 className="text-2xl font-semibold mb-4">{value.title}</h3>
                          <p className="text-muted-foreground">{value.description}</p>
                        </div>
                      </motion.div>
                    </FadeInWhenVisible>
                  ))}
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24">
              <div className="px-4 sm:px-6 lg:px-8">
                <FadeInWhenVisible>
                  <h2 className="text-3xl font-bold text-center tracking-tight sm:text-4xl md:text-5xl mb-4">
                    No Delays. No Boundaries. Just Pure
                    <span className="bg-gradient-to-br from-blue-700 to-blue-300 bg-clip-text text-transparent"> Acceleration.</span>
                  </h2>
                  <p className="text-xl text-muted-foreground text-center mb-16 max-w-[700px] mx-auto">
                    Our advanced CDN infrastructure ensures seamless file storage, retrieval, and distribution across the globe
                  </p>
                </FadeInWhenVisible>
                <div className="flex justify-center align-center">
                  <div className="mt-16 max-w-3xl">
                    {howItWorks.map((step, index) => (
                      <TimelineStep key={index} step={step} index={index} />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 relative">
              <div className="absolute inset-0 bg-muted/50" />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <FadeInWhenVisible>
                  <h2 className="text-3xl font-bold text-center tracking-tight sm:text-4xl md:text-5xl mb-4">
                    Proof in Performance: Real Stories,
                    <span className="bg-gradient-to-br from-blue-700 to-blue-300 bg-clip-text text-transparent"> Real Speed.</span>
                  </h2>
                  <p className="text-xl text-muted-foreground text-center mb-16 max-w-[700px] mx-auto">
                    We don’t just promise speed—we deliver it. See how RapidServe is transforming businesses with blazing-fast content delivery.
                  </p>
                </FadeInWhenVisible>
                <TestimonialCarousel testimonials={testimonials} />
              </div>
            </section>

            {/* Stats Section */}
            <section className="pb-24 relative">
              <div className="absolute inset-0 bg-muted/50" />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {stats.map((stat, index) => (
                    <FadeInWhenVisible key={index} delay={index * 0.1}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-background p-8 rounded-lg border text-center transition-all duration-300"
                      >
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {stat.value.includes("%") ? (
                            <>
                              <CountUpAnimation end={parseFloat(stat.value)} />%
                            </>
                          ) : stat.value.includes("+") ? (
                            <>
                              <CountUpAnimation end={parseFloat(stat.value)} />+
                            </>
                          ) : stat.value.includes("ms") ? (
                            <>
                              <CountUpAnimation end={parseFloat(stat.value)} />ms
                            </>
                          ) : (
                            <CountUpAnimation end={parseFloat(stat.value)} />
                          )}
                        </div>
                        <div className="text-muted-foreground">{stat.label}</div>
                      </motion.div>
                    </FadeInWhenVisible>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24">
              <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <FadeInWhenVisible>
                  <h2 className="text-3xl font-bold text-center tracking-tight sm:text-4xl md:text-5xl mb-4">
                    Got Questions? We've Got Speedy
                    <span className="bg-gradient-to-br from-blue-700 to-blue-300 bg-clip-text text-transparent"> Answers.</span>
                  </h2>
                  <p className="text-xl text-muted-foreground text-center mb-16 max-w-[700px] mx-auto">
                    Find answers to common things you need to know about RapidServe’s next-gen CDN solutions
                  </p>
                </FadeInWhenVisible>
                <div className="flex justify-center align-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-3xl"
                  >
                    <Accordion type="single" collapsible className="w-full space-y-4">
                      {faqs.map((faq, index) => (
                        <FadeInWhenVisible key={index} delay={index * 0.1}>
                          <AccordionItem value={`item-${index}`} className="border rounded-lg px-6">
                            <AccordionTrigger className="text-left hover:no-underline">
                              <span className="font-semibold">{faq.question}</span>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        </FadeInWhenVisible>
                      ))}
                    </Accordion>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Team Section */}
            <section className="py-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center tracking-tight sm:text-4xl md:text-5xl mb-4">
                  The Visionaries Behind the
                  <span className="bg-gradient-to-br from-blue-700 to-blue-300 bg-clip-text text-transparent"> Velocity.</span>
                </h2>
                <p className="text-xl text-muted-foreground text-center mb-16 max-w-[700px] mx-auto">
                  Meet the minds shaping the future of content delivery. Our leadership team is obsessed with speed, security, and innovation, pushing boundaries to make RapidServe the best.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {team.map((member, index) => (
                    <div
                      key={index}
                      className="group relative"
                    >
                      <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="mt-4">
                        <h3 className="text-xl font-semibold">{member.name}</h3>
                        <p className="text-muted-foreground">{member.role}</p>
                        <p className="text-sm text-muted-foreground mt-2">{member.bio}</p>
                        <div className="mt-4 flex gap-4">
                          <a href={member.linkedin} className="text-muted-foreground hover:text-blue-600">
                            <Linkedin className="h-5 w-5" />
                          </a>
                          <a href={member.twitter} className="text-muted-foreground hover:text-blue-600">
                            <Twitter className="h-5 w-5" />
                          </a>
                          <a href={member.github} className="text-muted-foreground hover:text-blue-600">
                            <Github className="h-5 w-5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Join Us Section */}
            <section className="py-24 relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-600">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:14px_24px]" />
              </div>
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                <h2 className="text-4xl font-bold text-white mb-6">
                  Join Our Growing Team
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  We're always looking for talented individuals who share our passion for innovation and excellence.
                </p>
                <Button size="lg" variant="secondary" className="group">
                  View Open Positions <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </section>

            {/* Contact Section */}
            <Contact />
            
          </div>
        </div>

      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
}
