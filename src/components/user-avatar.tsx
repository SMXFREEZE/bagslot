import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials, cn } from "@/lib/utils";

export function UserAvatar({
  name,
  url,
  className,
}: {
  name?: string | null;
  url?: string | null;
  className?: string;
}) {
  return (
    <Avatar className={cn("h-10 w-10", className)}>
      {url ? <AvatarImage src={url} alt={name ?? "User"} /> : null}
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
