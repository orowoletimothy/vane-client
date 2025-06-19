"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import api from "@/lib/api";
import { toast } from "sonner";

interface DailyMoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMoodSaved: () => void;
}

const MOODS = [
  {
    emoji: "😊",
    label: "Happy",
    quote:
      "Your positive energy is contagious! Keep spreading those good vibes today.",
  },
  {
    emoji: "😐",
    label: "Neutral",
    quote:
      "Every small step forward is progress. Today is full of possibilities waiting to unfold.",
  },
  {
    emoji: "😔",
    label: "Sad",
    quote:
      "It's okay to feel this way. Tomorrow brings new hope, and you're stronger than you know.",
  },
  {
    emoji: "😤",
    label: "Frustrated",
    quote:
      "Channel that energy into action! Your determination will turn obstacles into opportunities.",
  },
  {
    emoji: "🥳",
    label: "Excited",
    quote:
      "Your enthusiasm is your superpower! Use this energy to make today absolutely amazing.",
  },
  {
    emoji: "😴",
    label: "Tired",
    quote:
      "Rest when you need to, but remember: even small efforts today can lead to big victories.",
  },
  {
    emoji: "🤔",
    label: "Thoughtful",
    quote:
      "Deep thinking leads to wise actions. Trust your intuition and take that next step.",
  },
  {
    emoji: "😰",
    label: "Anxious",
    quote:
      "You've overcome challenges before, and you will again. Take it one breath at a time.",
  },
];

export function DailyMoodModal({
  isOpen,
  onClose,
  onMoodSaved,
}: DailyMoodModalProps) {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [motivation, setMotivation] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMoodData = MOODS.find((m) => m.emoji === selectedMood);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast.error("Please select a mood");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/mood", {
        mood: selectedMood,
        motivation: motivation.trim(),
      });

      toast.success("Daily mood saved!");
      onMoodSaved();
      onClose();
    } catch (error) {
      console.error("Error saving mood:", error);
      toast.error("Failed to save mood");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-auto">
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            How are you feeling today?
          </DialogTitle>
          <p className="text-gray-600 text-sm">
            Take a moment to check in with yourself
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mood Selection Grid */}
          <div className="grid grid-cols-4 gap-3">
            {MOODS.map((mood) => (
              <Card
                key={mood.emoji}
                className={`p-4 cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedMood === mood.emoji
                    ? "ring-2 ring-orange-500 bg-orange-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleMoodSelect(mood.emoji)}
              >
                <div className="text-center space-y-2">
                  <div className="text-3xl">{mood.emoji}</div>
                  <div className="text-xs font-medium text-gray-700">
                    {mood.label}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Motivational Quote */}
          {selectedMood && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border-l-4 border-orange-400">
                <p className="text-sm font-medium text-gray-800 italic">
                  "{selectedMoodData?.quote}"
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Add your own motivation note (optional)
                </label>
                <Textarea
                  placeholder="Write something to motivate yourself today..."
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  className="resize-none"
                  rows={3}
                  maxLength={200}
                />
                <div className="text-xs text-gray-500 text-right">
                  {motivation.length}/200
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
              disabled={isSubmitting}
            >
              Skip for now
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedMood || isSubmitting}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              {isSubmitting ? "Saving..." : "Save Mood"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
