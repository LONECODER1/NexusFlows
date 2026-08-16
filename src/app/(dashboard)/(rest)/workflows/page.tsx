import {
    WorkflowsContainer,
    WorkflowsList,
    WorkflowsError,
} from "@/features/workflows/components/workflows";
import { workflowsParamsLoader } from "@/features/workflows/server/params-loader";
import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { ListSection } from "@/components/list-section";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import type { SearchParams } from "nuqs/server";

type Props = {
    searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }: Props) => {
    await requireAuth();
    const params = await workflowsParamsLoader(searchParams);
    await prefetchWorkflows(params);

    return (
        <HydrateClient>
            <WorkflowsContainer>
                <ListSection errorFallback={<WorkflowsError />}>
                    <WorkflowsList />
                </ListSection>
            </WorkflowsContainer>
        </HydrateClient>
    )
};

export default Page;
