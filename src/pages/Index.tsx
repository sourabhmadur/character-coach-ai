import { CharacterCard } from "@/components/CharacterCard";
import gogginsImg from "@/assets/goggins.jpg";
import tyrionImg from "@/assets/tyrion.jpg";
import dalaiLamaImg from "@/assets/dalai-lama.jpg";

const Index = () => {
  const characters = [
    {
      name: "David Goggins",
      title: "The Warrior",
      focus: "Fitness & Mental Toughness",
      image: gogginsImg,
      description: "Push beyond your limits with relentless determination and discipline."
    },
    {
      name: "Tyrion Lannister",
      title: "The Scholar",
      focus: "Reading & Knowledge",
      image: tyrionImg,
      description: "Expand your mind through the wisdom found in books."
    },
    {
      name: "Dalai Lama",
      title: "The Enlightened",
      focus: "Meditation & Inner Peace",
      image: dalaiLamaImg,
      description: "Find tranquility and balance through mindful meditation."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-20"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Choose Your Mentor
            </h1>
            <p className="text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
              Select a character who will inspire and motivate you to achieve your goals through personalized email guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {characters.map((character) => (
              <CharacterCard key={character.name} {...character} />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">1</div>
              <h3 className="font-semibold text-foreground">Choose Your Character</h3>
              <p className="text-muted-foreground text-sm">Select a mentor that aligns with your goals</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">2</div>
              <h3 className="font-semibold text-foreground">Share Your Goal</h3>
              <p className="text-muted-foreground text-sm">Tell us what you want to achieve</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">3</div>
              <h3 className="font-semibold text-foreground">Get Motivated</h3>
              <p className="text-muted-foreground text-sm">Receive personalized motivation emails</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
