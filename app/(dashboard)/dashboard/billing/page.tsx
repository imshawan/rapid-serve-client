"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Download, HardDrive, BarChart3, ArrowRight } from "lucide-react"

export default function BillingPage() {
  const storageUsed = 23.4
  const storageLimit = 100
  const storagePercentage = (storageUsed / storageLimit) * 100

  const plans = [
    {
      name: "Basic",
      price: "$8",
      storage: "100 GB",
      features: [
        "100 GB of storage",
        "File sharing",
        "Access on all devices",
        "Basic support"
      ],
      current: true
    },
    {
      name: "Professional",
      price: "$12",
      storage: "500 GB",
      features: [
        "500 GB of storage",
        "Advanced sharing",
        "Priority support",
        "File version history"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$24",
      storage: "2 TB",
      features: [
        "2 TB of storage",
        "Advanced security",
        "24/7 support",
        "Admin controls"
      ]
    }
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Billing & Storage</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage Usage
            </CardTitle>
            <CardDescription>Monitor your storage consumption</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{storageUsed} GB used</span>
                <span>{storageLimit} GB total</span>
              </div>
              <Progress value={storagePercentage} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Files</p>
                <p className="font-medium">1,234</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Shared</p>
                <p className="font-medium">256</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Usage Analytics
            </CardTitle>
            <CardDescription>Your storage usage patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Documents</span>
                <span className="text-sm text-muted-foreground">12.5 GB</span>
              </div>
              <Progress value={45} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Media</span>
                <span className="text-sm text-muted-foreground">8.2 GB</span>
              </div>
              <Progress value={35} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Other</span>
                <span className="text-sm text-muted-foreground">2.7 GB</span>
              </div>
              <Progress value={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Storage Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.popular ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.current ? "outline" : "default"}>
                  {plan.current ? "Current Plan" : "Upgrade"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
          <CardDescription>Manage your payment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-muted p-2">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/24</p>
              </div>
            </div>
            <Button variant="ghost">Update</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: "Mar 1, 2024", amount: "$8.00", status: "Paid" },
              { date: "Feb 1, 2024", amount: "$8.00", status: "Paid" },
              { date: "Jan 1, 2024", amount: "$8.00", status: "Paid" }
            ].map((invoice, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{invoice.date}</p>
                  <p className="text-sm text-muted-foreground">{invoice.amount}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600">{invoice.status}</span>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}