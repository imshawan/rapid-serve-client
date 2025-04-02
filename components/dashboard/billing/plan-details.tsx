"use client";

import _ from "lodash"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { plans } from "@/common/plans";
import { Button } from "@/components/ui/button";
import { Fragment, useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils/common";
import { ArrowRight, Globe, HardDrive } from "lucide-react";
import { useApp } from "@/hooks/use-app";
import { Skeleton as SkeletonPrimitive } from "@/components/ui/skeleton";

export function PlanDetails() {
  const { settings, loadPlanDetails } = useApp()
  const [plan, setPlan] = useState<(typeof plans)[number] | null>(null);

  const chunkArray = useCallback(<T,>(arr: T[], size: number): T[][] => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  }, []);

  useEffect(() => {
    if (settings.loading) return

    const selectedPlan = plans.find((p) => p.name.toLowerCase() === settings.storage.plan.toLowerCase());
    if (!selectedPlan) return;
    setPlan(selectedPlan);

    loadPlanDetails()
  }, []);

  const Skeleton = () => (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Skeleton for Current Plan Title and Description */}
      <SkeletonPrimitive className="h-6 w-1/4 rounded"></SkeletonPrimitive>
      <SkeletonPrimitive className="h-4 w-2/3 rounded"></SkeletonPrimitive>

      {/* Price and Actions Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <SkeletonPrimitive className="h-8 w-16 rounded"></SkeletonPrimitive>
          <SkeletonPrimitive className="h-4 w-32 rounded mt-1"></SkeletonPrimitive>
        </div>
        <div className="flex gap-3">
          <SkeletonPrimitive className="h-10 w-36 rounded"></SkeletonPrimitive>
          <SkeletonPrimitive className="h-10 w-36 rounded"></SkeletonPrimitive>
        </div>
      </div>

      {/* Features Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <SkeletonPrimitive className="h-4 w-4 rounded"></SkeletonPrimitive>
              <SkeletonPrimitive className="h-4 w-3/4 rounded"></SkeletonPrimitive>
            </div>
          ))}
      </div>
    </div>
  )

  return (
    <Fragment>
      {/* Current Plan */}
      <Card className="relative">
        {settings.loading || !plan ? <Skeleton /> : (
          <Fragment>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                You are currently on the {plan?.name} plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">{plan?.price}</p>
                  <p className="text-sm text-muted-foreground">per month, billed monthly</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline">Change Billing Cycle</Button>
                  <Button>Upgrade Plan</Button>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                {plan?.features &&
                  chunkArray(plan.features, 3).map((chunk, chunkIndex) => (
                    <div key={chunkIndex} className="space-y-2">
                      {chunk.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {feature.icon && <feature.icon className="h-4 w-4 text-muted-foreground" />}
                          <span className="text-sm font-medium">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Fragment>
        )}
      </Card>

      {/* Available Plans */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card key={plan.name} className={cn(plan.popular ? "border-primary" : "", "flex flex-col justify-between")}>
              <div className="">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-primary" />
                      <span className="font-medium">{plan.storage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <span className="font-medium">{plan.bandwidth}</span>
                    </div>
                    <ul className="space-y-2 text-sm mt-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                          {feature.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </div>
              <CardFooter>
                <Button className="w-full" variant={_.toLower(settings.storage.plan) === _.toLower(plan.name) ? "outline" : "default"}>
                  {_.toLower(settings.storage.plan) === _.toLower(plan.name) ? "Current Plan" : plan.name === "Enterprise" ? "Contact Sales" : "Upgrade"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Fragment>
  );
}
