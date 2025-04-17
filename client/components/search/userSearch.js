"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

const UserSearch = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((e) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", 1);
    if (e.target.value) {
      e.target.value.length > 2 && params.set("q", e.target.value);
    } else {
      params.delete("q");
    }
    replace(`${pathname}?${params}`);
  }, 300);

  return (
    <div className="relative">
      <svg
        className="h-6 w-6 fill-gray-500 absolute left-2.5 top-2"
        viewBox="0 0 24 24"
      >
        <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" />
      </svg>
      <input
        id="search"
        type="text"
        className="h-10 w-80 border bg-transparent border-gray-500 rounded-lg placeholder-text-gray-400 pl-10 pr-2 py-1"
        placeholder="Search"
        onChange={handleSearch}
      />
    </div>
  );
};

export default UserSearch;
