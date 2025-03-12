import {
  Globe,
  Users,
  Building2,
  BarChart3,
  Rocket,
  Shield,
  Zap,
  Server,
  Code,
  MessageSquare,
  Upload,
  Download,
  RefreshCw,
  Share2,
} from "lucide-react";

export const stats = [
  { value: "99.99%", label: "Uptime Guarantee" },
  { value: "50ms", label: "Global Latency" },
  { value: "200+", label: "Edge Locations" },
  { value: "1000+", label: "Enterprise Clients" },
];

export const mission = [
  {
    Icon: Globe,
    title: "Global Reach",
    description: "Deliver content to users worldwide with minimal latency",
  },
  {
    Icon: Shield,
    title: "Enterprise Security",
    description: "Advanced security features and compliance standards",
  },
  {
    Icon: Zap,
    title: "Lightning Speed",
    description: "Optimized infrastructure for fastest content delivery",
  },
];

export const values = [
  {
    Icon: Rocket,
    title: "Innovation",
    description:
      "We push the boundaries of what's possible in content delivery, constantly evolving and improving our technology.",
  },
  {
    Icon: Shield,
    title: "Security",
    description:
      "We maintain the highest standards of security to protect your data and ensure compliance with global regulations.",
  },
  {
    Icon: Zap,
    title: "Performance",
    description:
      "Speed is at our core. We optimize every aspect of our network for lightning-fast content delivery.",
  },
  {
    Icon: Server,
    title: "Reliability",
    description:
      "Our infrastructure is built for 99.99% uptime, ensuring your content is always available when needed.",
  },
  {
    Icon: BarChart3,
    title: "Scalability",
    description:
      "Our infrastructure grows with your needs, supporting businesses of any size anywhere in the world.",
  },
  {
    Icon: Users,
    title: "Customer Focus",
    description:
      "We put our customers first, providing exceptional support and tailored solutions.",
  },
];

export const team = [
  {
    name: "Sarah Chen",
    role: "Chief Executive Officer",
    bio: "Former VP of Engineering at AWS with 15+ years of experience in cloud infrastructure.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    linkedin: "#",
    twitter: "#",
    github: "#",
  },
  {
    name: "Shawan Mandal",
    role: "Chief Technology Officer",
    bio: "Previously led infrastructure teams at Google Cloud and contributed to key CDN technologies.",
    image:
      "https://www.imshawan.dev/assets/img/1723052574009.jpg",
    linkedin: "https://www.linkedin.com/in/shawan-mandal",
    twitter: "https://twitter.com/shawan_sm",
    github: "https://github.com/imshawan",
  },
  {
    name: "Emma Thompson",
    role: "Head of Engineering",
    bio: "Distributed systems expert with a track record of building scalable cloud solutions.",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
    linkedin: "#",
    twitter: "#",
    github: "#",
  },
];

export const technologies = [
  {
    Icon: Server,
    name: "Edge Computing",
    description: "Serverless functions at the edge for minimal latency",
  },
  {
    Icon: Shield,
    name: "Security",
    description: "Advanced DDoS protection and SSL/TLS encryption",
  },
  {
    Icon: Code,
    name: "API-First",
    description: "RESTful APIs for seamless integration",
  },
  {
    Icon: Globe,
    name: "Global DNS",
    description: "Intelligent DNS routing and load balancing",
  },
];

export const contactInfo = [
  {
    Icon: Building2,
    title: "Headquarters",
    value: "Assam, IN",
  },
  {
    Icon: MessageSquare,
    title: "Email",
    value: "contact@imshawan.dev",
  },
  {
    Icon: Globe,
    title: "Global Offices",
    value: "London, Singapore, Tokyo",
  },
];

export const howItWorks = [
  {
    Icon: Upload,
    title: "File Upload Process",
    description:
      "Our advanced file upload system ensures data integrity and fault tolerance through intelligent chunking and distribution.",
    features: [
      "Automatic file chunking (4MB chunks)",
      "SHA-256 hash verification",
      "Duplicate chunk detection",
      "Parallel upload optimization",
    ],
  },
  {
    Icon: Download,
    title: "File Download Process",
    description:
      "Lightning-fast downloads through our globally distributed edge network with smart caching.",
    features: [
      "Parallel chunk retrieval",
      "Integrity verification",
      "Automatic file reconstruction",
      "Edge-optimized delivery",
    ],
  },
  {
    Icon: RefreshCw,
    title: "Real-time Synchronization",
    description:
      "Keep your files in sync across all devices with our real-time synchronization system.",
    features: [
      "Change detection",
      "Delta updates",
      "Real-time notifications",
      "Conflict resolution",
    ],
  },
  {
    Icon: Share2,
    title: "Secure File Sharing",
    description:
      "Share files securely with granular access controls and comprehensive tracking.",
    features: [
      "Public/private sharing options",
      "Expiring share links",
      "Access control lists",
      "Activity monitoring",
    ],
  },
];

export const testimonials = [
  {
    name: "David Kim",
    role: "CTO at TechCorp",
    content:
      "RapidServe transformed our content delivery infrastructure. The performance improvements were immediate and significant.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    rating: 5,
  },
  {
    name: "Lisa Chen",
    role: "Engineering Lead at StreamFlow",
    content:
      "The reliability and global reach of RapidServe's CDN have been crucial for our streaming platform's success.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "DevOps Manager at CloudScale",
    content:
      "Integration was seamless, and the performance metrics speak for themselves. Our load times decreased by 60%.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    rating: 5,
  },
];

export const faqs = [
  {
    question: "What makes RapidServe different from other CDN providers?",
    answer:
      "RapidServe combines edge computing, advanced file chunking, and real-time synchronization to deliver unparalleled performance. Our unique architecture ensures 99.99% uptime and global latency under 50ms.",
  },
  {
    question: "How does RapidServe ensure data security?",
    answer:
      "We implement multiple layers of security including end-to-end encryption, advanced DDoS protection, and SSL/TLS encryption. All data centers are SOC 2 compliant, and we regularly undergo security audits.",
  },
  {
    question: "How does RapidServe handle file uploads efficiently?",
    answer:
      "RapidServe utilizes file chunking, SHA-256 hash verification, and pre-signed URLs for secure and efficient uploads. It also checks for duplicate chunks to reduce storage redundancy and optimize performance.",
  },
  {
    question: "What happens if a storage node fails?",
    answer:
      "RapidServe ensures fault tolerance by replicating file chunks across multiple storage nodes. If a node fails, the system automatically retrieves data from the nearest available replica, maintaining uninterrupted access.",
  },
  {
    question: "How does RapidServe synchronize files across multiple devices?",
    answer:
      "Our Sync Service continuously monitors file changes, detects modifications at the chunk level, and updates only the modified parts. Real-time notifications keep all devices up to date instantly.",
  },
  {
    question: "Does RapidServe support role-based access control (RBAC)?",
    answer:
      "Yes, we implement RBAC to ensure secure access control. Users and administrators can define specific permissions for files and folders, preventing unauthorized access.",
  },
  {
    question: "How does RapidServe optimize file downloads?",
    answer:
      "RapidServe retrieves file chunks in parallel from the nearest storage nodes, verifies integrity using SHA-256 hashes, and reconstructs the file on the client side for fast and reliable downloads.",
  },
  {
    question: "Does RapidServe integrate with a CDN for faster delivery?",
    answer:
      "Yes, we integrate with Cloudflare and AWS CloudFront to cache frequently accessed files closer to end users, improving download speeds and reducing latency.",
  },
  {
    question: "How does RapidServe monitor system performance?",
    answer:
      "We use Prometheus for real-time monitoring and Grafana for data visualization. Automated alerting ensures that any issues are detected and resolved promptly.",
  },
  {
    question: "Is RapidServe scalable for enterprise use?",
    answer:
      "Absolutely! We use load balancing, distributed storage, and metadata sharding to handle high traffic and large-scale enterprise workloads efficiently.",
  },
];

export const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Support", href: "#" },
      { label: "Status", href: "#" },
      { label: "Security", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

export const navBarLinks = [
  {
    label: "Mission",
    href: "#mission",
  },
  {
    label: "Why Us",
    href: "#values",
  },
  {
    label: "Walkthrough",
    href: "#how-it-works",
  },
  {
    label: "Contact",
    href: "#contact",
  },
];
