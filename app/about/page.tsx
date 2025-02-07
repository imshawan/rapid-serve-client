export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">About RapidServe</h1>
            <p className="text-xl text-muted-foreground">
              Secure, simple, and smart cloud storage for everyone
            </p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <h2>Our Mission</h2>
            <p>
              At RapidServe, we believe that everyone deserves access to secure and reliable cloud storage. 
              Our mission is to provide a simple yet powerful platform for individuals and businesses to store, 
              share, and manage their digital content with confidence.
            </p>

            <h2>Security First</h2>
            <p>
              Security is at the core of everything we do. We use industry-leading encryption standards to 
              protect your files, and our infrastructure is designed with multiple layers of security to 
              ensure your data remains private and secure.
            </p>

            <h2>Features</h2>
            <ul>
              <li>Secure file storage with end-to-end encryption</li>
              <li>Easy file sharing with customizable permissions</li>
              <li>Automatic file syncing across devices</li>
              <li>Advanced collaboration tools</li>
              <li>24/7 customer support</li>
            </ul>

            <h2>Our Team</h2>
            <p>
              RapidServe is built by a team of passionate engineers, designers, and security experts who are 
              committed to creating the best cloud storage solution. We're constantly innovating and improving 
              our platform to meet the evolving needs of our users.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}