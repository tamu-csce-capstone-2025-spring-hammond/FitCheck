import Link from "next/link";
import Image from "next/image";

export default function Navbar({ onAddClick }: { onAddClick?: () => void }) {
  return (
    <header className="bottom-12 left-0 right-0 fixed max-w-3xl mx-auto text-body-light">
      <div className="bg-black md:rounded-xl shadow-md">
        <div className="px-16 py-2 flex justify-between align-middle py-6">
          <Link href="/" legacyBehavior>
            <span className="flex flex-col justify-center items-center active:text-accent active:fill-accent">
              <Image
                src="/images/icons/closet.svg"
                alt="Closet"
                width={48}
                height={48}
                className="h-12 w-auto"
              />
              <p className="mt-auto text-sm">Closet</p>
            </span>
          </Link>
          <Link href="/listings" legacyBehavior>
            <span className="flex flex-col justify-center items-center active:text-accent active:fill-accent">
              <Image
                src="/images/icons/listings.svg"
                alt="Listings"
                width={44}
                height={44}
                className="h-11 w-auto mb-auto"
              />
              <p className="mt-auto text-sm">Listings</p>
            </span>
          </Link>
          <button onClick={onAddClick}>
            <span className="flex flex-col justify-center items-center active:text-accent active:fill-accent">
              <Image
                src="/images/icons/add.svg"
                alt="Add"
                width={64}
                height={64}
                className="h-16 w-auto"
              />
            </span>
          </button>
          <Link href="/try-on" legacyBehavior>
            <span className="flex flex-col justify-center items-center active:text-accent active:fill-accent">
              <Image
                src="/images/icons/try-on.svg"
                alt="Try On"
                width={48}
                height={48}
                className="h-12 w-auto"
              />
              <p className="mt-auto text-sm">Try On</p>
            </span>
          </Link>
          <Link href="/calendar" legacyBehavior>
            <span className="flex flex-col justify-center items-center active:text-accent active:fill-accent">
              <Image
                src="/images/icons/calendar.svg"
                alt="Calendar"
                width={48}
                height={48}
                className="h-12 w-auto"
              />
              <p className="mt-auto text-sm">Calendar</p>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
