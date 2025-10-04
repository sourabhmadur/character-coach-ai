import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubscriptionForm } from "@/components/SubscriptionForm";
import gogginsImg from "@/assets/goggins.jpg";
import tyrionImg from "@/assets/tyrion.jpg";
import dalaiLamaImg from "@/assets/dalai-lama.jpg";

const characters = {
  "david-goggins": {
    name: "David Goggins",
    title: "The Warrior",
    focus: "Fitness & Mental Toughness",
    image: gogginsImg,
    bio: "Former Navy SEAL and ultramarathon runner. David Goggins will push you beyond your limits and help you discover your true potential through discipline and relentless determination.",
    quote: "Stay hard. Don't stop when you're tired. Stop when you're done."
  },
  "tyrion-lannister": {
    name: "Tyrion Lannister",
    title: "The Scholar",
    focus: "Reading & Knowledge",
    image: tyrionImg,
    bio: "The wisest mind in Westeros. Tyrion will guide you through the world of books and knowledge, helping you expand your mind one page at a time.",
    quote: "A mind needs books like a sword needs a whetstone, if it is to keep its edge."
  },
  "dalai-lama": {
    name: "Dalai Lama",
    title: "The Enlightened",
    focus: "Meditation & Inner Peace",
    image: dalaiLamaImg,
    bio: "Spiritual leader and advocate for peace. The Dalai Lama will guide you on a journey to inner peace through meditation and mindfulness.",
    quote: "Peace comes from within. Do not seek it without."
  }
};

const CharacterSubscription = () => {
  const { character } = useParams<{ character: string }>();
  const navigate = useNavigate();
  
  const characterData = character ? characters[character as keyof typeof characters] : null;

  if (!characterData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Character not found</h1>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-8 hover:bg-secondary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Characters
        </Button>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="rounded-xl overflow-hidden shadow-[var(--shadow-card)]">
              <img 
                src={characterData.image} 
                alt={characterData.name}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="space-y-4 bg-card p-6 rounded-xl border border-border">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{characterData.name}</h1>
                <p className="text-accent uppercase tracking-wide font-semibold">{characterData.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">SPECIALIZES IN</p>
                <p className="text-foreground font-medium">{characterData.focus}</p>
              </div>
              <p className="text-muted-foreground leading-relaxed">{characterData.bio}</p>
              <blockquote className="border-l-4 border-accent pl-4 py-2 italic text-foreground">
                "{characterData.quote}"
              </blockquote>
            </div>
          </div>

          <div className="bg-card p-8 rounded-xl border border-border shadow-[var(--shadow-card)] sticky top-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Subscribe for Motivation</h2>
            <p className="text-muted-foreground mb-6">
              Get personalized motivational emails from {characterData.name} to help you achieve your goals.
            </p>
            <SubscriptionForm characterName={characterData.name} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSubscription;
