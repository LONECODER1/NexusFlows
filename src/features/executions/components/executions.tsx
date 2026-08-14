"use client";

import type { ReactNode } from "react";
import { formatDistanceToNow } from "date-fns";
import {
    EmptyView,
    EntityContainer,
    EntityHeader,
    EntityItem,
    EntityList,
    EntityPagination,
    EntityListSkeleton,
    ErrorView,
} from "@/components/entity-components";
import { useSuspenseExecutions } from "../hooks/use-execution";
import { useExecutionsParams } from "../hooks/use-executions-params";
import { ExecutionStatus, type Execution } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import {
    CheckCircle2Icon,
    ClockIcon,
    Loader2Icon,
    XCircleIcon,
} from "lucide-react";

type ExecutionListItem = Pick<
    Execution,
    "id" | "status" | "startedAt" | "completedAt"
> & {
    workflow: {
        id: string;
        name: string;
    };
};

const statusStyles: Record<
    ExecutionStatus,
    { label: string; className: string; icon: ReactNode }
> = {
    [ExecutionStatus.SUCCESS]: {
        label: "Success",
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        icon: <CheckCircle2Icon className="size-5 text-emerald-600 dark:text-emerald-400" />,
    },
    [ExecutionStatus.FAILED]: {
        label: "Failed",
        className: "bg-red-500/10 text-red-700 dark:text-red-400",
        icon: <XCircleIcon className="size-5 text-red-600 dark:text-red-400" />,
    },
    [ExecutionStatus.RUNNING]: {
        label: "Running",
        className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
        icon: <Loader2Icon className="size-5 animate-spin text-blue-600 dark:text-blue-400" />,
    },
};

function ExecutionStatusBadge({ status }: { status: ExecutionStatus }) {
    const config = statusStyles[status] ?? {
        label: "Pending",
        className: "bg-muted text-muted-foreground",
        icon: <ClockIcon className="size-5 text-muted-foreground" />,
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide",
                config.className,
            )}
        >
            {config.label}
        </span>
    );
}

export const ExecutionsList = () => {
    const executions = useSuspenseExecutions();
    const [params, setParams] = useExecutionsParams();

    return (
        <>
            <EntityList
                items={executions.data.items}
                getKey={(execution) => execution.id}
                renderItem={(execution) => <ExecutionItem data={execution} />}
                emptyView={<ExecutionsEmpty />}
            />
            <EntityPagination
                totalPages={executions.data.totalPages}
                page={executions.data.page}
                onPageChange={(page) => setParams({ ...params, page })}
            />
        </>
    );
};

export const ExecutionsHeader = () => {
    return (
        <EntityHeader
            title="Executions"
            description="Monitor workflow runs, status, and duration"
        />
    );
};

export const ExecutionsContainer = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <EntityContainer header={<ExecutionsHeader />}>
            {children}
        </EntityContainer>
    );
};

export const ExecutionsLoading = () => {
    return (
        <EntityContainer header={<ExecutionsHeader />}>
            <EntityListSkeleton />
        </EntityContainer>
    );
};

export const ExecutionsError = () => {
    return <ErrorView message="Error loading executions" />;
};

export const ExecutionsEmpty = () => {
    return (
        <EmptyView message="Run a workflow to see execution history appear here." />
    );
};

export const ExecutionItem = ({
    data,
}: {
    data: ExecutionListItem;
}) => {
    const statusConfig = statusStyles[data.status] ?? statusStyles[ExecutionStatus.RUNNING];
    const duration = data.completedAt
        ? Math.round(
            (new Date(data.completedAt).getTime() - new Date(data.startedAt).getTime()) / 1000,
        )
        : null;

    const subtitle = (
        <span suppressHydrationWarning>
            Started {formatDistanceToNow(data.startedAt, { addSuffix: true })}
            {duration !== null && <> · Completed in {duration}s</>}
        </span>
    );

    return (
        <EntityItem
            href={`/executions/${data.id}`}
            title={data.workflow.name}
            badge={<ExecutionStatusBadge status={data.status} />}
            subtitle={subtitle}
            image={statusConfig.icon}
        />
    );
};
