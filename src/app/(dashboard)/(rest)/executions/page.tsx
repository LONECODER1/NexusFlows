import { ExecutionsContainer, ExecutionsError, ExecutionsList } from "@/features/executions/components/executions";
import { executionsParamsLoader } from "@/features/executions/server/params-loader";
import { prefetchExecutions } from "@/features/executions/server/prefetch";
import { ListSection } from "@/components/list-section";
import { HydrateClient } from "@/trpc/server";
import { SearchParams } from "nuqs";

type Props = {
    searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: Props) => {
    const params = await executionsParamsLoader(searchParams);
    await prefetchExecutions(params);

    return (
        <HydrateClient>
            <ExecutionsContainer>
                <ListSection errorFallback={<ExecutionsError />}>
                    <ExecutionsList />
                </ListSection>
            </ExecutionsContainer>
        </HydrateClient>
    );
};

export default Page;
