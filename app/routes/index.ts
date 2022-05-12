import { LoaderFunction, redirect } from "@remix-run/node";
import { requireUserId } from '~/utils/auth.server';

//Check if the user is in the session, else redirect to login
export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request)
  return redirect('/home')
}
