import { Rocket } from "lucide-react";
import { Button } from "../ui/button";
import { useMemo, useState } from "react";
import { contactInfo } from "@/common/meta";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/hooks/use-toast"

export function Contact() {
  const {toast} = useToast();
  const [submitted, setSubmitted] = useState(false)
  const [contactData, setContactData] = useState({ email: "", query: "", })

  const isEmailValid = useMemo(() => contactData.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/), [contactData.email])
  const isQueryValid = useMemo(() => contactData.query?.length >= 10, [contactData.query])

  const handleOnChange = (e: any) => {
    const { name, value } = e.target;
    setContactData((prev) => ({ ...prev, [name]: value }))
    setSubmitted(false);
  }

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setSubmitted(true);

    if (isEmailValid && isQueryValid) {
      toast({
        title: "Form submitted successfully!",
        description: "We've received your message. Give us some moment, we'll respond back showtly.",
      })
    }
  };

  return (
    <section id="contact" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Have questions about RapidServe? Our team is here to help you find the perfect solution for your content delivery needs.
            </p>
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="p-2 bg-blue-600/10 rounded-lg">
                    <info.Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{info.title}</h3>
                    <p className="text-muted-foreground">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-blue-500/20 rounded-xl blur-3xl" />
            <div className="relative rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 p-1">
              <div className="h-full w-full rounded-lg bg-background p-8">
                <h3 className="text-2xl font-semibold mb-6">See how RapidServe can transform your content delivery infrastructure.</h3>
                <p className="text-muted-foreground mb-8">
                  Our experts are here to help—reach out now and let’s elevate your infrastructure together!
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div className="flex flex-col">
                    <Input
                      type="email"
                      placeholder="Your email address"
                      value={contactData.email}
                      name="email"
                      onChange={handleOnChange}
                      className={`border-2 rounded-lg px-4 py-2 outline-none transition-all duration-300
            focus:border-blue-600 focus:ring-2 focus:ring-blue-400 
            hover:border-blue-500 hover:ring-1 hover:ring-blue-300
            ${submitted && !isEmailValid ? "border-red-600 ring-1 ring-red-400" : "border-primary-600/50"}`}
                    />
                    {submitted && !isEmailValid && (
                      <p className="mt-1 text-sm text-red-600">Please enter a valid email address.</p>
                    )}
                  </div>

                  {/* Textarea Input */}
                  <div className="flex flex-col">
                    <Textarea
                      placeholder="Your message..."
                      value={contactData.query}
                      name="query"
                      onChange={handleOnChange}
                      className={`border-2 rounded-lg px-4 py-2 outline-none transition-all duration-300
            focus:border-blue-600 focus:ring-2 focus:ring-blue-400 
            hover:border-blue-500 hover:ring-1 hover:ring-blue-300
            ${submitted && !isQueryValid ? "border-red-600 ring-1 ring-red-400" : "border-primary-600/50"}`}
                    />
                    {submitted && !isQueryValid && (
                      <p className="mt-1 text-sm text-red-600">Your query must be at least 10 characters long.</p>
                    )}
                  </div>
                  <div className="">
                    <Button type="submit" size="lg" className="w-full mt-6 bg-blue-600 hover:bg-blue-700 dark:text-white">
                      Send Message
                      <Rocket className="w-5 h-5 mx-1" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}