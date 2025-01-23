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
    <div>
      <SignIn provider="GitHub" />
      <SignIn provider="Google" />
    </div>
  )
}

function SignIn({ provider }: { provider: "GitHub" | "Google" }) {
  return (
    <form action={async () => {
      "use server"
      await signIn(provider.toLowerCase())
    }}>
      <button className="whitespace-nowrap" type="submit">Sign in with {provider}</button>
    </form>
  )
}

function SignOut() {
  return (
    <form className="bg-white dark:bg-neutral-800 flex p-4 rounded-sm" action={async () => {
      "use server"
      await signOut()
    }}>
      <button className="whitespace-nowrap" type="submit">Sign out</button>
    </form>
  )
}
