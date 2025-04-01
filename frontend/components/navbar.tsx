import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

export default function Navbar({ onAddClick }: { onAddClick?: () => void }) {
  const router = useRouter();

  const isActive = (path: string) => router.pathname === path;

  return (
    <header className="bottom-12 left-0 right-0 fixed max-w-3xl mx-auto text-body-light">
      <div className="bg-black md:rounded-xl shadow-md">
        <div className="px-16 py-2 flex justify-between align-middle py-6">
          <Link href="/" legacyBehavior>
            <span
              className={`flex flex-col justify-center items-center ${
                isActive("/") ? "text-accent" : ""
              }`}
            >
              <svg
                width={44}
                height={48}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    d="M9.53589 6.90909C9.53589 5.85473 10.4868 5 11.6599 5C12.8329 5 13.7839 5.85473 13.7839 6.90909C13.7839 7.40532 13.6046 7.85733 13.2925 8.19682C12.6948 8.84706 11.8015 9.50197 11.8015 10.3455V10.6299M11.8015 10.6299C12.533 10.6214 13.2674 10.8246 13.8845 11.2406L21.317 16.2509C22.6234 17.1315 21.9305 19 20.2975 19H3.70254C2.08721 19 1.38322 17.1648 2.65531 16.27L9.751 11.2787C10.3534 10.855 11.076 10.6383 11.8015 10.6299Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  ></path>{" "}
                </g>
              </svg>
              <p className="mt-auto text-sm">Closet</p>
            </span>
          </Link>
          <Link href="/listings" legacyBehavior>
            <span
              className={`flex flex-col justify-center items-center ${
                isActive("/listings") ? "text-accent" : ""
              }`}
            >
              <svg
                width={44}
                height={44}
                viewBox="0 0 1024 1024"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    fill="currentColor"
                    d="M704 288h131.072a32 32 0 0 1 31.808 28.8L886.4 512h-64.384l-16-160H704v96a32 32 0 1 1-64 0v-96H384v96a32 32 0 0 1-64 0v-96H217.92l-51.2 512H512v64H131.328a32 32 0 0 1-31.808-35.2l57.6-576a32 32 0 0 1 31.808-28.8H320v-22.336C320 154.688 405.504 64 512 64s192 90.688 192 201.664v22.4zm-64 0v-22.336C640 189.248 582.272 128 512 128c-70.272 0-128 61.248-128 137.664v22.4h256zm201.408 483.84L768 698.496V928a32 32 0 1 1-64 0V698.496l-73.344 73.344a32 32 0 1 1-45.248-45.248l128-128a32 32 0 0 1 45.248 0l128 128a32 32 0 1 1-45.248 45.248z"
                  ></path>
                </g>
              </svg>
              <p className="mt-auto text-sm">Listings</p>
            </span>
          </Link>
          <button onClick={onAddClick}>
            <span className="flex flex-col justify-center items-center">
              <Image
                src="/images/icons/add.svg"
                alt="Add"
                width={64}
                height={64}
                className="h-16 w-auto"
              />
            </span>
          </button>
          <Link href="/add-item" legacyBehavior>
            <span
              className={`flex flex-col justify-center items-center ${
                isActive("/try-on") ? "text-accent" : ""
              }`}
            >
              <svg
                width={44}
                height={44}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="1.5"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.7899 6.0463C11.9232 5.98457 12.0768 5.98457 12.2101 6.0463L17.2101 8.36209C17.3869 8.44395 17.5 8.62101 17.5 8.81579V14.6053C17.5 14.7837 17.4049 14.9486 17.2505 15.038L12.2505 17.9327C12.0956 18.0224 11.9044 18.0224 11.7495 17.9327L6.74948 15.038C6.59507 14.9486 6.5 14.7837 6.5 14.6053V8.81579C6.5 8.62101 6.61312 8.44395 6.78987 8.36209L11.7899 6.0463ZM7.5 9.62608L11.5 11.6331V16.6328L7.5 14.317V9.62608ZM12.5 16.6328L16.5 14.317V9.62608L12.5 11.6331V16.6328ZM12 10.7652L15.8492 8.83381L12 7.05103L8.15082 8.83381L12 10.7652Z"
                    fill="currentColor"
                  ></path>{" "}
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2.5 3C2.5 2.72386 2.72386 2.5 3 2.5H6C6.27614 2.5 6.5 2.72386 6.5 3C6.5 3.27614 6.27614 3.5 6 3.5H3.5V6C3.5 6.27614 3.27614 6.5 3 6.5C2.72386 6.5 2.5 6.27614 2.5 6V3Z"
                    fill="currentColor"
                  ></path>{" "}
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M21 2.5C21.2761 2.5 21.5 2.72386 21.5 3V6C21.5 6.27614 21.2761 6.5 21 6.5C20.7239 6.5 20.5 6.27614 20.5 6V3.5L18 3.5C17.7239 3.5 17.5 3.27614 17.5 3C17.5 2.72386 17.7239 2.5 18 2.5L21 2.5Z"
                    fill="currentColor"
                  ></path>{" "}
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3 21.5C2.72386 21.5 2.5 21.2761 2.5 21L2.5 18C2.5 17.7239 2.72386 17.5 3 17.5C3.27614 17.5 3.5 17.7239 3.5 18L3.5 20.5H6C6.27614 20.5 6.5 20.7239 6.5 21C6.5 21.2761 6.27614 21.5 6 21.5H3Z"
                    fill="currentColor"
                  ></path>{" "}
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M21.5 21C21.5 21.2761 21.2761 21.5 21 21.5H18C17.7239 21.5 17.5 21.2761 17.5 21C17.5 20.7239 17.7239 20.5 18 20.5H20.5V18C20.5 17.7239 20.7239 17.5 21 17.5C21.2761 17.5 21.5 17.7239 21.5 18V21Z"
                    fill="currentColor"
                  ></path>{" "}
                </g>
              </svg>
              <p className="mt-auto text-sm">Try On</p>
            </span>
          </Link>
          <Link href="/calendar" legacyBehavior>
            <span
              className={`flex flex-col justify-center items-center ${
                isActive("/calendar") ? "text-accent" : ""
              }`}
            >
              <svg
                width={44}
                height={44}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    d="M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21ZM8 16.5L10.025 16.095C10.2015 16.0597 10.2898 16.042 10.3721 16.0097C10.4452 15.9811 10.5147 15.9439 10.579 15.899C10.6516 15.8484 10.7152 15.7848 10.8426 15.6574L15 11.5C15.5523 10.9477 15.5523 10.0523 15 9.5C14.4477 8.94772 13.5523 8.94772 13 9.5L8.84255 13.6574C8.71523 13.7848 8.65157 13.8484 8.60098 13.921C8.55608 13.9853 8.51891 14.0548 8.49025 14.1279C8.45796 14.2102 8.44031 14.2985 8.40499 14.475L8 16.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                </g>
              </svg>
              <p className="mt-auto text-sm">OOTDs</p>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
