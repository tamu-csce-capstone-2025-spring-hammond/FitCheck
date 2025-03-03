import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bottom-12 left-0 right-0 fixed max-w-3xl mx-auto text-body-light">
      <div className="bg-black md:rounded-xl shadow-md">
        <div className="px-16 py-2 flex justify-between align-middle py-6">
          <Link href="/closet" legacyBehavior>
            <a className="flex flex-col justify-center items-center active:text-accent active:fill-accent">
              <img
                src="/images/icons/closet.svg"
                alt="Closet"
                className="h-12"
              />
              <p className="mt-auto text-sm">Closet</p>
            </a>
          </Link>
          <Link href="/listings" legacyBehavior>
            <a className="flex flex-col justify-center items-center active:text-accent active:fill-accent">
              <img
                src="/images/icons/listings.svg"
                alt="Listings"
                className="h-11 mb-auto"
              />
              <p className="mt-auto text-sm">Listings</p>
            </a>
          </Link>
          <Link href="/add" legacyBehavior>
            <a className="flex flex-col justify-center items-center active:text-accent active:fill-accent">
              <img src="/images/icons/add.svg" alt="Add" className="h-16" />
            </a>
          </Link>
          <Link href="/try-on" legacyBehavior>
            <a className="flex flex-col justify-center items-center active:text-accent active:fill-accent">
              <img
                src="/images/icons/try-on.svg"
                alt="Try On"
                className="h-12"
              />
              <p className="mt-auto text-sm">Try On</p>
            </a>
          </Link>
          <Link href="/calendar" legacyBehavior>
            <a className="flex flex-col justify-center items-center active:text-accent active:fill-accent">
              <img
                src="/images/icons/calendar.svg"
                alt="Calendar"
                className="h-12"
              />
              <p className="mt-auto text-sm">Calendar</p>
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
}
