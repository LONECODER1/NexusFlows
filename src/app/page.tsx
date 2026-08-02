import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center ">
      This is a protected comp
    </div>
  );
};
export default Page;