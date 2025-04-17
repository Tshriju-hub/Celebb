"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Pagination = ({ count }) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const page = parseInt(searchParams.get("page")) || 1;
  const ITEM_PER_PAGE = 4;
  const startIndex = ITEM_PER_PAGE * (page - 1);
  const endIndex = Math.min(startIndex + ITEM_PER_PAGE, count);

  const hasPrev = startIndex > 0;
  const hasNext = endIndex < count;

  const handlePaginationChange = (type) => {
    const nextPage = type === "prev" ? page - 1 : page + 1;
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", nextPage);
    replace(`${pathname}?${newParams}`);
  };

  return (
    <div className="bg-white px-2 py-2">
      <div className="flex justify-between">
        <button
          className="py-2 px-4 cursor-pointer bg-gray-900 text-white rounded-full font-serif"
          disabled={!hasPrev}
          onClick={() => handlePaginationChange("prev")}
          aria-label="Previous Page"
        >
          Prev
        </button>
        <button
          className="py-2 px-4 cursor-pointer bg-gray-900 text-white rounded-full font-serif"
          disabled={!hasNext}
          onClick={() => handlePaginationChange("next")}
          aria-label="Next Page"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
