import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";

export type ChecklistStep = { id: string; label: string; done: boolean; href: string };

export function SetupChecklist({ steps }: { steps: ChecklistStep[] }) {
  const done = steps.filter((s) => s.done).length;
  const complete = done === steps.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div>
          <CardTitle>{complete ? "You're all set" : "Finish setting up"}</CardTitle>
          <CardDescription>
            {done} of {steps.length} steps complete
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <Progress value={done} max={steps.length} tone={complete ? "success" : "accent"} className="mb-3" />
        <ul>
          {steps.map((step) => (
            <li key={step.id}>
              <Link
                href={step.href}
                aria-disabled={step.done}
                className={cn(
                  "-mx-2 flex items-center gap-3 rounded-md px-2 py-2 text-body transition-colors",
                  step.done ? "text-ink-3" : "text-ink hover:bg-surface-2"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    step.done ? "border-success bg-success text-white" : "border-line-2 bg-surface"
                  )}
                >
                  {step.done && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span className={cn("flex-1", step.done && "line-through decoration-ink-4")}>{step.label}</span>
                {!step.done && <ChevronRight className="h-4 w-4 text-ink-3" />}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
