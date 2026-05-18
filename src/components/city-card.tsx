import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

interface Props {
  city: string;
  country: string;
  image: string;
  trips: number;
  fromPrice: number;
  href: string;
}

export function CityCard({ city, country, image, trips, fromPrice, href }: Props) {
  return (
    <Link
      href={href}
      className="group relative block aspect-[4/5] overflow-hidden rounded-2xl"
    >
      <Image
        src={image}
        alt={city}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition duration-500 group-hover:scale-[1.04]"
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-white/70">{country}</div>
            <div className="mt-0.5 text-xl font-semibold tracking-tight">{city}</div>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur transition group-hover:bg-white group-hover:text-foreground">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">
            {trips} active {trips === 1 ? "trip" : "trips"}
          </span>
          <span className="font-medium">from ${fromPrice}</span>
        </div>
      </div>
    </Link>
  );
}
