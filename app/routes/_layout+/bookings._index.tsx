import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { HeaderData } from "~/components/layout/header/types";
import { requireAuthSession } from "~/modules/auth";
import { requireOrganisationId } from "~/modules/organization/context.server";
import {
  generatePageMeta,
  getCurrentSearchParams,
  getParamsValues,
} from "~/utils";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import {
  setCookie,
  updateCookieWithPerPage,
  userPrefs,
} from "~/utils/cookies.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const authSession = await requireAuthSession(request);
  const { organizationId } = await requireOrganisationId(authSession, request);
  const searchParams = getCurrentSearchParams(request);
  const { page, perPageParam, search } = getParamsValues(searchParams);
  const cookie = await updateCookieWithPerPage(request, perPageParam);
  const { perPage } = cookie;

  const { prev, next } = generatePageMeta(request);

  // const { locations, totalLocations } = await getLocations({
  //   organizationId,
  //   page,
  //   perPage,
  //   search,
  // });
  // const totalPages = Math.ceil(totalLocations / perPage);

  const header: HeaderData = {
    title: "Bookings",
  };
  const modelName = {
    singular: "booking",
    plural: "bookings",
  };
  return json(
    {
      header,
      // items: locations,
      search,
      page,
      // totalItems: totalLocations,
      // totalPages,
      perPage,
      prev,
      next,
      modelName,
    },
    {
      headers: [setCookie(await userPrefs.serialize(cookie))],
    }
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.header.title) : "" },
];
