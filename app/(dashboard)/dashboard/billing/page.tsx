import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Download,
} from "lucide-react"
import { BillingSummary } from "@/components/dashboard/billing/summary"
import { PlanDetails } from "@/components/dashboard/billing/plan-details"
import { PaymentMethods } from "@/components/dashboard/billing/payment-methods"

export default async function BillingPage() {
  
  const invoices = [
    {
      id: "INV-2024-001",
      date: "Mar 1, 2024",
      amount: "$24.00",
      status: "Paid",
      items: [
        { name: "Professional Plan", period: "Mar 1 - Mar 31, 2024", amount: "$24.00" }
      ]
    },
    {
      id: "INV-2024-002",
      date: "Feb 1, 2024",
      amount: "$24.00",
      status: "Paid",
      items: [
        { name: "Professional Plan", period: "Feb 1 - Feb 29, 2024", amount: "$24.00" }
      ]
    },
    {
      id: "INV-2024-003",
      date: "Jan 1, 2024",
      amount: "$24.00",
      status: "Paid",
      items: [
        { name: "Professional Plan", period: "Jan 1 - Jan 31, 2024", amount: "$24.00" }
      ]
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-1">Manage your subscription and payment methods</p>
        </div>
        <Button>Contact Sales</Button>
      </div>

      {/* Current Usage Summary */}
      <BillingSummary />
      
      <PlanDetails />

      {/* Payment Methods */}
      <PaymentMethods />

      {/* Billing History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View and download your invoices</CardDescription>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Invoices</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {invoice.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}