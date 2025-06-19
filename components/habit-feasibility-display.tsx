"use client";

import { AlertTriangle, CheckCircle, Info, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FeasibilityMetrics {
  currentHabitCount: number;
  estimatedTimeLoad: number;
  avgCompletionRate: number;
  avgStreakDuration: number;
  timeConflicts: Array<{
    habitTitle: string;
    reminderTime: string;
    timeDifference: number;
  }>;
}

interface FeasibilityResult {
  feasible: boolean;
  confidence: "high" | "medium" | "low";
  message: string;
  warnings: string[];
  suggestions: string[];
  metrics: FeasibilityMetrics;
}

interface HabitFeasibilityDisplayProps {
  feasibility: FeasibilityResult;
  onProceed?: () => void;
  onCancel?: () => void;
}

const ConfidenceBadge = ({
  confidence,
}: {
  confidence: "high" | "medium" | "low";
}) => {
  const variants = {
    high: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <Badge variant="outline" className={variants[confidence]}>
      {confidence.toUpperCase()} CONFIDENCE
    </Badge>
  );
};

export function HabitFeasibilityDisplay({
  feasibility,
  onProceed,
  onCancel,
}: HabitFeasibilityDisplayProps) {
  const { feasible, confidence, message, warnings, suggestions, metrics } =
    feasibility;

  const getIcon = () => {
    if (feasible && confidence === "high")
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (feasible && confidence === "medium")
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    if (feasible && confidence === "low")
      return <Info className="h-5 w-5 text-blue-500" />;
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  const getAlertVariant = () => {
    if (!feasible) return "destructive";
    if (confidence === "high") return "default";
    return "default";
  };

  return (
    <div className="space-y-4">
      <Alert variant={getAlertVariant()}>
        {getIcon()}
        <AlertTitle className="flex items-center gap-2">
          Habit Feasibility Check
          <ConfidenceBadge confidence={confidence} />
        </AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Your Current Habit Load</CardTitle>
            <CardDescription>
              Analysis based on your existing habits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Active Habits:</span>
                <span className="ml-2 font-medium">
                  {metrics.currentHabitCount}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Weekly Time:</span>
                <span className="ml-2 font-medium">
                  {Math.round(metrics.estimatedTimeLoad)} min
                </span>
              </div>
              {metrics.avgCompletionRate > 0 && (
                <div>
                  <span className="text-muted-foreground">Success Rate:</span>
                  <span className="ml-2 font-medium">
                    {Math.round(metrics.avgCompletionRate * 100)}%
                  </span>
                </div>
              )}
              {metrics.avgStreakDuration > 0 && (
                <div>
                  <span className="text-muted-foreground">Avg Streak:</span>
                  <span className="ml-2 font-medium">
                    {Math.round(metrics.avgStreakDuration)} days
                  </span>
                </div>
              )}
            </div>

            {metrics.timeConflicts && metrics.timeConflicts.length > 0 && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-orange-600 mb-2">
                  <Clock className="h-4 w-4" />
                  Time Conflicts Detected
                </div>
                <div className="space-y-1 text-xs">
                  {metrics.timeConflicts.map((conflict, index) => (
                    <div key={index} className="text-muted-foreground">
                      <span className="font-medium">{conflict.habitTitle}</span>{" "}
                      at {conflict.reminderTime}
                      <span className="text-orange-600 ml-1">
                        ({conflict.timeDifference} min difference)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-yellow-600">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  {warning}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-blue-600">Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {(onProceed || onCancel) && (
        <div className="flex gap-2 pt-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          {onProceed && (
            <button
              onClick={onProceed}
              className={`flex-1 px-4 py-2 text-sm rounded-md ${
                feasible
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {feasible ? "Create Habit Anyway" : "I Understand, Create Anyway"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
