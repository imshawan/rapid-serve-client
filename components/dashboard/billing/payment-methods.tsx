"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Form, FormField, FormItem, 
  FormLabel, FormControl, FormMessage 
} from "@/components/ui/form";

import { CreditCard, Plus } from "lucide-react";
import { cn } from "@/lib/utils/common";
import { toast } from "@/hooks/use-toast";

const cardSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be 16 digits"),
  expiryMonth: z.string().min(1, "Select a month"),
  expiryYear: z.string().min(4, "Select a year"),
  cvc: z.string().regex(/^\d{3}$/, "CVC must be 3 digits")
});

export function PaymentMethods() {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null);
  const [cardToDelete, setCardToDelete] = useState<number | null>(null);
  
  const [savedCards, setSavedCards] = useState([
    {
      id: "1",
      cardNumber: "4242424242424242",
      expiryMonth: "12",
      expiryYear: "2025",
      cvc: "123",
      default: true
    }
  ]);

  const form = useForm<z.infer<typeof cardSchema>>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvc: ""
    }
  });

  const { reset } = form;

  const handleSave = (values: z.infer<typeof cardSchema>) => {
    if (editingCardIndex !== null) {
      const updatedCards = [...savedCards];
      updatedCards[editingCardIndex] = {...updatedCards[editingCardIndex], ...values };
      setSavedCards(updatedCards);
    } else {
      const newCard = { ...values, id: String(savedCards.length + 1) };
      // If it's the first card, set as default
      setSavedCards([...savedCards, {...newCard, default: savedCards.length === 0}]);
    }
    setIsAddingCard(false);
    setEditingCardIndex(null);
  };

  const handleEdit = (index: number) => {
    const card = savedCards[index];
    form.reset(card);
    setEditingCardIndex(index);
    setIsAddingCard(true);
  };

  const confirmDelete = (index: number) => {
    if (savedCards[index].default) {
      toast({
        title: "Cannot delete default card",
        description: "Please set another card as default before deleting this one.",
        variant: "destructive"
      })
      return;
    }
    setCardToDelete(index);
  };

  const removeCard = () => {
    if (cardToDelete !== null) {
      const updatedCards = savedCards.filter((_, i) => i !== cardToDelete);
      setSavedCards(updatedCards);
      setCardToDelete(null);
    }
  };

  const setAsDefault = (id: string) => {
    setSavedCards(savedCards.map(card => ({
      ...card,
      default: card.id === id
    })));
  };

  const formatCardNumber = (cardNumber: string) => cardNumber.slice(-4);

  const handleReset = () => {
    reset();
    setIsAddingCard(false);
    setEditingCardIndex(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>Manage your payment details</CardDescription>
          </div>
          <Button onClick={() => { reset(); setIsAddingCard(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {savedCards.map((card, index) => (
          <div key={card.id} className={cn(
            "flex items-center justify-between p-4 border rounded-lg",
            card.default ? "border-primary bg-gray-100 dark:bg-blue-500/5" : ""
            )}>
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-muted p-2">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• {formatCardNumber(card.cardNumber)}</p>
                <p className="text-sm text-muted-foreground">Expires {card.expiryMonth}/{card.expiryYear}</p>
                {card.default && <p className="text-primary text-sm font-semibold">Default</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
            {!card.default && (
                <Button variant="outline" size="sm" onClick={() => setAsDefault(card.id)}>
                  Set as Default
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => handleEdit(index)}>Edit</Button>
              <Button variant="ghost" size="sm" onClick={() => confirmDelete(index)} className="text-destructive">
                Remove
              </Button>
            </div>
          </div>
        ))}
      </CardContent>

      {/* Add / Edit Card Dialog */}
      <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCardIndex !== null ? "Edit Payment Method" : "Add Payment Method"}</DialogTitle>
            <DialogDescription>Enter your card details</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <FormField name="cardNumber" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input placeholder="4242 4242 4242 4242" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <div className="grid grid-cols-3 gap-4">
                <FormField name="expiryMonth" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Month</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                              {new Date(2000, i).toLocaleString("default", { month: "long" })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField name="expiryYear" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Year</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i} value={String(new Date().getFullYear() + i)}>
                              {new Date().getFullYear() + i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField name="cvc" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVC</FormLabel>
                    <FormControl>
                      <Input placeholder="123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={handleReset}>Cancel</Button>
                <Button type="submit">{editingCardIndex !== null ? "Save Changes" : "Add Card"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={cardToDelete !== null} onOpenChange={() => setCardToDelete(null)}>
        <DialogContent>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>Are you sure you want to remove this card?</DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCardToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={removeCard}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}