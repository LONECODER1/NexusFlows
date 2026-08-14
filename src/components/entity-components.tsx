"use client";

import {
  AlertTriangleIcon,
  ChevronRightIcon,
  Loader2Icon,
  MoreVerticalIcon,
  PackageOpenIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type EntityHeaderProps = {
  title: string;
  description?: string;
  newButtonLabel?: string;
  disabled?: boolean;
  isCreating?: boolean;
} & (
  | { onNew: () => void; newButtonHref?: never }
  | { newButtonHref: string; onNew?: never }
  | { onNew?: never; newButtonHref?: never }
);

export const EntityHeader = ({
  title,
  description,
  onNew,
  newButtonHref,
  newButtonLabel,
  disabled,
  isCreating,
}: EntityHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {onNew && !newButtonHref && (
        <Button
          disabled={Boolean(isCreating || disabled)}
          size="sm"
          className="shrink-0 shadow-sm"
          onClick={onNew}
        >
          <PlusIcon className="size-4" />
          {newButtonLabel}
        </Button>
      )}
      {newButtonHref && !onNew && (
        <Button size="sm" asChild className="shrink-0 shadow-sm">
          <Link href={newButtonHref} prefetch>
            <PlusIcon className="size-4" />
            {newButtonLabel}
          </Link>
        </Button>
      )}
    </div>
  );
};

type EntityContainerProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  search?: React.ReactNode;
  pagination?: React.ReactNode;
};

export const EntityContainer = ({
  children,
  header,
  search,
  pagination,
}: EntityContainerProps) => {
  return (
    <div className="min-h-full p-4 md:px-8 md:py-8">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6">
        <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm md:p-8">
          {header}
          {(search || children || pagination) && (
            <div className="mt-6 flex flex-col gap-5">
              {search}
              <div className="min-h-[320px]">{children}</div>
              {pagination}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface EntitySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const EntitySearch = ({
  value,
  onChange,
  placeholder = "Search",
}: EntitySearchProps) => {
  return (
    <div className="relative w-full sm:ml-auto sm:max-w-xs">
      <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="h-10 border-border/60 bg-background/80 pl-9 shadow-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

interface EntityPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const EntityPagination = ({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: EntityPaginationProps) => {
  const isDisabled = Boolean(disabled);
  const safeTotalPages = Math.max(totalPages, 1);
  const isFirstPage = page <= 1;
  const isLastPage = page >= safeTotalPages || safeTotalPages === 0;

  return (
    <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {safeTotalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          disabled={isFirstPage || isDisabled}
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Previous
        </Button>
        <Button
          disabled={isLastPage || isDisabled}
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

interface StateViewProps {
  message?: string;
}

export const LoadingView = ({ message }: StateViewProps) => {
  return (
    <div className="flex h-full min-h-[240px] flex-1 flex-col items-center justify-center gap-3">
      <Loader2Icon className="size-7 animate-spin text-primary" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
};

export { EntityListSkeleton } from "./entity-list-skeleton";

export const ErrorView = ({ message }: StateViewProps) => {
  return (
    <div className="flex h-full min-h-[240px] flex-1 flex-col items-center justify-center gap-3">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertTriangleIcon className="size-6 text-destructive" />
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
};

interface EmptyViewProps extends StateViewProps {
  onNew?: () => void;
}

export const EmptyView = ({ message, onNew }: EmptyViewProps) => {
  return (
    <Empty className="rounded-xl border border-dashed border-border/70 bg-muted/20">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PackageOpenIcon />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>No items yet</EmptyTitle>
      {message && <EmptyDescription>{message}</EmptyDescription>}
      {onNew && (
        <EmptyContent>
          <Button onClick={onNew}>Create your first item</Button>
        </EmptyContent>
      )}
    </Empty>
  );
};

interface EntityListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey?: (item: T, index: number) => string | number;
  emptyView?: React.ReactNode;
  className?: string;
}

export function EntityList<T>({
  items,
  renderItem,
  getKey,
  emptyView,
  className,
}: EntityListProps<T>) {
  if (items.length === 0 && emptyView) {
    return (
      <div className="flex flex-1 items-center justify-center py-8">
        <div className="mx-auto w-full max-w-md">{emptyView}</div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item, index) => (
        <div key={getKey ? getKey(item, index) : index}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

interface EntityItemProps {
  href: string;
  title: string;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  image?: React.ReactNode;
  actions?: React.ReactNode;
  onRemove?: () => void | Promise<void>;
  isRemoving?: boolean;
  className?: string;
}

export const EntityItem = ({
  href,
  title,
  subtitle,
  badge,
  image,
  actions,
  onRemove,
  isRemoving,
  className,
}: EntityItemProps) => {
  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRemoving || !onRemove) {
      return;
    }

    await onRemove();
  };

  return (
    <Link href={href} prefetch className="group block">
      <Card
        className={cn(
          "border-border/60 bg-background/70 p-0 shadow-none transition-all duration-200",
          "hover:border-primary/20 hover:bg-background hover:shadow-md",
          isRemoving && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex min-w-0 items-center gap-3">
            {image && (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/60 ring-1 ring-border/50">
                {image}
              </div>
            )}
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="truncate text-base font-medium">
                  {title}
                </CardTitle>
                {badge}
              </div>
              {subtitle && (
                <CardDescription className="line-clamp-2 text-xs leading-relaxed">
                  {subtitle}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {actions}
            {onRemove && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 opacity-70 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVerticalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem onClick={handleRemove}>
                    <TrashIcon className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <ChevronRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
