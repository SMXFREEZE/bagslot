import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { Star } from "lucide-react";

interface Props {
  name: string;
  role: string;
  quote: string;
  avatar?: string;
  rating?: number;
}

export function TestimonialCard({ name, role, quote, avatar, rating = 5 }: Props) {
  return (
    <Card className="flex h-full flex-col p-6">
      <div className="flex items-center gap-1">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="mt-4 text-[15px] leading-relaxed text-foreground">&ldquo;{quote}&rdquo;</p>
      <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
        <UserAvatar name={name} url={avatar} className="h-10 w-10" />
        <div>
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs text-muted-foreground">{role}</div>
        </div>
      </div>
    </Card>
  );
}
