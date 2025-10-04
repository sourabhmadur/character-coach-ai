import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionFormProps {
  characterName: string;
}

export const SubscriptionForm = ({ characterName }: SubscriptionFormProps) => {
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !goal) {
      toast.error("Please fill out all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          email: email.trim(),
          character_name: characterName,
          goal: goal.trim()
        });

      if (error) throw error;

      toast.success("Successfully subscribed! Get ready for motivation!");
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error submitting subscription:', error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-secondary border-border text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal" className="text-foreground">Your Goal</Label>
        <Textarea
          id="goal"
          placeholder="Describe your goal and what you want to achieve..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          required
          rows={5}
          className="bg-secondary border-border text-foreground resize-none"
        />
      </div>

      <Button 
        type="submit" 
        variant="hero" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Subscribing..." : "Start Your Journey"}
      </Button>
    </form>
  );
};
