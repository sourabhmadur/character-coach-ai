import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CharacterCardProps {
  name: string;
  title: string;
  focus: string;
  image: string;
  description: string;
}

export const CharacterCard = ({ name, title, focus, image, description }: CharacterCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden bg-gradient-to-b from-card to-card/80 border-border hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:scale-105">
      <div className="aspect-square overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-1">{name}</h3>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">{title}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-accent font-semibold">Focus:</span>
            <span className="text-foreground">{focus}</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
        <Button 
          variant="hero" 
          className="w-full"
          onClick={() => navigate(`/subscribe/${name.toLowerCase().replace(' ', '-')}`)}
        >
          Get Motivated
        </Button>
      </div>
    </Card>
  );
};
