import React from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("ellipsis-start");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("ellipsis-end");
    if (!pages.includes(totalPages)) pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center space-x-2 py-6">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 w-9 rounded-sm border-2 border-[hsl(0,80%,50%)]/20 text-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)] hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page, idx) => {
        if (typeof page === "string") {
          return (
            <div key={`ellipsis-${idx}`} className="flex items-center justify-center w-9">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>
          );
        }
        return (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={`h-9 w-9 rounded-sm border-2 ${
              currentPage === page
                ? "bg-[hsl(0,80%,50%)] border-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
                : "border-[hsl(0,80%,50%)]/20 text-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)] hover:text-white"
            }`}
          >
            {page}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 w-9 rounded-sm border-2 border-[hsl(0,80%,50%)]/20 text-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)] hover:text-white"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
