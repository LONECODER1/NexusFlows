import { CredentialsContainer, CredentialsError, CredentialsList } from "@/features/credentials/components/credentials";
import { credentialsParamsLoader } from "@/features/credentials/server/params-loader";
import { prefetchCredentials } from "@/features/credentials/server/prefetch";
import { ListSection } from "@/components/list-section";
import { HydrateClient } from "@/trpc/server";
import { SearchParams } from "nuqs";

type Props = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: Props) => {
  const params = await credentialsParamsLoader(searchParams);
  await prefetchCredentials(params);

  return (
    <HydrateClient>
      <CredentialsContainer>
        <ListSection errorFallback={<CredentialsError />}>
          <CredentialsList />
        </ListSection>
      </CredentialsContainer>
    </HydrateClient>
  );
};

export default Page;
