import { signIn, signOut } from "@/auth"
import { BoardsList } from "@/components/boards-list";
import { CreateBoard } from "@/components/create";
import { getUser } from "@/utils";

export default async function Home() {
  const user = await getUser();

  if (user) {
    return (
      <div className="w-[512px] mx-auto mt-2 space-y-2">
        <div className="flex justify-between mb-2 gap-2">
          <span className="bg-white dark:bg-neutral-800 grow rounded-sm p-4 ">Hello, {user.name}</span>
          <SignOut />
        </div>
        <BoardsList user={user} />
        <CreateBoard />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col gap-4 items-center justify-center">
      <h1 className="text-3xl">Kanban</h1>
      <div className="flex flex-col items-center justify-center">
        {process.env.AUTH_GITHUB_ID && <SignIn provider="GitHub" />}
        {process.env.AUTH_GOOGLE_ID && <SignIn provider="Google" />}
        <div className="hidden only:block text-red-500">Error: Signing in not available at the moment :(</div>
      </div>
    </div>
  )
}

function SignIn({ provider }: { provider: "GitHub" | "Google" }) {
  return (
    <form action={async () => {
      "use server"
      await signIn(provider.toLowerCase())
    }}>
      <button className="whitespace-nowrap cursor-pointer" type="submit">Sign in with {provider}</button>
    </form>
  )
}

function SignOut() {
  return (
    <form className="bg-white dark:bg-neutral-800 flex p-4 rounded-sm" action={async () => {
      "use server"
      await signOut()
    }}>
      <button className="whitespace-nowrap cursor-pointer" type="submit">Sign out</button>
    </form>
  )
}
