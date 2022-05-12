import { LoaderFunction, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { Layout } from "~/components/Layout";
import { UserPanel } from "~/components/UserPanel";
import { requireUserId } from "~/utils/auth.server";
import { getOtherUsers } from "~/utils/users.server";
import { Kudo as IKudo, Profile, Prisma } from "@prisma/client";
import { getFilteredKudos } from "~/utils/kudos.serve";
import { Kudo } from "./home/kudo";
import { SearchBar } from "~/components/SearchBar";
import { sortOptions } from "~/utils/constants";
import { getRecentKudos } from "../utils/kudos.serve";
import { RecentBar } from "~/components/RecentBar";
import { getUser } from "~/utils/auth.server";

interface KudoWithProfile extends IKudo {
  author: {
    profile: Profile;
  };
}

//loader functions work on the server
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const sort = url.searchParams.get("sort");
  const filter = url.searchParams.get("filter");
  let sortOptions: Prisma.KudoOrderByWithRelationInput = {};
  if (sort) {
    if (sort === "date") {
      sortOptions = { createdAt: "desc" };
    }
    if (sort === "sender") {
      sortOptions = { author: { profile: { firstName: "asc" } } };
    }
    if (sort === "emoji") {
      sortOptions = { style: { emoji: "asc" } };
    }
  }

  let textFilter: Prisma.KudoWhereInput = {};
  if (filter) {
    textFilter = {
      OR: [
        { message: { mode: "insensitive", contains: filter } },
        {
          author: {
            OR: [
              {
                profile: {
                  is: { firstName: { mode: "insensitive", contains: filter } },
                },
              },
              {
                profile: {
                  is: { lastName: { mode: "insensitive", contains: filter } },
                },
              },
            ],
          },
        },
      ],
    };
  }

  const user = await getUser(request);
  const users = await getOtherUsers(userId);
  const kudos = await getFilteredKudos(userId, sortOptions, textFilter);
  const recentKudos = await getRecentKudos();
  return json({ user, users, kudos, recentKudos });
};

export default function Home() {
  const { user, users, kudos, recentKudos } = useLoaderData();
  return (
    <Layout>
      <Outlet />
      <div className="h-full flex">
        <UserPanel users={users} />
        <div className="flex-1 flex flex-col">
          <SearchBar profile={user.profile} />
          <div className="flex-1 flex">
            <div className="w-full p-10 flex flex-col gap-y-4">
              {kudos.map((kudo: KudoWithProfile) => (
                <Kudo key={kudo.id} kudo={kudo} profile={kudo.author.profile} />
              ))}
            </div>
            <RecentBar kudos={recentKudos} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
