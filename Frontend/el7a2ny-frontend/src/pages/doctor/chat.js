import { Layout as DashboardLayout } from "src/layouts/dashboard/doctor/layout";
import Chat from "src/components/Chat/Chat";

const Page = () => {
  return <Chat isPatient={false} />;
};
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
